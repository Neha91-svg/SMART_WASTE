import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { reportWaste } from '../services/api';
import { MdLocationOn, MdSend, MdCheckCircle } from 'react-icons/md';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '520px'
};

const center = { lat: 19.076, lng: 72.8777 };

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
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
    if (!location) { alert('Please select a location on the map'); return; }
    setSubmitting(true);
    try {
      await reportWaste({ location, address, wasteLevel, wasteType });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setLocation(null); setAddress(''); setWasteLevel('Medium'); setWasteType('General'); }, 3000);
    } catch (err) { alert('Failed to submit report.'); console.error(err); }
    finally { setSubmitting(false); }
  };

  const levelColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#059669' };

  const onMapClick = (e) => {
    setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="page-header">
        <div className="page-header-inner">
          <h1>Report Waste</h1>
          <p className="page-subtitle">Click on the map to select waste location, then fill in the details</p>
        </div>
      </div>

      {success && (
        <div className="success-alert">
          <MdCheckCircle size={24} className="text-emerald-600 shrink-0" />
          <div>
            <p className="alert-title">Report submitted successfully!</p>
            <p className="alert-text">Thank you for helping keep Mumbai clean.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Map */}
        <div className="lg:col-span-3 card overflow-hidden" style={{ minHeight: '520px' }}>
          {loadError && <div className="p-5 text-red-500 text-sm font-medium">Error loading maps. Check API key.</div>}
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
              <MdLocationOn className="text-emerald-500" size={20} /> Waste Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Selected Location *</label>
              <div className="form-input bg-slate-50">
                {location ? (
                  <span className="text-emerald-600 font-semibold text-sm">
                    📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">Click on the map to select...</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Address / Landmark</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Near Bandra Station, Mumbai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Waste Level</label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setWasteLevel(level)}
                    className={`toggle-btn ${wasteLevel === level ? 'active' : ''}`}
                    style={wasteLevel === level ? { background: levelColors[level], borderColor: levelColors[level], color: 'white' } : {}}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Waste Type</label>
              <div className="flex gap-2">
                {['General', 'E-waste'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWasteType(type)}
                    className={`toggle-btn ${wasteType === type ? 'active' : ''}`}
                  >
                    {type === 'General' ? '🗑️' : '🔌'} {type}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting || !location} className="btn-primary w-full py-3 text-sm mt-2">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2"><MdSend size={18} /> Submit Report</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
