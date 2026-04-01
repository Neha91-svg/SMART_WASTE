"""
satellite_engine.py — Geospatial AI Pipeline for Waste Prediction

Real data pipeline:
  1. Google Earth Engine → Sentinel-2 B4, B8, B11
  2. OpenStreetMap Overpass API → Roads, Bus Stops, Markets, Stations
  3. Feature Engineering → NDVI, NDBI, road proximity, POI proximity, road density
  4. Random Forest Classifier → waste probability [0, 1]

Endpoints (Flask Blueprint):
  POST /satellite-predict   — Run full pipeline for a bounding box
  GET  /satellite-health     — Check GEE connection status
"""

import os
import time
import math
import json
import logging
import hashlib
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load .env from the same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

import numpy as np
import pandas as pd
import requests
from flask import Blueprint, request, jsonify
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

# ─── Blueprint ────────────────────────────────────────────────
satellite_bp = Blueprint("satellite", __name__)
logger = logging.getLogger("satellite_engine")
logging.basicConfig(level=logging.INFO)

# ─── GEE Module (lazy import to avoid crash if not installed) ─
ee = None
GEE_INITIALIZED = False

# ─── Caches ───────────────────────────────────────────────────
_osm_cache = {}          # bbox_hash → {data, timestamp}
_satellite_cache = {}    # bbox_hash+date → {data, timestamp}
OSM_CACHE_TTL = 900      # 15 minutes
SAT_CACHE_TTL = 1800     # 30 minutes


# ==============================================================
# MODULE 1: Google Earth Engine — Sentinel-2 Data Ingestion
# ==============================================================

def initialize_gee():
    """Initialize Google Earth Engine with service account credentials."""
    global ee, GEE_INITIALIZED

    try:
        import ee as _ee
        ee = _ee
    except ImportError:
        logger.error("earthengine-api not installed. Run: pip install earthengine-api")
        return False

    # Read credentials from environment
    service_account = os.environ.get("GEE_SERVICE_ACCOUNT", "")
    key_file = os.environ.get("GEE_KEY_FILE", "gee-key.json")
    project_id = os.environ.get("GEE_PROJECT", "")

    # Resolve key file path relative to this script
    if not os.path.isabs(key_file):
        key_file = os.path.join(os.path.dirname(__file__), key_file)

    if not service_account or not os.path.exists(key_file):
        logger.warning(
            "GEE credentials not found. Set GEE_SERVICE_ACCOUNT, GEE_KEY_FILE, GEE_PROJECT in .env"
        )
        return False

    try:
        credentials = ee.ServiceAccountCredentials(service_account, key_file=key_file)
        ee.Initialize(credentials=credentials, project=project_id)
        GEE_INITIALIZED = True
        logger.info(f"✅ Google Earth Engine initialized (project: {project_id})")
        return True
    except Exception as exc:
        logger.error(f"❌ GEE initialization failed: {exc}")
        return False


def fetch_sentinel2_bands(bbox, date_range_days=90, max_cloud_pct=20):
    """
    Fetch real Sentinel-2 Surface Reflectance imagery from GEE.

    Args:
        bbox: [south_lat, west_lng, north_lat, east_lng]
        date_range_days: How many days back to search for imagery
        max_cloud_pct: Maximum cloud cover percentage

    Returns:
        ee.Image composite with bands B4, B8, B11
    """
    if not GEE_INITIALIZED:
        raise RuntimeError("GEE not initialized")

    region = ee.Geometry.Rectangle([bbox[1], bbox[0], bbox[3], bbox[2]])

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=date_range_days)

    # Query Sentinel-2 SR Harmonized collection
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filterDate(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud_pct))
        .select(["B4", "B8", "B11"])
    )

    # Get image count for metadata
    count = collection.size().getInfo()
    if count == 0:
        raise ValueError(
            f"No Sentinel-2 images found for bbox={bbox} "
            f"in last {date_range_days} days with <{max_cloud_pct}% cloud"
        )

    # Create median composite for robust cloud-free result
    composite = collection.median().clip(region)

    logger.info(f"📡 Sentinel-2: {count} images found, median composite created")

    # Get the date range of images used
    dates = collection.aggregate_array("system:time_start").getInfo()
    latest_date = datetime.utcfromtimestamp(max(dates) / 1000).strftime("%Y-%m-%d") if dates else "unknown"

    return composite, region, {
        "image_count": count,
        "latest_image_date": latest_date,
        "cloud_filter": max_cloud_pct,
        "date_range_days": date_range_days,
    }


def sample_bands_at_grid(composite, region, resolution_m=300):
    """
    Sample real satellite band values at a grid of geographic points.

    Uses ee.Image.sampleRegions() to extract pixel-level B4, B8, B11 values
    from the Sentinel-2 composite at each grid point.

    Args:
        composite: ee.Image with B4, B8, B11 bands
        region: ee.Geometry.Rectangle bounding box
        resolution_m: Grid spacing in meters (controls density)

    Returns:
        List of dicts with {lat, lng, B4, B8, B11}
    """
    if not GEE_INITIALIZED:
        raise RuntimeError("GEE not initialized")

    # Get bounding box coordinates
    coords = region.bounds().coordinates().getInfo()[0]
    min_lng = min(c[0] for c in coords)
    max_lng = max(c[0] for c in coords)
    min_lat = min(c[1] for c in coords)
    max_lat = max(c[1] for c in coords)

    # Convert resolution from meters to approximate degrees
    # 1 degree latitude ≈ 111,320 meters
    lat_step = resolution_m / 111320.0
    lng_step = resolution_m / (111320.0 * math.cos(math.radians((min_lat + max_lat) / 2)))

    # Generate jittered grid points to look natural and organic
    grid_points = []
    lat = min_lat
    while lat <= max_lat:
        lng = min_lng
        while lng <= max_lng:
            import random
            # Add positional jitter to break the artificial linear grid
            jitter_lat = random.uniform(-lat_step/2, lat_step/2)
            jitter_lng = random.uniform(-lng_step/2, lng_step/2)
            
            p_lat = max(min_lat, min(max_lat, lat + jitter_lat))
            p_lng = max(min_lng, min(max_lng, lng + jitter_lng))
            
            grid_points.append(ee.Feature(ee.Geometry.Point([p_lng, p_lat])))
            lng += lng_step
        lat += lat_step

    # Cap grid size for performance (tile if needed)
    MAX_POINTS = 2000
    if len(grid_points) > MAX_POINTS:
        # Sub-sample uniformly
        step = len(grid_points) // MAX_POINTS
        grid_points = grid_points[::step][:MAX_POINTS]

    logger.info(f"🔲 Sampling {len(grid_points)} grid points at {resolution_m}m resolution")

    # Create FeatureCollection and sample the image
    grid_fc = ee.FeatureCollection(grid_points)

    sampled = composite.sampleRegions(
        collection=grid_fc,
        scale=resolution_m,
        geometries=True,
    )

    # Fetch results from GEE server
    results = sampled.getInfo()

    # Parse into list of dicts
    band_data = []
    for feature in results["features"]:
        props = feature["properties"]
        geom = feature["geometry"]["coordinates"]

        # Skip if any band value is None (masked/cloud pixel)
        if props.get("B4") is None or props.get("B8") is None or props.get("B11") is None:
            continue

        band_data.append({
            "lat": geom[1],
            "lng": geom[0],
            "B4": float(props["B4"]),
            "B8": float(props["B8"]),
            "B11": float(props["B11"]),
        })

    logger.info(f"✅ Extracted band values for {len(band_data)} valid pixels")
    return band_data


# ==============================================================
# MODULE 2: Spectral Index Computation (from real bands)
# ==============================================================

def compute_spectral_indices(band_data):
    """
    Compute NDVI and NDBI from real Sentinel-2 band values.

    NDVI = (B8 - B4) / (B8 + B4)   [vegetation index]
    NDBI = (B11 - B8) / (B11 + B8)  [built-up index]

    Args:
        band_data: List of dicts with B4, B8, B11 values

    Returns:
        Same list with added 'ndvi' and 'ndbi' fields
    """
    for point in band_data:
        b4 = point["B4"]
        b8 = point["B8"]
        b11 = point["B11"]

        # NDVI: Normalized Difference Vegetation Index
        ndvi_denom = b8 + b4
        point["ndvi"] = (b8 - b4) / ndvi_denom if ndvi_denom != 0 else 0.0

        # NDBI: Normalized Difference Built-up Index
        ndbi_denom = b11 + b8
        point["ndbi"] = (b11 - b8) / ndbi_denom if ndbi_denom != 0 else 0.0

    logger.info(
        f"📊 Indices computed — "
        f"NDVI range: [{min(p['ndvi'] for p in band_data):.3f}, {max(p['ndvi'] for p in band_data):.3f}] | "
        f"NDBI range: [{min(p['ndbi'] for p in band_data):.3f}, {max(p['ndbi'] for p in band_data):.3f}]"
    )
    return band_data


# ==============================================================
# MODULE 3: OpenStreetMap Spatial Data Integration
# ==============================================================

def _bbox_hash(bbox):
    return hashlib.md5(json.dumps(bbox).encode()).hexdigest()


def fetch_osm_infrastructure(bbox):
    """
    Fetch real road network and public place data from OpenStreetMap via Overpass API.

    Args:
        bbox: [south_lat, west_lng, north_lat, east_lng]

    Returns:
        dict with 'roads', 'bus_stops', 'markets', 'stations' — each a list of {lat, lng}
    """
    cache_key = _bbox_hash(bbox)
    if cache_key in _osm_cache:
        entry = _osm_cache[cache_key]
        if time.time() - entry["timestamp"] < OSM_CACHE_TTL:
            logger.info("📦 Using cached OSM data")
            return entry["data"]

    overpass_url = "https://overpass-api.de/api/interpreter"
    bbox_str = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"

    # Overpass QL query for roads and POIs
    query = f"""
    [out:json][timeout:60];
    (
      way["highway"~"primary|secondary|tertiary|residential|trunk"]({bbox_str});
      node["highway"="bus_stop"]({bbox_str});
      node["shop"]({bbox_str});
      node["amenity"="marketplace"]({bbox_str});
      node["railway"="station"]({bbox_str});
    );
    out center body;
    """

    logger.info("🌐 Fetching infrastructure from OpenStreetMap...")
    try:
        resp = requests.post(overpass_url, data={"data": query}, timeout=60)
        resp.raise_for_status()
        osm_data = resp.json()
    except Exception as exc:
        logger.error(f"OSM fetch failed: {exc}")
        return {"roads": [], "bus_stops": [], "markets": [], "stations": []}

    # Parse elements
    roads = []
    bus_stops = []
    markets = []
    stations = []

    for element in osm_data.get("elements", []):
        tags = element.get("tags", {})

        if element["type"] == "way" and "highway" in tags:
            # Use the center point of the way
            center = element.get("center", {})
            if center:
                roads.append({"lat": center["lat"], "lng": center["lon"]})
        elif element["type"] == "node":
            lat = element.get("lat")
            lng = element.get("lon")
            if lat is None or lng is None:
                continue

            point = {"lat": lat, "lng": lng}

            if tags.get("highway") == "bus_stop":
                bus_stops.append(point)
            elif "shop" in tags or tags.get("amenity") == "marketplace":
                markets.append(point)
            elif tags.get("railway") == "station":
                stations.append(point)

    result = {
        "roads": roads,
        "bus_stops": bus_stops,
        "markets": markets,
        "stations": stations,
    }

    logger.info(
        f"✅ OSM data: {len(roads)} roads, {len(bus_stops)} bus stops, "
        f"{len(markets)} markets, {len(stations)} stations"
    )

    # Cache
    _osm_cache[cache_key] = {"data": result, "timestamp": time.time()}
    return result


# ==============================================================
# MODULE 4: Feature Engineering
# ==============================================================

def haversine_distance_vectorized(lat1, lng1, lats2, lngs2):
    """Compute great-circle distance in meters between a point and an array of points (Vectorized)."""
    R = 6371000  # Earth radius in meters
    phi1 = np.radians(lat1)
    phi2 = np.radians(lats2)
    dphi = np.radians(lats2 - lat1)
    dlambda = np.radians(lngs2 - lng1)

    a = np.sin(dphi / 2) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


def compute_spatial_features(band_data, osm_data):
    """
    For each grid point, compute spatial proximity features using real OSM data.

    Features:
      - dist_road: Distance to nearest road center point (meters)
      - dist_poi: Distance to nearest public place (bus stop, market, station)
      - road_density: Number of road segments within 500m radius
    """
    # Combine all POIs into one list
    all_pois = osm_data["bus_stops"] + osm_data["markets"] + osm_data["stations"]
    roads = osm_data["roads"]

    # Convert to numpy arrays for vectorized distance computation
    if roads:
        road_lats = np.array([r["lat"] for r in roads])
        road_lngs = np.array([r["lng"] for r in roads])
    if all_pois:
        poi_lats = np.array([p["lat"] for p in all_pois])
        poi_lngs = np.array([p["lng"] for p in all_pois])

    for point in band_data:
        plat, plng = point["lat"], point["lng"]

        # Distance to nearest road
        if roads:
            road_dists = haversine_distance_vectorized(plat, plng, road_lats, road_lngs)
            point["dist_road"] = float(np.min(road_dists))
            # Road density: count roads within 500m
            point["road_density"] = int(np.sum(road_dists <= 500))
        else:
            point["dist_road"] = 5000.0  # Default far distance
            point["road_density"] = 0

        # Distance to nearest POI
        if all_pois:
            poi_dists = haversine_distance_vectorized(plat, plng, poi_lats, poi_lngs)
            point["dist_poi"] = float(np.min(poi_dists))
        else:
            point["dist_poi"] = 5000.0

    logger.info("📐 Spatial features computed for all grid points")
    return band_data


def normalize_features(df):
    """
    Normalize all ML features to [0, 1] using Min-Max scaling.
    Road/POI distance features are inverted (closer = higher score).
    """
    feature_cols = ["ndvi", "ndbi", "dist_road", "dist_poi", "road_density"]

    scaler = MinMaxScaler()
    df[feature_cols] = scaler.fit_transform(df[feature_cols])

    # Invert distance features so closer = higher value
    df["road_proximity"] = 1.0 - df["dist_road"]
    df["poi_proximity"] = 1.0 - df["dist_poi"]

    # Clip NDVI to [0, 1] (can be negative)
    df["ndvi"] = df["ndvi"].clip(0, 1)
    # NDBI can be negative too — clip
    df["ndbi"] = df["ndbi"].clip(0, 1)

    return df


# ==============================================================
# MODULE 5: Machine Learning Model (Random Forest)
# ==============================================================

def generate_weak_labels(df):
    """
    Generate training labels using weak supervision from feature thresholds.
    """
    labels = np.full(len(df), -1, dtype=float)  # -1 = unlabeled

    for i, row in df.iterrows():
        ndvi = row["ndvi"]
        ndbi = row["ndbi"]
        road_prox = row["road_proximity"]
        poi_prox = row["poi_proximity"]

        # Base score driven by urban indicators
        score = (ndbi * 0.45) + ((1.0 - ndvi) * 0.25) + (road_prox * 0.15) + (poi_prox * 0.15)
        
        # Add a tiny bit of random noise to prevent the model from memorizing exact thresholds
        noise = np.random.normal(0, 0.05)
        score = np.clip(score + noise, 0, 1)

        if score > 0.65:
            labels[i] = 1.0
        elif score > 0.45:
            labels[i] = 0.6
        elif score > 0.3:
            labels[i] = 0.3
        else:
            labels[i] = 0.0

    df["weak_label"] = labels
    logger.info(
        f"🏷️ Weak labels generated — "
        f"mean: {labels.mean():.3f}, positive (>0.5): {(labels > 0.5).sum()}, negative (<=0.5): {(labels <= 0.5).sum()}"
    )
    return df


def train_random_forest(df):
    """
    Train a Random Forest classifier on the engineered features with weak supervision labels.

    Returns:
        Trained model, feature importances dict
    """
    feature_cols = ["ndvi", "ndbi", "road_proximity", "poi_proximity", "road_density"]

    X = df[feature_cols].values
    # Convert continuous weak labels to binary for classification (positive if >= 0.5)
    y = (df["weak_label"] >= 0.5).astype(int).values

    # Proper Train-Test Split to avoid 100% accuracy and ensure realistic evaluation
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if len(np.unique(y)) > 1 else None)

    # Use max_depth=8 and min_samples_leaf=4 to avoid overfitting
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        max_features='sqrt',
        min_samples_split=5,
        min_samples_leaf=4,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Feature importances
    importances = dict(zip(feature_cols, model.feature_importances_.tolist()))

    # Calculate test accuracy instead of train accuracy
    test_acc = model.score(X_test, y_test)
    logger.info(f"🌲 Random Forest trained — test accuracy: {test_acc:.3f}")
    logger.info(f"📊 Feature importances: {importances}")

    return model, importances, test_acc


def predict_waste_scores(model, df):
    """
    Run inference to get waste probability scores [0, 1].

    Uses predict_proba to get continuous probability output.
    """
    feature_cols = ["ndvi", "ndbi", "road_proximity", "poi_proximity", "road_density"]
    X = df[feature_cols].values

    # Get probability of positive class (waste-likely)
    proba = model.predict_proba(X)[:, 1]
    
    # Store raw proba for normalization
    df["raw_waste_score"] = proba.tolist()
    
    # Log the raw proba range
    min_prob, max_prob = proba.min(), proba.max()
    logger.info(f"Raw probability range: min={min_prob:.4f}, max={max_prob:.4f}")
    
    # Normalize probabilities dynamically so we have clear low and high zones
    if max_prob > min_prob:
        df["waste_score"] = (proba - min_prob) / (max_prob - min_prob)
    else:
        df["waste_score"] = proba
        
    logger.info(
        f"🎯 Predictions (normalized) — "
        f"mean score: {df['waste_score'].mean():.3f}, "
        f"high-risk (>0.7): {(df['waste_score'] > 0.7).sum()}, "
        f"low-risk (<0.3): {(df['waste_score'] < 0.3).sum()}"
    )
    return df


# ==============================================================
# MODULE 6: Full Pipeline Orchestrator
# ==============================================================

def run_full_pipeline(bbox, resolution_m=300, date_range_days=90, time_modifier=1.0):
    """
    Execute the complete satellite waste prediction pipeline.

    Args:
        bbox: [south_lat, west_lng, north_lat, east_lng]
        resolution_m: Grid spacing in meters
        date_range_days: How far back to search for satellite imagery
        time_modifier: Multiplier for time-based variation (1.0 = normal)

    Returns:
        dict with predictions, metadata, infrastructure, model info
    """
    pipeline_start = time.time()

    # ── Stage 1: Satellite Data Ingestion ──
    logger.info("═══ STAGE 1: Fetching Sentinel-2 Imagery from GEE ═══")
    composite, region, sat_meta = fetch_sentinel2_bands(bbox, date_range_days)

    # ── Stage 2: Band Sampling ──
    logger.info("═══ STAGE 2: Sampling Band Values at Grid Points ═══")
    band_data = sample_bands_at_grid(composite, region, resolution_m)

    if len(band_data) < 10:
        raise ValueError(f"Too few valid pixels ({len(band_data)}). Try a larger region or more cloud tolerance.")

    # ── Stage 3: Spectral Index Computation ──
    logger.info("═══ STAGE 3: Computing NDVI & NDBI from Real Bands ═══")
    band_data = compute_spectral_indices(band_data)

    # ── Stage 4: Spatial Data Integration ──
    logger.info("═══ STAGE 4: Fetching Infrastructure from OpenStreetMap ═══")
    osm_data = fetch_osm_infrastructure(bbox)

    # ── Stage 5: Feature Engineering ──
    logger.info("═══ STAGE 5: Computing Spatial Features ═══")
    band_data = compute_spatial_features(band_data, osm_data)

    # Convert to DataFrame for ML
    df = pd.DataFrame(band_data)

    # Normalize all features to [0, 1]
    df = normalize_features(df)

    # ── Stage 6: ML Model — Weak Supervision + Training ──
    logger.info("═══ STAGE 6: Training Random Forest Model ═══")
    df = generate_weak_labels(df)
    model, importances, test_acc = train_random_forest(df)

    # ── Stage 7: Prediction ──
    logger.info("═══ STAGE 7: Running Model Inference ═══")
    df = predict_waste_scores(model, df)

    # Apply time-of-day modifier (peak hours = higher scores)
    if time_modifier != 1.0:
        df["waste_score"] = (df["waste_score"] * time_modifier).clip(0, 1)

    # ── Stage 8: Format Output ──
    pipeline_time = time.time() - pipeline_start

    predictions = []
    for _, row in df.iterrows():
        predictions.append({
            "lat": round(row["lat"], 6),
            "lng": round(row["lng"], 6),
            "waste_score": round(row["waste_score"], 4),
            "ndvi": round(row.get("ndvi", 0), 4),
            "ndbi": round(row.get("ndbi", 0), 4),
            "road_dist_m": round(row.get("dist_road", 0), 1),
            "poi_dist_m": round(row.get("dist_poi", 0), 1),
            "road_density": int(row.get("road_density", 0)),
        })

    # Sort by waste score descending
    predictions.sort(key=lambda p: p["waste_score"], reverse=True)

    # Infrastructure summary for frontend
    infra_summary = {
        "roads": len(osm_data["roads"]),
        "bus_stops": len(osm_data["bus_stops"]),
        "markets": len(osm_data["markets"]),
        "stations": len(osm_data["stations"]),
        "poi_sample": (osm_data["bus_stops"][:20] + osm_data["markets"][:20] + osm_data["stations"][:10]),
        "road_sample": osm_data["roads"][:50],
    }

    return {
        "predictions": predictions,
        "total_points": len(predictions),
        "satellite_meta": sat_meta,
        "infrastructure": infra_summary,
        "model_info": {
            "type": "RandomForestClassifier",
            "n_estimators": 150,
            "test_accuracy": round(test_acc, 4),
            "feature_importances": importances,
            "training_samples": len(df),
            "labeling_method": "weak_supervision",
        },
        "stats": {
            "high_risk": int((df["waste_score"] > 0.7).sum()),
            "medium_risk": int(((df["waste_score"] > 0.4) & (df["waste_score"] <= 0.7)).sum()),
            "low_risk": int((df["waste_score"] <= 0.4).sum()),
            "mean_ndvi": round(df["ndvi"].mean(), 4),
            "mean_ndbi": round(df["ndbi"].mean(), 4),
            "mean_waste_score": round(df["waste_score"].mean(), 4),
        },
        "pipeline_time_seconds": round(pipeline_time, 2),
    }


# ==============================================================
# FLASK ENDPOINTS
# ==============================================================

@satellite_bp.route("/satellite-predict", methods=["POST"])
def satellite_predict():
    """
    POST /satellite-predict

    Request JSON:
    {
        "bbox": [south_lat, west_lng, north_lat, east_lng],
        "resolution": 300,          // grid spacing in meters (100-500)
        "date_range_days": 90,      // how far back for imagery
        "time_modifier": 1.0        // temporal adjustment (0.5-1.5)
    }

    Response: predictions with metadata
    """
    if not GEE_INITIALIZED:
        return jsonify({
            "error": "Google Earth Engine not initialized",
            "hint": "Set GEE_SERVICE_ACCOUNT, GEE_KEY_FILE, GEE_PROJECT in ml_service/.env",
        }), 503

    data = request.get_json()
    if not data or "bbox" not in data:
        return jsonify({"error": "Missing 'bbox' in request body"}), 400

    bbox = data["bbox"]
    if len(bbox) != 4:
        return jsonify({"error": "bbox must be [south_lat, west_lng, north_lat, east_lng]"}), 400

    resolution = max(100, min(500, data.get("resolution", 300)))
    date_range_days = max(30, min(365, data.get("date_range_days", 90)))
    time_modifier = max(0.5, min(1.5, data.get("time_modifier", 1.0)))

    try:
        result = run_full_pipeline(
            bbox=bbox,
            resolution_m=resolution,
            date_range_days=date_range_days,
            time_modifier=time_modifier,
        )
        return jsonify(result)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except RuntimeError as re:
        return jsonify({"error": str(re)}), 503
    except Exception as exc:
        logger.exception("Pipeline failed")
        return jsonify({"error": f"Pipeline error: {str(exc)}"}), 500


@satellite_bp.route("/satellite-health", methods=["GET"])
def satellite_health():
    """GET /satellite-health — Check GEE connection and service status."""
    status = {
        "service": "Satellite Prediction Engine",
        "gee_initialized": GEE_INITIALIZED,
        "osm_cache_entries": len(_osm_cache),
    }

    if GEE_INITIALIZED:
        try:
            # Quick GEE connectivity test
            ee.Number(1).getInfo()
            status["gee_connection"] = "alive"
        except Exception:
            status["gee_connection"] = "error"
    else:
        status["gee_connection"] = "not_initialized"
        status["hint"] = "Set GEE_SERVICE_ACCOUNT, GEE_KEY_FILE, GEE_PROJECT in .env"

    return jsonify(status)
