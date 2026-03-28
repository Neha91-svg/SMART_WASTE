import { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { reportWaste } from '../services/api';
import { MdCameraAlt, MdLocationOn, MdSend, MdCheckCircle } from 'react-icons/md';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '520px', borderRadius: '16px' };
const center = { lat: 19.0760, lng: 72.8777 }; // Mumbai
const options = {
  disableDefaultUI: true, zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
};
const libraries = ['places'];

/**
 * Report Waste Page — Premium Light UI Form
 */
export default function ReportWaste() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [wasteType, setWasteType] = useState('General');
  const [wasteLevel, setWasteLevel] = useState('Medium');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('Image too large. Please use an image under 5MB.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setImageBase64(reader.result); setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !location) { alert('Please fill in the address and select a location on the map.'); return; }
    setSubmitting(true);
    try {
      await reportWaste({ address, location, wasteType, wasteLevel, image: imageBase64 });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setAddress(''); setLocation(null); setWasteType('General'); setWasteLevel('Medium'); setImagePreview(null); setImageBase64(null); }, 3000);
    } catch (err) { alert('Failed to submit report. Please try again.'); console.error(err); }
    finally { setSubmitting(false); }
  };

  const onMapClick = (e) => { setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() }); };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="page-title">Report Waste</h1>
        <p className="page-subtitle">Potted an illegal dumping site? Report it directly to the dashboard.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-4 animate-slide-up">
          <MdCheckCircle size={28} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-800 text-lg">Report Submitted Successfully</h4>
            <p className="text-emerald-600 font-medium">Thank you! A collection truck will be assigned shortly.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map Section */}
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

        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="premium-card p-6 md:p-8 space-y-6">
            <h3 className="section-title flex items-center gap-2 !mb-6">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><MdLocationOn size={18} /></span>
              Location Details
            </h3>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Full Address *</label>
              <input type="text" className="input-premium" placeholder="e.g., Carter Road, Bandra West" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            {/* Location Display */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Map Pin *</label>
              <div className="input-premium bg-slate-50 border-dashed flex items-center">
                {location ? (
                  <span className="text-emerald-600 font-bold">📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                ) : (
                  <span className="text-slate-400">Click on the map to drop a pin</span>
                )}
              </div>
            </div>

            {/* Waste Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Waste Type</label>
              <div className="radio-btn-group">
                {['General', 'E-waste', 'Mixed'].map((type) => (
                  <button key={type} type="button" onClick={() => setWasteType(type)} className={`radio-btn ${wasteType === type ? 'active' : ''}`}>{type}</button>
                ))}
              </div>
            </div>

            {/* Waste Level */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Urgency Level</label>
              <div className="radio-btn-group">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button key={level} type="button" onClick={() => setWasteLevel(level)} className={`radio-btn ${wasteLevel === level ? 'active' : ''}`}>
                    {level} Priority
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Photo Evidence (Optional)</label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 transition-transform mb-3">
                        <MdCameraAlt size={24} />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">Click to upload photo</span>
                      <span className="text-xs text-slate-400 mt-1">JPEG, PNG under 5MB</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button type="submit" disabled={submitting || !address || !location} className="btn-premium w-full py-4 text-base">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><MdSend size={20} /> Submit Report</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
