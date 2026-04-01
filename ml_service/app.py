"""
app.py — Flask Prediction Server for Garbage Intensity

Serves a trained Random Forest model via REST API.
Node.js backend forwards requests here for predictions.

Endpoints:
  POST /predict   — Predict garbage intensity for given locations/time
  GET  /health    — Health check
  GET  /model-info — Model metadata
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ─── Load Model & Metadata ───────────────────────────────────
MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
META_PATH = os.path.join(MODEL_DIR, "model_meta.json")

model = None
model_meta = None

# Known Mumbai area profiles for feature enrichment
AREA_PROFILES = {
    "Bandra West":    {"pop_density": 0.90, "market_score": 0.80},
    "Andheri East":   {"pop_density": 0.85, "market_score": 0.90},
    "Juhu Beach":     {"pop_density": 0.50, "market_score": 0.30},
    "Dadar Station":  {"pop_density": 0.95, "market_score": 0.95},
    "Worli Sea Face": {"pop_density": 0.60, "market_score": 0.40},
    "CST Area":       {"pop_density": 0.92, "market_score": 0.85},
    "Sion":           {"pop_density": 0.70, "market_score": 0.60},
    "Powai Lake":     {"pop_density": 0.55, "market_score": 0.35},
    "Mahim Beach":    {"pop_density": 0.65, "market_score": 0.50},
    "Mulund West":    {"pop_density": 0.60, "market_score": 0.55},
    "Thane Station":  {"pop_density": 0.80, "market_score": 0.75},
    "Prabhadevi":     {"pop_density": 0.75, "market_score": 0.70},
    "Kurla West":     {"pop_density": 0.78, "market_score": 0.65},
    "Bandra East":    {"pop_density": 0.72, "market_score": 0.60},
    "Goregaon East":  {"pop_density": 0.68, "market_score": 0.70},
    "Lower Parel":    {"pop_density": 0.82, "market_score": 0.78},
    "Chembur":        {"pop_density": 0.65, "market_score": 0.55},
    "Malad":          {"pop_density": 0.70, "market_score": 0.65},
    "Borivali":       {"pop_density": 0.72, "market_score": 0.60},
    "Mahalaxmi":      {"pop_density": 0.60, "market_score": 0.50},
    "Wadala":         {"pop_density": 0.68, "market_score": 0.58},
    "Kandivali":      {"pop_density": 0.74, "market_score": 0.62},
    "Vile Parle":     {"pop_density": 0.76, "market_score": 0.72},
}

# Reference points for nearest-neighbor area matching
AREA_COORDS = {
    "Bandra West": (19.0596, 72.8295), "Andheri East": (19.1136, 72.8697),
    "Juhu Beach": (19.1075, 72.8263), "Dadar Station": (19.0178, 72.8478),
    "Worli Sea Face": (19.0002, 72.8155), "CST Area": (19.0759, 72.8776),
    "Sion": (19.0896, 72.8656), "Powai Lake": (19.1334, 72.9133),
    "Mahim Beach": (19.0544, 72.8406), "Mulund West": (19.1763, 72.9486),
    "Thane Station": (19.2183, 72.9781), "Prabhadevi": (19.0430, 72.8200),
    "Kurla West": (19.1197, 72.9052), "Bandra East": (19.0657, 72.8370),
    "Goregaon East": (19.1550, 72.8494), "Lower Parel": (19.0300, 72.8350),
    "Chembur": (19.0850, 72.8900), "Malad": (19.1450, 72.8350),
    "Borivali": (19.2000, 72.8600), "Mahalaxmi": (19.0100, 72.8300),
    "Wadala": (19.0650, 72.8700), "Kandivali": (19.1700, 72.8500),
    "Vile Parle": (19.1000, 72.8500),
}


def find_nearest_area(lat, lng):
    """Find the nearest known area for a given coordinate."""
    min_dist = float("inf")
    nearest = "CST Area"  # fallback
    for area, (alat, alng) in AREA_COORDS.items():
        dist = (lat - alat) ** 2 + (lng - alng) ** 2
        if dist < min_dist:
            min_dist = dist
            nearest = area
    return nearest


def load_model():
    """Load the trained model and metadata."""
    global model, model_meta

    if not os.path.exists(MODEL_PATH):
        print("⚠️  model.pkl not found — run train_model.py first")
        return False

    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}")

    if os.path.exists(META_PATH):
        with open(META_PATH) as f:
            model_meta = json.load(f)
        print(f"📋 Model metadata loaded (R²={model_meta['metrics']['r2']})")

    return True


# ─── API Endpoints ────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "model_loaded": model is not None,
        "service": "Garbage Prediction ML Service",
    })


@app.route("/model-info", methods=["GET"])
def model_info():
    if model_meta is None:
        return jsonify({"error": "No model metadata available"}), 404
    return jsonify(model_meta)


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict garbage intensity for given locations and time.

    Request JSON:
    {
        "locations": [{"lat": 19.07, "lng": 72.87}, ...],
        "target_hour": 10,        // 0-23
        "target_day": 5           // 0=Mon, 6=Sun
    }

    Response JSON:
    {
        "predictions": [{"lat": ..., "lng": ..., "intensity": 0.82, "area": "CST Area"}, ...],
        "model_info": {"type": "RandomForest", "r2": 0.87}
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json()
    if not data or "locations" not in data:
        return jsonify({"error": "Missing 'locations' in request body"}), 400

    locations = data["locations"]
    target_hour = data.get("target_hour", 10)
    target_day = data.get("target_day", 0)
    is_weekend = 1 if target_day >= 5 else 0

    # Build feature matrix
    rows = []
    area_labels = []
    for loc in locations:
        lat = loc.get("lat", 19.076)
        lng = loc.get("lng", 72.877)
        area = find_nearest_area(lat, lng)
        profile = AREA_PROFILES.get(area, {"pop_density": 0.5, "market_score": 0.5})
        area_labels.append(area)

        rows.append({
            "latitude": lat,
            "longitude": lng,
            "hour": target_hour,
            "day_of_week": target_day,
            "is_weekend": is_weekend,
            "population_density": profile["pop_density"],
            "market_proximity": profile["market_score"],
        })

    df = pd.DataFrame(rows)
    predictions = model.predict(df)
    predictions = np.clip(predictions, 0.0, 1.0)

    results = []
    for i, loc in enumerate(locations):
        results.append({
            "lat": loc["lat"],
            "lng": loc["lng"],
            "intensity": round(float(predictions[i]), 4),
            "area": area_labels[i],
        })

    return jsonify({
        "predictions": results,
        "params": {
            "target_hour": target_hour,
            "target_day": target_day,
            "is_weekend": bool(is_weekend),
        },
        "model_info": {
            "type": "RandomForest",
            "r2": model_meta["metrics"]["r2"] if model_meta else None,
        },
    })


# ─── Satellite Prediction Module ──────────────────────────────

from satellite_engine import satellite_bp, initialize_gee
app.register_blueprint(satellite_bp)

# ─── Main ─────────────────────────────────────────────────────

if __name__ == "__main__":
    # Attempt GEE initialization (non-blocking if credentials missing)
    initialize_gee()

    if load_model():
        print("\n🚀 ML Prediction Server starting on http://localhost:5001")
        app.run(host="0.0.0.0", port=5001, debug=False)
    else:
        print("\n❌ Cannot start server without a trained model.")
        print("   Run: python generate_data.py && python train_model.py")
