import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getEWasteCenters } from '../services/api';
import { MdRecycling, MdPhone, MdAccessTime, MdLocationOn } from 'react-icons/md';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green icon for e-waste centers
const ewasteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * E-Waste Centers Page — List + Map view of nearby e-waste disposal centers
 */
export default function EWasteCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 19.076, lng: 72.8777 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchCenters(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchCenters(userLocation.lat, userLocation.lng);
        }
      );
    } else {
      fetchCenters(userLocation.lat, userLocation.lng);
    }
  }, []);

  const fetchCenters = async (lat, lng) => {
    try {
      const res = await getEWasteCenters(lat, lng);
      setCenters(res.data.data);
    } catch (err) {
      console.error('Failed to fetch e-waste centers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center font-bold text-lg">
          <div className="spinner" style={{ borderTopColor: '#10b981' }}></div>
          <p>Locating Centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="page-header" style={{ background: '#10b981' }}>
        <div className="page-header-inner">
          <h1>E-Waste Centers</h1>
          <p className="page-subtitle">Find nearby certified e-waste recycling locations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List — 2 cols */}
        <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {centers.map((center, i) => (
            <div
              key={i}
              onClick={() => setSelectedCenter(center)}
              className={`brutalist-card p-4 cursor-pointer transition-all bg-white ${
                selectedCenter?._id === center._id
                  ? 'border-[#10b981] shadow-[4px_4px_0px_#10b981] bg-[#f0fdf4]'
                  : 'hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_var(--border)]'
              }`}
            >
              <div className="flex items-start justify-between mb-2 pb-2 border-b-2 border-dashed border-gray-200">
                <h3 className="text-sm font-extrabold text-[#121212] uppercase flex items-center gap-1.5 leading-tight">
                  <MdRecycling className="text-[#10b981] shrink-0" size={20} />
                  <span className="line-clamp-1">{center.name}</span>
                </h3>
                {center.distance !== undefined && (
                  <span className="font-bold text-xs bg-[#10b981] text-white px-1.5 py-0.5 border-2 border-black rounded shadow-[1px_1px_0px_#121212] shrink-0 ml-2">
                    {center.distance} km
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-start gap-1.5">
                <MdLocationOn size={14} className="shrink-0 mt-0.5 text-gray-400" />
                <span className="line-clamp-2">{center.address}</span>
              </p>

              <div className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 mb-3 bg-gray-50 p-2 border-2 border-gray-200 rounded">
                <span className="flex items-center gap-1.5">
                  <MdPhone size={13} className="text-gray-400" /> {center.contact}
                </span>
                <span className="flex items-center gap-1.5 text-[#0ea5e9]">
                  <MdAccessTime size={13} /> {center.operatingHours}
                </span>
              </div>

              {/* Accepted Items */}
              <div className="flex flex-wrap gap-1.5">
                {center.acceptedItems?.map((item, j) => (
                  <span key={j} className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#facc15] border-2 border-black rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {centers.length === 0 && (
            <div className="brutalist-card p-8 text-center bg-white">
              <p className="text-gray-400 font-semibold">No e-waste centers found nearby.</p>
            </div>
          )}
        </div>

        {/* Map — 3 cols */}
        <div className="lg:col-span-3 brutalist-card bg-white overflow-hidden" style={{ minHeight: '600px' }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={11}
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* User location marker */}
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <div className="p-1 font-bold">📍 Your Location</div>
              </Popup>
            </Marker>

            {/* E-waste center markers */}
            {centers.map((center, i) => (
              <Marker
                key={i}
                position={[center.location.lat, center.location.lng]}
                icon={ewasteIcon}
              >
                <Popup>
                  <div className="p-1">
                    <strong className="text-sm block border-b-2 border-black pb-1 mb-1 uppercase">♻️ {center.name}</strong>
                    <div className="text-xs font-semibold mt-1 space-y-0.5">
                      <div>{center.address}</div>
                      <div>📞 {center.contact}</div>
                      <div>🕐 {center.operatingHours}</div>
                      {center.distance !== undefined && (
                        <div className="text-[#10b981] font-bold mt-1">📏 {center.distance} km away</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
