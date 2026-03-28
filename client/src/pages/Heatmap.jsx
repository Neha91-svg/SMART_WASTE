import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { getWasteData } from '../services/api';
import { MdGpsFixed, MdLayers, MdRefresh, MdThermostat } from 'react-icons/md';

// ─── Constants ───────────────────────────────────────────────
const MAP_CENTER = [19.0760, 72.8777]; // Mumbai
const WASTE_LEVEL_INTENSITY = { High: 1.0, Medium: 0.6, Low: 0.25 };
const LEVEL_COLORS = { High: '#F43F5E', Medium: '#F59E0B', Low: '#10B981' };

const HEAT_GRADIENT = {
  0.0: '#22c55e',  // green  — low garbage
  0.3: '#4ade80',
  0.5: '#facc15',  // yellow — medium
  0.7: '#f59e0b',
  0.85: '#ef4444', // red    — high garbage
  1.0: '#dc2626',
};

const HEAT_OPTIONS = {
  radius: 25,
  blur: 15,
  maxZoom: 17,
  gradient: HEAT_GRADIENT,
  minOpacity: 0.35,
};

// ─── Marker icon builder ─────────────────────────────────────
const getMarkerHtml = (color) => `
  <div style="
    background: ${color};
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 2.5px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  "></div>
`;

// ─── Heat Layer (imperative React‑Leaflet component) ─────────
function HeatLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || points.length === 0) return;

    // Remove old layer if exists
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Create new heat layer:  [lat, lng, intensity]
    layerRef.current = L.heatLayer(points, HEAT_OPTIONS).addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, points]);

  return null;
}

// ─── Utility: convert API waste reports → heatmap points ─────
function toHeatPoints(data) {
  return data.map((w) => [
    w.location.lat,
    w.location.lng,
    WASTE_LEVEL_INTENSITY[w.wasteLevel] ?? 0.3,
  ]);
}

// ─── Heatmap Page ────────────────────────────────────────────
export default function Heatmap() {
  const [wasteData, setWasteData] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Stats derived from data
  const stats = {
    total: wasteData.length,
    high: wasteData.filter((w) => w.wasteLevel === 'High').length,
    medium: wasteData.filter((w) => w.wasteLevel === 'Medium').length,
    low: wasteData.filter((w) => w.wasteLevel === 'Low').length,
  };

  // ── Fetch data ──
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getWasteData();
      const reports = res.data.data;
      setWasteData(reports);
      setHeatPoints(toHeatPoints(reports));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch waste data for heatmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="spinner-premium mx-auto mb-4"></div>
          <p className="text-slate-500 font-semibold tracking-wide">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Garbage Heatmap</h1>
          <p className="page-subtitle">
            Real‑time density visualization of waste hotspots across the city.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Markers */}
          <button
            onClick={() => setShowMarkers((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
              showMarkers
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <MdLayers size={18} />
            {showMarkers ? 'Markers On' : 'Markers Off'}
          </button>

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="btn-premium px-5 py-2.5 flex items-center gap-2"
          >
            <MdRefresh size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Leaflet Map */}
        <div
          className="lg:col-span-3 premium-card overflow-hidden p-2 relative"
          style={{ minHeight: '550px' }}
        >
          <div className="w-full h-full rounded-xl overflow-hidden relative z-0">
            <MapContainer
              center={MAP_CENTER}
              zoom={12}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              />

              {/* Heatmap layer */}
              <HeatLayer points={heatPoints} />

              {/* Optional markers on top */}
              {showMarkers &&
                wasteData.map((waste, i) => {
                  const color = LEVEL_COLORS[waste.wasteLevel] || '#10B981';
                  const icon = L.divIcon({
                    html: getMarkerHtml(color),
                    className: '',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                  });

                  return (
                    <Marker
                      key={waste._id || i}
                      position={[waste.location.lat, waste.location.lng]}
                      icon={icon}
                    >
                      <Popup className="premium-popup">
                        <div className="min-w-[200px] font-sans">
                          <strong className="text-[14px] font-bold text-slate-800 block mb-2">
                            {waste.address || 'Reported Location'}
                          </strong>
                          <div className="text-xs text-slate-600 font-medium space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                Severity
                              </span>
                              <span
                                style={{ color: LEVEL_COLORS[waste.wasteLevel] }}
                                className="font-bold"
                              >
                                {waste.wasteLevel}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                Category
                              </span>
                              <span>{waste.wasteType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                Status
                              </span>
                              <span className="text-slate-800 font-bold">
                                {waste.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-6 flex flex-col lg:max-h-[550px]">
          {/* Intensity Legend */}
          <div className="premium-card p-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdThermostat size={14} /> Intensity Scale
            </h3>

            {/* Gradient bar */}
            <div
              className="h-3 rounded-full mb-4 shadow-inner"
              style={{
                background:
                  'linear-gradient(to right, #22c55e 0%, #facc15 50%, #ef4444 85%, #dc2626 100%)',
              }}
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-5">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>

            <div className="space-y-3 text-[13px] font-bold text-slate-600">
              {[
                { color: '#22c55e', label: 'Low Garbage Density' },
                { color: '#facc15', label: 'Medium Garbage Density' },
                { color: '#ef4444', label: 'High Garbage Density' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ background: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="premium-card p-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdGpsFixed size={14} /> Hotspot Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Points
                </p>
                <p className="text-2xl font-black text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                  High Severity
                </p>
                <p className="text-2xl font-black text-rose-600">{stats.high}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Medium
                </p>
                <p className="text-2xl font-black text-amber-600">{stats.medium}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                  Low
                </p>
                <p className="text-2xl font-black text-emerald-600">{stats.low}</p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="premium-card p-4 text-center bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Last Synced
              </p>
              <p className="text-sm font-bold text-slate-700">
                {lastUpdated.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
