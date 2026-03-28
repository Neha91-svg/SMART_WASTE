import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { getEWasteCenters } from '../services/api';
import { MdRecycling, MdPhone, MdAccessTime, MdLocationOn } from 'react-icons/md';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '600px' };
const options = {
  disableDefaultUI: true, zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
};
const libraries = ['places'];

/**
 * E-Waste Centers Page — List + Google Map view
 */
export default function EWasteCenters() {
  const [centers, setCenters] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 19.076, lng: 72.8777 });
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); fetchCenters(pos.coords.latitude, pos.coords.longitude); },
        () => { fetchCenters(userLocation.lat, userLocation.lng); }
      );
    } else { fetchCenters(userLocation.lat, userLocation.lng); }
  }, []);

  const fetchCenters = async (lat, lng) => {
    try { const res = await getEWasteCenters(lat, lng); setCenters(res.data.data); }
    catch (err) { console.error('Failed to fetch e-waste centers:', err); }
    finally { setLoadingData(false); }
  };

  const getUserMarkerIcon = () => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#3b82f6', fillOpacity: 1, strokeWeight: 2, strokeColor: '#ffffff', scale: 12,
  });

  const getEWasteMarkerIcon = () => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#059669', fillOpacity: 0.9, strokeWeight: 2, strokeColor: '#ffffff', scale: 12,
  });

  if (loadingData) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="text-slate-500 text-sm font-medium">Locating centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="page-header">
        <div className="page-header-inner">
          <h1>E-Waste Centers</h1>
          <p className="page-subtitle">Find nearby certified e-waste recycling locations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {centers.map((center, i) => (
            <div
              key={i}
              onClick={() => { setSelectedCenter(center); setActiveMarker(center._id); }}
              className={`card p-4 cursor-pointer transition-all ${
                selectedCenter?._id === center._id ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start justify-between mb-2 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 leading-tight">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="line-clamp-1">{center.name}</span>
                </h3>
                {center.distance !== undefined && (
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {center.distance} km
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-2.5 flex items-start gap-1.5">
                <MdLocationOn size={14} className="shrink-0 mt-0.5 text-slate-400" />
                <span className="line-clamp-2">{center.address}</span>
              </p>

              <div className="flex flex-col gap-1 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5"><MdPhone size={13} className="text-slate-400" /> {center.contact}</span>
                <span className="flex items-center gap-1.5 text-blue-600"><MdAccessTime size={13} /> {center.operatingHours}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {center.acceptedItems?.map((item, j) => (
                  <span key={j} className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {centers.length === 0 && (
            <div className="card p-8 text-center"><p className="text-slate-400 text-sm">No centers found nearby.</p></div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-3 card overflow-hidden" style={{ minHeight: '600px' }}>
          {loadError && <div className="p-5 text-red-500 text-sm font-medium">Error loading maps.</div>}
          {!isLoaded ? (
            <div className="flex items-center justify-center p-10 h-full"><div className="spinner"></div></div>
          ) : (
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={11} center={userLocation} options={options}>
              <Marker position={userLocation} icon={getUserMarkerIcon()} title="Your Location" label={{ text: '⭐', fontSize: '12px' }} />
              {centers.map((center, i) => (
                <Marker key={i} position={{ lat: center.location.lat, lng: center.location.lng }} icon={getEWasteMarkerIcon()}
                  label={{ text: String(i + 1), color: 'white', fontSize: '11px', fontWeight: 'bold' }}
                  onClick={() => { setSelectedCenter(center); setActiveMarker(center._id); }}>
                  {activeMarker === center._id && (
                    <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                      <div className="pr-2 max-w-[200px]">
                        <strong className="text-sm block pb-1 mb-1 border-b border-slate-200">♻️ {center.name}</strong>
                        <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                          <div>{center.address}</div>
                          <div>📞 {center.contact}</div>
                          <div>🕐 {center.operatingHours}</div>
                          {center.distance !== undefined && <div className="text-emerald-600 font-semibold mt-1">📏 {center.distance} km away</div>}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
