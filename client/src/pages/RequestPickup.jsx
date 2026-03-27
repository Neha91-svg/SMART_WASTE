import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { requestPickup } from '../services/api';
import { MdLocalShipping, MdSend, MdCheckCircle, MdAccessTime } from 'react-icons/md';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Request Pickup Page — Users can request waste pickup with address and preferred time
 */
export default function RequestPickup() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [preferredTime, setPreferredTime] = useState('');
  const [wasteType, setWasteType] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !location || !preferredTime) {
      alert('Please fill in all required fields and select a location on the map');
      return;
    }

    setSubmitting(true);
    try {
      await requestPickup({ address, location, preferredTime, wasteType });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAddress('');
        setLocation(null);
        setPreferredTime('');
        setWasteType('General');
      }, 3000);
    } catch (err) {
      alert('Failed to submit request. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>Request Pickup</h1>
          <p className="page-subtitle">Schedule a waste collection pickup at your location</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-alert">
          <MdCheckCircle size={28} className="text-[#10b981] shrink-0" />
          <div>
            <p className="alert-title">Pickup request submitted!</p>
            <p className="alert-text">We'll schedule your pickup during the selected time slot.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map — 3 cols (same order as Report Waste) */}
        <div className="lg:col-span-3 lg:order-1 brutalist-card bg-white overflow-hidden" style={{ minHeight: '520px' }}>
          <MapContainer
            center={[19.076, 72.8777]}
            zoom={12}
            className="w-full h-full"
            style={{ minHeight: '520px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <LocationPicker onLocationSelect={setLocation} />
            {location && (
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <div className="p-1">
                    <strong className="text-sm block border-b-2 border-black pb-1 mb-1 uppercase">Pickup Location</strong>
                    <div className="text-xs font-semibold mt-1">
                      {address ? <span className="block truncate max-w-[150px]">{address}</span> : 'Selected point'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Form — 2 cols */}
        <div className="lg:col-span-2 lg:order-2">
          <form onSubmit={handleSubmit} className="brutalist-card bg-white p-5 md:p-6 space-y-5">
            <h3 className="section-title flex items-center gap-2 !mb-4">
              <MdLocalShipping className="text-[#10b981]" size={24} /> Pickup Details
            </h3>

            {/* Address */}
            <div>
              <label className="block text-xs text-[#121212] mb-1.5 font-bold uppercase tracking-wide">Full Address *</label>
              <input
                type="text"
                className="form-input shadow-[3px_3px_0px_#121212]"
                placeholder="e.g., 15 Carter Road, Bandra West, Mumbai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Location from map */}
            <div>
              <label className="block text-xs text-[#121212] mb-1.5 font-bold uppercase tracking-wide">Map Location *</label>
              <div className="form-input shadow-[3px_3px_0px_#121212] bg-[#f8fafc]">
                {location ? (
                  <span className="text-[#10b981] font-bold text-sm">
                    📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-[#94a3b8] font-medium text-sm">Click on the map to pin your location →</span>
                )}
              </div>
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-xs text-[#121212] mb-2 font-bold uppercase tracking-wide flex items-center gap-1">
                <MdAccessTime size={16} /> Preferred Time Slot *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPreferredTime(slot)}
                    className={`toggle-btn text-left !rounded-md ${preferredTime === slot ? 'active' : ''}`}
                    style={preferredTime === slot ? { background: '#10b981', borderColor: '#121212', color: 'white' } : {}}
                  >
                    🕐 {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Waste Type */}
            <div>
              <label className="block text-xs text-[#121212] mb-2 font-bold uppercase tracking-wide">Waste Type</label>
              <div className="flex gap-2">
                {['General', 'E-waste', 'Mixed'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWasteType(type)}
                    className={`toggle-btn ${wasteType === type ? 'active' : ''}`}
                    style={wasteType === type ? { background: '#06b6d4', borderColor: '#121212', color: 'white' } : {}}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !address || !location || !preferredTime}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MdSend size={20} /> Request Pickup
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
