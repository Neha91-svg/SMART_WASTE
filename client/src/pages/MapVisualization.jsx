import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { getWasteData, optimizeRoute } from '../services/api';
import { MdRoute, MdPlayArrow } from 'react-icons/md';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '550px' };
const truckStart = { lat: 19.0760, lng: 72.8777 };
const options = {
  disableDefaultUI: true, zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
};
const libraries = ['places'];
const levelColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#059669' };

/**
 * Map Visualization Page — Interactive Google Map with markers and optimized route
 */
export default function MapVisualization() {
  const [wasteData, setWasteData] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries,
  });

  useEffect(() => { fetchWasteData(); }, []);

  const fetchWasteData = async () => {
    try { const res = await getWasteData(); setWasteData(res.data.data); }
    catch (err) { console.error('Failed to fetch waste data:', err); }
    finally { setLoadingData(false); }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try { const res = await optimizeRoute(truckStart); setRouteData(res.data.data); }
    catch (err) { console.error('Route optimization failed:', err); alert('Failed to optimize route.'); }
    finally { setOptimizing(false); }
  };

  const getMarkerIcon = (level) => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: levelColors[level] || '#059669',
    fillOpacity: 0.9, strokeWeight: 2, strokeColor: '#ffffff', scale: 12,
  });

  const truckIcon = {
    url: 'https://cdn-icons-png.flaticon.com/512/2830/2830180.png',
    scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(36, 36) : null,
  };

  if (loadingData) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="text-slate-500 text-sm font-medium">Loading map data...</p>
        </div>
      </div>
    );
  }

  const routeCoordinates = routeData?.optimizedRoute?.map(p => ({ lat: p.lat, lng: p.lng })) || [];

  return (
    <div className="space-y-6 pb-6">
      <div className="page-header">
        <div className="page-header-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1>Route Map</h1>
            <p className="page-subtitle">Locate waste & navigate optimal collection paths</p>
          </div>
          <button onClick={handleOptimize} disabled={optimizing} className="btn-primary px-5 shrink-0">
            {optimizing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Optimizing...
              </span>
            ) : (
              <span className="flex items-center gap-2"><MdPlayArrow size={20} /> Optimize Route</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Map */}
        <div className="lg:col-span-3 card overflow-hidden" style={{ minHeight: '550px' }}>
          {loadError && <div className="p-5 text-red-500 text-sm font-medium">Error loading maps.</div>}
          {!isLoaded ? (
            <div className="flex items-center justify-center p-10 h-full"><div className="spinner"></div></div>
          ) : (
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={truckStart} options={options}>
              <Marker position={truckStart} icon={truckIcon.scaledSize ? truckIcon : undefined} title="Truck Start" />

              {wasteData.map((waste, i) => {
                let orderNum = i + 1;
                if (routeData) {
                  const idx = routeData.optimizedRoute.findIndex(p =>
                    (p.lat === waste.location.lat && p.lng === waste.location.lng) || p.address === waste.address
                  );
                  if (idx > 0) orderNum = idx;
                }
                return (
                  <Marker key={i} position={{ lat: waste.location.lat, lng: waste.location.lng }}
                    icon={getMarkerIcon(waste.wasteLevel)}
                    label={{ text: String(orderNum), color: 'white', fontSize: '11px', fontWeight: 'bold' }}
                    onClick={() => setSelectedWaste(waste)} />
                );
              })}

              {selectedWaste && (
                <InfoWindow position={{ lat: selectedWaste.location.lat, lng: selectedWaste.location.lng }} onCloseClick={() => setSelectedWaste(null)}>
                  <div className="pr-2 min-w-[180px]">
                    <strong className="text-sm block pb-1 mb-1 border-b border-slate-200">{selectedWaste.address || 'Waste Point'}</strong>
                    <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                      <div>Level: <span style={{ color: levelColors[selectedWaste.wasteLevel], fontWeight: 600 }}>{selectedWaste.wasteLevel}</span></div>
                      <div>Type: {selectedWaste.wasteType}</div>
                      <div>Status: {selectedWaste.status}</div>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {routeCoordinates.length > 0 && (
                <Polyline path={routeCoordinates} options={{
                  strokeColor: '#1e293b', strokeOpacity: 0.8, strokeWeight: 4,
                  icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '20px' }],
                }} />
              )}
            </GoogleMap>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 flex flex-col lg:max-h-[550px]">
          {/* Legend */}
          <div className="card p-4">
            <h3 className="section-title !text-[11px] !mb-3">Map Legend</h3>
            <div className="space-y-2 text-sm text-slate-600">
              {[
                { color: '#ef4444', label: 'High Priority' },
                { color: '#f59e0b', label: 'Medium Priority' },
                { color: '#059669', label: 'Low Priority' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: item.color }}></div>
                  <span className="text-[13px] font-medium">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <div className="w-5 h-0 border-t-2 border-dashed border-slate-800"></div>
                <span className="text-[13px] font-medium">Optimized Route</span>
              </div>
            </div>
          </div>

          {/* Route Stats */}
          {routeData && (
            <div className="card p-4">
              <h3 className="section-title !text-[11px] !mb-3 flex items-center gap-1.5">
                <MdRoute size={14} /> Route Metrics
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-medium uppercase">Stops</span>
                  <span className="font-bold">{routeData.metrics.totalStops}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-medium uppercase">High Priority</span>
                  <span className="font-bold text-red-500">{routeData.metrics.highPriorityStops}</span>
                </div>
                <div className="border-t border-slate-100 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-medium uppercase">Distance</span>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{routeData.metrics.optimizedDistance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-medium uppercase">Est. Time</span>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{routeData.metrics.optimizedTime} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Route Order */}
          {routeData && (
            <div className="card p-4 flex-1 overflow-hidden flex flex-col">
              <h3 className="section-title !text-[11px] !mb-3 shrink-0">Collection Order</h3>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {routeData.optimizedRoute.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="truncate text-[13px] text-slate-700">{point.label}</span>
                    {point.wasteLevel && (
                      <span className={`badge ml-auto text-[9px] badge-${point.wasteLevel.toLowerCase()}`}>{point.wasteLevel}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!routeData && (
            <div className="card p-6 text-center flex-1 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <MdRoute size={24} className="text-emerald-500" />
              </div>
              <p className="font-semibold text-sm text-slate-700 mb-1">No Route Active</p>
              <p className="text-xs text-slate-400">Click "Optimize Route" to generate the optimal collection path.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
