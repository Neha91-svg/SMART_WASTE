import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { getWasteData, optimizeRoute } from '../services/api';
import { MdRoute, MdPlayArrow } from 'react-icons/md';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '550px', borderRadius: '16px' };
const truckStart = { lat: 19.0760, lng: 72.8777 };
const options = {
  disableDefaultUI: true, zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
};
const libraries = ['places'];
const levelColors = { High: '#F43F5E', Medium: '#F59E0B', Low: '#10B981' };

/**
 * Map Visualization Page — Premium Light UI Layout
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
    fillColor: levelColors[level] || '#10B981',
    fillOpacity: 1, strokeWeight: 3, strokeColor: '#ffffff', scale: 12,
  });

  const truckIcon = {
    url: 'https://cdn-icons-png.flaticon.com/512/2830/2830180.png',
    scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : null,
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="spinner-premium mx-auto mb-4"></div>
          <p className="text-slate-500 font-semibold tracking-wide">Loading map data...</p>
        </div>
      </div>
    );
  }

  const routeCoordinates = routeData?.optimizedRoute?.map(p => ({ lat: p.lat, lng: p.lng })) || [];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Route Planner</h1>
          <p className="page-subtitle">Visualize waste hotspots and generate the optimal path.</p>
        </div>
        <button onClick={handleOptimize} disabled={optimizing} className="btn-premium px-6 scale-95 origin-right">
          {optimizing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Path...
            </span>
          ) : (
            <span className="flex items-center gap-2"><MdPlayArrow size={24} /> Generate Optimal Route</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Floating Map Area */}
        <div className="lg:col-span-3 premium-card overflow-hidden p-2 relative" style={{ minHeight: '550px' }}>
          {loadError && <div className="p-5 font-bold text-rose-500">Error loading maps. Check API Key.</div>}
          {!isLoaded ? (
            <div className="flex justify-center items-center h-full"><div className="spinner-premium"></div></div>
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden">
              <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={truckStart} options={options}>
                <Marker position={truckStart} icon={truckIcon.scaledSize ? truckIcon : undefined} title="Truck Start Center" />

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
                    <div className="pr-4 py-1 min-w-[200px] font-sans">
                      <strong className="text-[14px] font-bold text-slate-800 block mb-2">{selectedWaste.address || 'Reported Location'}</strong>
                      <div className="text-xs text-slate-600 font-medium space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Severity</span>
                          <span style={{ color: levelColors[selectedWaste.wasteLevel] }} className="font-bold">{selectedWaste.wasteLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Category</span>
                          <span>{selectedWaste.wasteType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Status</span>
                          <span className="text-slate-800">{selectedWaste.status}</span>
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {routeCoordinates.length > 0 && (
                  <Polyline path={routeCoordinates} options={{
                    strokeColor: '#0F172A', strokeOpacity: 0.8, strokeWeight: 5,
                    icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '24px' }],
                  }} />
                )}
              </GoogleMap>
            </div>
          )}
        </div>

        {/* Right Action/Stats Panel */}
        <div className="space-y-6 flex flex-col lg:max-h-[550px]">
          {/* Subtle Legend */}
          <div className="premium-card p-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Map Legend</h3>
            <div className="space-y-3 text-[13px] font-bold text-slate-600">
              {[
                { color: '#F43F5E', label: 'High Priority Hotspot' },
                { color: '#F59E0B', label: 'Medium Priority Hotspot' },
                { color: '#10B981', label: 'Low Priority Hotspot' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: item.color }}></div>
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-6 h-1 bg-slate-800 rounded-full"></div>
                <span>Optimized Path</span>
              </div>
            </div>
          </div>

          {/* Action Stats */}
          {routeData && (
            <div className="premium-card p-5">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MdRoute size={16} /> Route Manifest
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Stops</p>
                    <p className="text-2xl font-black text-slate-800">{routeData.metrics.totalStops}</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Critical</p>
                    <p className="text-2xl font-black text-rose-600">{routeData.metrics.highPriorityStops}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Est. Distance</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-sm">{routeData.metrics.optimizedDistance} km</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Est. Time</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-sm">{routeData.metrics.optimizedTime} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Sequence */}
          {routeData && (
            <div className="premium-card p-5 flex-1 overflow-hidden flex flex-col">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 shrink-0">Collection Sequence</h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 hide-scrollbar">
                {routeData.optimizedRoute.map((point, i) => (
                  <div key={i} className="flex gap-4 items-center group cursor-default">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs font-black shrink-0 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{point.label}</p>
                      {point.wasteLevel && (
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: levelColors[point.wasteLevel] }}>
                          {point.wasteLevel} Priority
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!routeData && (
            <div className="premium-card p-8 flex-1 flex flex-col items-center justify-center text-center bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-emerald-500">
                <MdRoute size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">No Active Route</h3>
              <p className="text-sm font-medium text-slate-500">Run the optimization engine to calculate the most efficient path.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
