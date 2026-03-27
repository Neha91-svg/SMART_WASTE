import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { reportWaste } from '../services/api';
import { MdLocationOn, MdSend, MdCheckCircle } from 'react-icons/md';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '520px'
};

const center = {
  lat: 19.076,
  lng: 72.8777
};

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

/**
 * Report Waste Page — Form with interactive Google Map picker
 */
export default function ReportWaste() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [wasteLevel, setWasteLevel] = useState('Medium');
  const [wasteType, setWasteType] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert('Please select a location on the map');
      return;
    }

    setSubmitting(true);
    try {
      await reportWaste({ location, address, wasteLevel, wasteType });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLocation(null);
        setAddress('');
        setWasteLevel('Medium');
        setWasteType('General');
      }, 3000);
    } catch (err) {
      alert('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const levelColors = { High: '#ef4444', Medium: '#facc15', Low: '#10b981' };
  const levelEmojis = { High: '🔴', Medium: '🟡', Low: '🟢' };

  const onMapClick = (e) => {
    setLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>Report Waste</h1>
          <p className="page-subtitle">Click on the map to select waste location, then fill in the details</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-alert">
          <MdCheckCircle size={28} className="text-[#10b981] shrink-0" />
          <div>
            <p className="alert-title">Waste report submitted successfully!</p>
            <p className="alert-text">Thank you for helping keep Mumbai clean.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map — 3 cols */}
        <div className="lg:col-span-3 brutalist-card bg-white overflow-hidden relative" style={{ minHeight: '520px' }}>
          {loadError && <div className="p-5 font-bold text-red-500">Error loading maps. Check API Key.</div>}
          {!isLoaded ? (
            <div className="flex items-center justify-center p-10 h-full w-full bg-gray-100">
               <div className="spinner"></div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={center}
              options={options}
              onClick={onMapClick}
            >
              {location && <Marker position={location} />}
            </GoogleMap>
          )}
        </div>

        {/* Form — 2 cols */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="brutalist-card bg-white p-5 md:p-6 space-y-5">
            <h3 className="section-title flex items-center gap-2 !mb-4">
              <MdLocationOn className="text-[#10b981]" size={24} /> Waste Details
            </h3>

            {/* Selected coordinates */}
            <div>
              <label className="block text-xs text-[#121212] mb-1.5 font-bold uppercase tracking-wide">Selected Location *</label>
              <div className="form-input shadow-[3px_3px_0px_#121212] bg-[#f8fafc]">
                {location ? (
                  <span className="text-[#10b981] font-bold text-sm">
                    📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-[#94a3b8] font-medium text-sm">Click on the map to select...</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs text-[#121212] mb-1.5 font-bold uppercase tracking-wide">Address / Landmark</label>
              <input
                type="text"
                className="form-input shadow-[3px_3px_0px_#121212]"
                placeholder="e.g., Near Bandra Station, Mumbai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Waste Level */}
            <div>
              <label className="block text-xs text-[#121212] mb-2 font-bold uppercase tracking-wide">Waste Level</label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setWasteLevel(level)}
                    className={`toggle-btn ${
                      wasteLevel === level
                        ? `active text-${level === 'High' ? 'white' : 'black'}`
                        : ''
                    }`}
                    style={wasteLevel === level ? { background: levelColors[level], borderColor: '#121212', color: level === 'High' ? 'white' : 'black' } : {}}
                  >
                    {levelEmojis[level]} {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Waste Type */}
            <div>
              <label className="block text-xs text-[#121212] mb-2 font-bold uppercase tracking-wide">Waste Type</label>
              <div className="flex gap-2">
                {['General', 'E-waste'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWasteType(type)}
                    className={`toggle-btn ${wasteType === type ? 'active' : ''}`}
                    style={wasteType === type ? { background: '#06b6d4', borderColor: '#121212', color: 'white' } : {}}
                  >
                    {type === 'General' ? '🗑️' : '🔌'} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !location}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MdSend size={20} /> Submit Report
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
