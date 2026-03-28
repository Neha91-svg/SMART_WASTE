import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { requestPickup } from '../services/api';
import { MdLocalShipping, MdSend, MdCheckCircle, MdAccessTime } from 'react-icons/md';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '520px' };
const center = { lat: 19.076, lng: 72.8777 };
const options = {
  disableDefaultUI: true, zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
};
const libraries = ['places'];

/**
 * Request Pickup Page — Schedule waste collection pickup
 */
export default function RequestPickup() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [preferredTime, setPreferredTime] = useState('');
  const [wasteType, setWasteType] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries,
  });

  const timeSlots = ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !location || !preferredTime) { alert('Please fill all fields and select a map location'); return; }
    setSubmitting(true);
    try {
      await requestPickup({ address, location, preferredTime, wasteType });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setAddress(''); setLocation(null); setPreferredTime(''); setWasteType('General'); }, 3000);
    } catch (err) { alert('Failed to submit request.'); console.error(err); }
    finally { setSubmitting(false); }
  };

  const onMapClick = (e) => { setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() }); };

  return (
    <div className="space-y-6 pb-6">
      <div className="page-header">
        <div className="page-header-inner">
          <h1>Request Pickup</h1>
          <p className="page-subtitle">Schedule a waste collection pickup at your location</p>
        </div>
      </div>

      {success && (
        <div className="success-alert">
          <MdCheckCircle size={24} className="text-emerald-600 shrink-0" />
          <div>
            <p className="alert-title">Pickup request submitted!</p>
            <p className="alert-text">We'll schedule your pickup during the selected time slot.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Map */}
        <div className="lg:col-span-3 card overflow-hidden" style={{ minHeight: '520px' }}>
          {loadError && <div className="p-5 text-red-500 text-sm font-medium">Error loading maps.</div>}
          {!isLoaded ? (
            <div className="flex items-center justify-center p-10 h-full"><div className="spinner"></div></div>
          ) : (
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={center} options={options} onClick={onMapClick}>
              {location && <Marker position={location} />}
            </GoogleMap>
          )}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-5 md:p-6 space-y-5">
            <h3 className="section-title flex items-center gap-2 !mb-4">
              <MdLocalShipping className="text-emerald-500" size={20} /> Pickup Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Address *</label>
              <input type="text" className="form-input" placeholder="e.g., 15 Carter Road, Bandra West, Mumbai" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Map Location *</label>
              <div className="form-input bg-slate-50">
                {location ? (
                  <span className="text-emerald-600 font-semibold text-sm">📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                ) : (
                  <span className="text-slate-400 text-sm">Click on the map to pin your location</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                <MdAccessTime size={14} /> Preferred Time Slot *
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {timeSlots.map((slot) => (
                  <button key={slot} type="button" onClick={() => setPreferredTime(slot)} className={`toggle-btn text-left ${preferredTime === slot ? 'active' : ''}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Waste Type</label>
              <div className="flex gap-2">
                {['General', 'E-waste', 'Mixed'].map((type) => (
                  <button key={type} type="button" onClick={() => setWasteType(type)} className={`toggle-btn ${wasteType === type ? 'active' : ''}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting || !address || !location || !preferredTime} className="btn-primary w-full py-3 text-sm mt-2">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2"><MdSend size={18} /> Request Pickup</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
