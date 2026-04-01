import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { getSatellitePrediction, getSatelliteHealth } from '../services/api';
import {
  MdSatelliteAlt, MdRefresh, MdThermostat, MdLayers,
  MdAutoGraph, MdLocationOn, MdDirectionsBus, MdStorefront,
  MdTrain, MdTimeline, MdTune, MdWarning, MdCheckCircle,
  MdGrain, MdPsychology, MdInfo,
} from 'react-icons/md';

// ─── Constants ───────────────────────────────────────────────
const MAP_CENTER = [19.0760, 72.8777];

const MUMBAI_PRESETS = [
  { name: 'Mumbai City', bbox: [18.89, 72.77, 19.28, 72.98] },
  { name: 'South Mumbai', bbox: [18.90, 72.80, 19.05, 72.88] },
  { name: 'Bandra–Andheri', bbox: [19.04, 72.82, 19.14, 72.88] },
  { name: 'Thane Region', bbox: [19.15, 72.93, 19.25, 73.02] },
];

const HEAT_GRADIENT = {
  0.2: 'blue',
  0.4: 'cyan',
  0.6: 'lime',
  0.8: 'yellow',
  1.0: 'red'
};

const HOURS_LABELS = [
  { label: 'Night (0.7x)', value: 0.7 },
  { label: 'Morning (0.9x)', value: 0.9 },
  { label: 'Normal (1.0x)', value: 1.0 },
  { label: 'Peak (1.2x)', value: 1.2 },
  { label: 'Rush Hour (1.4x)', value: 1.4 },
];

// ─── Heat Layer ──────────────────────────────────────────────
function HeatLayer({ points, gradient }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || points.length === 0) return;
    if (layerRef.current) map.removeLayer(layerRef.current);
    
    layerRef.current = L.heatLayer(points, {
      radius: 40, blur: 25, maxZoom: 14, max: 1.0, minOpacity: 0.3,
      gradient: gradient,
    }).addTo(map);

    return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [map, points, gradient]);

  return null;
}

// ─── Map bounds fitter ───────────────────────────────────────
function FitBounds({ bbox }) {
  const map = useMap();
  useEffect(() => {
    if (bbox) {
      map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: [20, 20] });
    }
  }, [bbox, map]);
  return null;
}

// ─── Marker icon ─────────────────────────────────────────────
const poiIcon = (color, size = 8) => L.divIcon({
  html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

// ==============================================================
// MAIN PAGE
// ==============================================================
export default function SatellitePrediction() {
  const [predictions, setPredictions] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);
  const [infrastructure, setInfrastructure] = useState(null);
  const [satMeta, setSatMeta] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [pipelineTime, setPipelineTime] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geeStatus, setGeeStatus] = useState(null);

  // Controls
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customBbox, setCustomBbox] = useState(MUMBAI_PRESETS[0].bbox);
  const [resolution, setResolution] = useState(500);
  const [timeModifier, setTimeModifier] = useState(1.0);
  const [dateRange, setDateRange] = useState(90);

  // Layer toggles
  const [showHeat, setShowHeat] = useState(true);
  const [showBusStops, setShowBusStops] = useState(false);
  const [showMarkets, setShowMarkets] = useState(false);
  const [showStations, setShowStations] = useState(true);
  const [showRoads, setShowRoads] = useState(false);

  // Check GEE health on mount
  useEffect(() => {
    getSatelliteHealth()
      .then(res => setGeeStatus(res.data))
      .catch(() => setGeeStatus({ gee_initialized: false }));
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSatellitePrediction({
        bbox: customBbox,
        resolution,
        date_range_days: dateRange,
        time_modifier: timeModifier,
      });
      const data = res.data;
      setPredictions(data.predictions);
      
      // ORGANIC SCATTER: Allow top 150 points. Since we added random jitter,
      // they will form organic clusters instead of an artificial grid!
      const sortedPredictions = [...data.predictions].sort((a, b) => b.waste_score - a.waste_score);
      const strictHotspots = sortedPredictions.slice(0, 150);
      
      // Pass the intensity
      setHeatPoints(strictHotspots.map(p => [p.lat, p.lng, p.waste_score]));
      
      setInfrastructure(data.infrastructure);
      setSatMeta(data.satellite_meta);
      setModelInfo(data.model_info);
      setStats(data.stats);
      setPipelineTime(data.pipeline_time_seconds);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.hint || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatPct = (v) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <MdSatelliteAlt className="text-indigo-500" />
            Satellite AI Prediction
          </h1>
          <p className="page-subtitle">
            Geospatial waste detection using real Sentinel-2 multispectral imagery + ML.
          </p>
        </div>

        {/* GEE Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
          geeStatus?.gee_initialized
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {geeStatus?.gee_initialized ? <MdCheckCircle size={16} /> : <MdWarning size={16} />}
          GEE: {geeStatus?.gee_initialized ? 'Connected' : 'Not Initialized'}
        </div>
      </div>

      {/* Control Panel */}
      <div className="premium-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          {/* Region Selector */}
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Region</label>
            <div className="flex flex-wrap gap-2">
              {MUMBAI_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedPreset(i); setCustomBbox(preset.bbox); }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    selectedPreset === i
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div className="w-36">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MdGrain size={12} /> Resolution
            </label>
            <select
              value={resolution}
              onChange={e => setResolution(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value={100}>100m (Fine)</option>
              <option value={200}>200m</option>
              <option value={300}>300m</option>
              <option value={500}>500m (Fast Default)</option>
            </select>
          </div>

          {/* Time Modifier */}
          <div className="w-40">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MdTimeline size={12} /> Time Factor
            </label>
            <select
              value={timeModifier}
              onChange={e => setTimeModifier(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {HOURS_LABELS.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="w-32">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MdAutoGraph size={12} /> Imagery
            </label>
            <select
              value={dateRange}
              onChange={e => setDateRange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
            </select>
          </div>

          {/* Run Button */}
          <button
            onClick={runPrediction}
            disabled={loading || !geeStatus?.gee_initialized}
            className="btn-premium px-6 py-3 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdSatelliteAlt size={18} />
            )}
            {loading ? 'Analyzing...' : 'Run Prediction'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="premium-card p-4 bg-red-50 border-red-100 flex items-start gap-3">
          <MdWarning className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-red-700">Pipeline Error</p>
            <p className="text-xs text-red-600 font-medium mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 premium-card overflow-hidden p-2 relative" style={{ minHeight: '600px' }}>
          {/* Mode Badge */}
          <div className="absolute top-4 left-4 z-[500]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm bg-indigo-500/90 text-white">
              <MdSatelliteAlt size={14} />
              SENTINEL-2 AI {satMeta ? `— ${satMeta.image_count} images` : ''}
            </div>
          </div>

          {/* Layer Toggles */}
          {predictions.length > 0 && (
            <div className="absolute top-4 right-4 z-[500] flex flex-col gap-1.5">
              {[
                { label: 'Heatmap', active: showHeat, toggle: () => setShowHeat(v => !v), icon: MdThermostat },
                { label: 'Bus Stops', active: showBusStops, toggle: () => setShowBusStops(v => !v), icon: MdDirectionsBus },
                { label: 'Markets', active: showMarkets, toggle: () => setShowMarkets(v => !v), icon: MdStorefront },
                { label: 'Stations', active: showStations, toggle: () => setShowStations(v => !v), icon: MdTrain },
                { label: 'Roads', active: showRoads, toggle: () => setShowRoads(v => !v), icon: MdLocationOn },
              ].map(({ label, active, toggle, icon: Icon }) => (
                <button
                  key={label}
                  onClick={toggle}
                  className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-lg text-[10px] font-bold border shadow-sm transition-all ${
                    active ? 'bg-white/95 text-indigo-700 border-indigo-200' : 'bg-white/60 text-slate-400 border-slate-200'
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-[600] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="spinner-premium mb-4"></div>
              <p className="text-sm font-bold text-slate-600">Processing Satellite Pipeline...</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">GEE → NDVI/NDBI → OSM → Random Forest → Predictions</p>
            </div>
          )}

          <div className="w-full h-full rounded-xl overflow-hidden relative z-0">
            <MapContainer center={MAP_CENTER} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              />

              <FitBounds bbox={customBbox} />

              {/* Heatmap Layer */}
              {showHeat && heatPoints.length > 0 && (
                <HeatLayer points={heatPoints} gradient={HEAT_GRADIENT} />
              )}

              {/* Infrastructure Markers */}
              {showBusStops && infrastructure?.poi_sample?.filter(p => p).map((p, i) => {
                if (!p.lat || !p.lng) return null;
                return (
                  <CircleMarker key={`bus-${i}`} center={[p.lat, p.lng]} radius={4} pathOptions={{ color: '#2196F3', fillColor: '#2196F3', fillOpacity: 0.8, weight: 1 }}>
                    <Popup><div className="text-xs font-bold">Bus Stop / Market</div></Popup>
                  </CircleMarker>
                );
              })}

              {showMarkets && infrastructure?.poi_sample?.map((p, i) => {
                if (!p?.lat || !p?.lng) return null;
                return (
                  <CircleMarker key={`mkt-${i}`} center={[p.lat, p.lng]} radius={4} pathOptions={{ color: '#FF9800', fillColor: '#FF9800', fillOpacity: 0.8, weight: 1 }}>
                    <Popup><div className="text-xs font-bold">Market / Shop</div></Popup>
                  </CircleMarker>
                );
              })}

              {showStations && infrastructure?.poi_sample?.filter(p => p).slice(-10).map((p, i) => (
                <Marker key={`stn-${i}`} position={[p.lat, p.lng]} icon={poiIcon('#E91E63', 10)}>
                  <Popup><div className="text-xs font-bold">Railway Station</div></Popup>
                </Marker>
              ))}

              {showRoads && infrastructure?.road_sample?.map((r, i) => (
                <CircleMarker key={`rd-${i}`} center={[r.lat, r.lng]} radius={2} pathOptions={{ color: '#78909C', fillColor: '#78909C', fillOpacity: 0.6, weight: 0.5 }} />
              ))}

              {/* Top hotspot markers (top 15 highest score) */}
              {predictions.slice(0, 15).map((p, i) => (
                <Marker key={`top-${i}`} position={[p.lat, p.lng]} icon={poiIcon(p.waste_score > 0.8 ? '#F44336' : '#FF9800', 10)}>
                  <Popup>
                    <div className="min-w-[180px] font-sans">
                      <strong className="text-sm font-bold text-slate-800 block mb-2">Hotspot #{i + 1}</strong>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">Waste Score</span><span className="font-bold text-red-600">{formatPct(p.waste_score)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">NDVI</span><span className="font-bold text-emerald-600">{p.ndvi?.toFixed(3)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">NDBI</span><span className="font-bold text-amber-600">{p.ndbi?.toFixed(3)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">Road Dist</span><span>{p.road_dist_m?.toFixed(0)}m</span></div>
                        <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px] uppercase">POI Dist</span><span>{p.poi_dist_m?.toFixed(0)}m</span></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Analytics Panel */}
        <div className="space-y-5 flex flex-col">
          {/* Satellite Metadata */}
          {satMeta && (
            <div className="premium-card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
              <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdSatelliteAlt size={14} /> Sentinel-2 Data
              </h3>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="font-bold text-slate-500">Images Used</span><span className="font-bold text-indigo-700">{satMeta.image_count}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Latest Image</span><span className="font-bold text-indigo-700">{satMeta.latest_image_date}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Cloud Filter</span><span className="font-bold text-indigo-700">&lt;{satMeta.cloud_filter}%</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Bands</span><span className="font-bold text-indigo-700">B4, B8, B11</span></div>
              </div>
            </div>
          )}

          {/* Intensity Scale */}
          <div className="premium-card p-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdThermostat size={14} /> Hotspot Detection Map (Top 5%)
            </h3>
            <div
              className="h-3 rounded-full mb-4 shadow-inner"
              style={{ background: 'linear-gradient(to right, blue 0%, cyan 25%, lime 50%, yellow 75%, red 100%)' }}
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Low Heat</span><span>Medium</span><span>High Heat</span>
            </div>
            <div className="space-y-2 text-[12px] font-bold text-slate-600">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[lime]" /> Moderate Anomaly</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[yellow]" /> High Risk Zone</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[red]" /> Critical Accumulation</div>
            </div>
          </div>

          {/* Risk Stats */}
          {stats && (
            <div className="premium-card p-5">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MdAutoGraph size={14} /> Prediction Results
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">High Risk</p>
                  <p className="text-2xl font-black text-red-600">{stats.high_risk}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Medium</p>
                  <p className="text-2xl font-black text-amber-600">{stats.medium_risk}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Low Risk</p>
                  <p className="text-2xl font-black text-emerald-600">{stats.low_risk}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Score</p>
                  <p className="text-2xl font-black text-slate-800">{formatPct(stats.mean_waste_score)}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Mean NDVI</span>
                  <span className="font-bold text-emerald-700">{stats.mean_ndvi?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Mean NDBI</span>
                  <span className="font-bold text-amber-700">{stats.mean_ndbi?.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ML Model Info */}
          {modelInfo && (
            <div className="premium-card p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
              <h3 className="text-xs font-extrabold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdPsychology size={14} /> ML Model
              </h3>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="font-bold text-slate-500">Type</span><span className="font-bold text-violet-700">{modelInfo.type}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Test Accuracy</span><span className="font-bold text-violet-700">{formatPct(modelInfo.test_accuracy || modelInfo.training_accuracy)}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Training Samples</span><span className="font-bold text-violet-700">{modelInfo.training_samples}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Labels</span><span className="font-bold text-violet-700">{modelInfo.labeling_method}</span></div>
              </div>
              {modelInfo.feature_importances && (
                <div className="mt-3 pt-3 border-t border-violet-100">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Feature Importances</p>
                  {Object.entries(modelInfo.feature_importances).sort((a, b) => b[1] - a[1]).map(([feat, imp]) => (
                    <div key={feat} className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 bg-violet-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: `${imp * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 w-24 truncate">{feat}</span>
                      <span className="text-[10px] font-bold text-violet-700 w-10 text-right">{(imp * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Infrastructure Summary */}
          {infrastructure && (
            <div className="premium-card p-5">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdLocationOn size={14} /> OSM Infrastructure
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-lg font-black text-slate-800">{infrastructure.roads}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Roads</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-lg font-black text-blue-700">{infrastructure.bus_stops}</p>
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Bus Stops</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-lg font-black text-amber-700">{infrastructure.markets}</p>
                  <p className="text-[9px] font-bold text-amber-400 uppercase">Markets</p>
                </div>
                <div className="text-center p-2 bg-pink-50 rounded-lg border border-pink-100">
                  <p className="text-lg font-black text-pink-700">{infrastructure.stations}</p>
                  <p className="text-[9px] font-bold text-pink-400 uppercase">Stations</p>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Time */}
          {pipelineTime && (
            <div className="premium-card p-3 text-center bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pipeline Time</p>
              <p className="text-sm font-bold text-slate-700">{pipelineTime}s</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
