import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { getWasteData, optimizeRoute } from '../services/api';
import { MdRoute, MdPlayArrow } from 'react-icons/md';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '550px'
};

const truckStart = { lat: 19.0760, lng: 72.8777 };

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const libraries = ['places'];

const levelColors = { High: '#ef4444', Medium: '#facc15', Low: '#10b981' };

/**
 * Map Visualization Page — Interactive Google Map with waste markers and optimized route
 */
export default function MapVisualization() {
  const [wasteData, setWasteData] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchWasteData();
  }, []);

  const fetchWasteData = async () => {
    try {
      const res = await getWasteData();
      setWasteData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch waste data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await optimizeRoute(truckStart);
      setRouteData(res.data.data);
    } catch (err) {
      console.error('Route optimization failed:', err);
      alert('Failed to optimize route. Make sure you have waste data available.');
    } finally {
      setOptimizing(false);
    }
  };

  const getMarkerIcon = (level) => {
    const color = levelColors[level] || '#9ca3af';
    // SVG circle pin
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#121212" stroke-width="2">
        <circle cx="12" cy="12" r="8" />
      </svg>
    `;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new window.google.maps.Size(level === 'High' ? 28 : level === 'Medium' ? 24 : 20),
      anchor: new window.google.maps.Point(12, 12),
    };
  };

  const truckIcon = {
    url: 'https://cdn-icons-png.flaticon.com/512/2830/2830180.png',
    scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(36, 36) : null,
  };

  if (loadingData) {
    return (
      <div className="loading-container">
        <div className="text-center font-bold text-lg">
          <div className="spinner"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  const routeCoordinates = routeData?.optimizedRoute?.map(p => ({ lat: p.lat, lng: p.lng })) || [];

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1>Route Map</h1>
            <p className="page-subtitle">Locate Waste & Navigate Delivery Paths</p>
          </div>
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="btn-primary py-3 px-5 shrink-0"
          >
            {optimizing ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Optimizing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MdPlayArrow size={22} /> Optimize Route
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map — 3 cols */}
        <div className="lg:col-span-3 brutalist-card bg-white overflow-hidden relative" style={{ minHeight: '550px' }}>
          {loadError && <div className="p-5 font-bold text-red-500">Error loading maps. Check API Key.</div>}
          {!isLoaded ? (
            <div className="flex items-center justify-center p-10 h-full w-full bg-gray-100">
               <div className="spinner"></div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={truckStart}
              options={options}
            >
              {/* Truck start marker */}
              <Marker 
                position={truckStart} 
                icon={truckIcon.scaledSize ? truckIcon : undefined} 
                title="Truck Start Location"
              />

              {/* Waste location markers */}
              {wasteData.map((waste, i) => (
                <Marker
                  key={i}
                  position={{ lat: waste.location.lat, lng: waste.location.lng }}
                  icon={getMarkerIcon(waste.wasteLevel)}
                  onClick={() => setSelectedWaste(waste)}
                />
              ))}

              {/* Info Window for Waste */}
              {selectedWaste && (
                <InfoWindow
                  position={{ lat: selectedWaste.location.lat, lng: selectedWaste.location.lng }}
                  onCloseClick={() => setSelectedWaste(null)}
                >
                  <div className="pr-2 min-w-[200px]">
                    <strong className="text-sm block border-b-2 border-black pb-1 mb-2 uppercase">{selectedWaste.address || 'Waste Point'}</strong>
                    <div className="text-xs space-y-1 font-semibold">
                      <div>Level: <span style={{ color: levelColors[selectedWaste.wasteLevel] }}>{selectedWaste.wasteLevel}</span></div>
                      <div>Type: {selectedWaste.wasteType}</div>
                      <div>Status: {selectedWaste.status}</div>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Optimized route polyline */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  path={routeCoordinates}
                  options={{
                    strokeColor: '#121212',
                    strokeOpacity: 0.9,
                    strokeWeight: 5,
                    icons: [{
                      icon: {
                        path: 'M 0,-1 0,1',
                        strokeOpacity: 1,
                        scale: 4
                      },
                      offset: '0',
                      repeat: '20px'
                    }],
                  }}
                />
              )}
            </GoogleMap>
          )}
        </div>

        {/* Route Info Sidebar */}
        <div className="space-y-4 flex flex-col lg:max-h-[550px]">
          {/* Legend */}
          <div className="brutalist-card p-4 bg-white">
            <h3 className="section-title !text-xs !mb-3">Map Legend</h3>
            <div className="space-y-2.5 font-semibold text-sm text-gray-700">
              {[
                { color: '#ef4444', label: 'High Priority' },
                { color: '#facc15', label: 'Medium Priority' },
                { color: '#10b981', label: 'Low Priority' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-black shadow-[1px_1px_0px_#121212]" style={{ background: item.color }}></div>
                  <span className="text-[13px]">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 pt-2 border-t-2 border-dashed border-gray-200">
                <div className="w-5 h-0 border-t-[3px] border-solid border-black"></div>
                <span className="text-[13px]">Optimized Route</span>
              </div>
            </div>
          </div>

          {/* Route Stats */}
          {routeData && (
            <div className="brutalist-card p-4 bg-white">
              <h3 className="section-title !text-xs !mb-3 flex items-center gap-1.5">
                <MdRoute size={16} /> Route Metrics
              </h3>
              <div className="space-y-2 text-sm font-bold">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs">Stops</span>
                  <span className="text-base">{routeData.metrics.totalStops}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs">High Priority</span>
                  <span className="text-base text-[#ef4444]">{routeData.metrics.highPriorityStops}</span>
                </div>
                <div className="border-t-2 border-black my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs">Distance</span>
                  <span className="text-sm bg-[#facc15] px-2 py-0.5 border-2 border-black rounded font-extrabold">{routeData.metrics.optimizedDistance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs">Est. Time</span>
                  <span className="text-sm bg-[#06b6d4] px-2 py-0.5 border-2 border-black rounded text-white font-extrabold">{routeData.metrics.optimizedTime} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Route Order */}
          {routeData && (
            <div className="brutalist-card p-4 bg-white flex-1 overflow-hidden flex flex-col">
              <h3 className="section-title !text-xs !mb-3 shrink-0">Collection Order</h3>
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {routeData.optimizedRoute.map((point, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm font-semibold p-2 border-2 border-black rounded shadow-[2px_2px_0px_#121212]">
                    <div className="w-5 h-5 rounded bg-[#10b981] border-2 border-black flex items-center justify-center font-extrabold text-[10px] shrink-0">
                      {i + 1}
                    </div>
                    <span className="truncate text-[13px]">{point.label}</span>
                    {point.wasteLevel && (
                      <span className={`badge ml-auto text-[9px] badge-${point.wasteLevel.toLowerCase()}`}>
                        {point.wasteLevel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!routeData && (
            <div className="brutalist-card p-6 bg-[#fefce8] text-center flex-1 flex flex-col items-center justify-center border-dashed">
              <div className="w-14 h-14 rounded-full bg-[#facc15] border-[3px] border-black flex items-center justify-center mb-3 shadow-[3px_3px_0px_#121212]">
                <MdRoute size={28} className="text-black" />
              </div>
              <p className="font-extrabold text-sm uppercase tracking-wider mb-1">No Route Active</p>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">Click "Optimize Route" to generate the optimal collection path.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
