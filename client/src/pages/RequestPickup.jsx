import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { requestPickup } from '../services/api';
import { MdLocalShipping, MdSend, MdCheckCircle, MdAccessTime, MdLocationOn } from 'react-icons/md';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '520px', borderRadius: '16px' };
const center = { lat: 19.076, lng: 72.8777 };
const options = {
  disableDefaultUI: true, zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
};
const libraries = ['places'];

/**
 * Request Pickup Page — Premium Light UI Form
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
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="page-title">Request Pickup</h1>
        <p className="page-subtitle">Schedule a convenient waste collection pickup right at your doorstep.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-4 animate-slide-up">
          <MdCheckCircle size={28} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-800 text-lg">Pickup Request Confirmed</h4>
            <p className="text-emerald-600 font-medium">We'll see you during your selected time slot.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 premium-card overflow-hidden p-2 relative" style={{ minHeight: '520px' }}>
          {loadError && <div className="p-5 font-semibold text-rose-500">Error loading maps. Check API Key.</div>}
          {!isLoaded ? (
            <div className="flex justify-center items-center h-full"><div className="spinner-premium"></div></div>
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden">
              <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={center} options={options} onClick={onMapClick}>
                {location && <Marker position={location} />}
              </GoogleMap>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="premium-card p-6 md:p-8 space-y-6">
            <h3 className="section-title flex items-center gap-3 !mb-6">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm"><MdLocalShipping size={20} /></span>
              Pickup Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Address *</label>
              <input type="text" className="input-premium" placeholder="e.g., 15 Carter Road, Bandra West" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Map Pin *</label>
              <div className="input-premium bg-slate-50 border-dashed flex items-center min-h-[50px]">
                {location ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><MdLocationOn size={16}/> {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                ) : (
                  <span className="text-slate-400">Click on the map to pin your location</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MdAccessTime size={16} /> Preferred Time Slot *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot) => (
                  <button key={slot} type="button" onClick={() => setPreferredTime(slot)} className={`radio-btn text-left py-3 ${preferredTime === slot ? 'active shadow-md' : ''}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Waste Category</label>
              <div className="radio-btn-group">
                {['General', 'E-waste', 'Mixed'].map((type) => (
                  <button key={type} type="button" onClick={() => setWasteType(type)} className={`radio-btn flex-1 text-center py-2.5 ${wasteType === type ? 'active shadow-sm' : ''}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={submitting || !address || !location || !preferredTime} className="btn-premium w-full py-4 text-base">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                    Scheduling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><MdSend size={20} /> Request Pickup</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
