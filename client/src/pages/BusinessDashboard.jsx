import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestPickup, getPickupRequests, acceptBid } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MdBusiness, MdSavings, MdOutlineLeaderboard, MdTrendingUp, MdCheckCircle } from 'react-icons/md';

const CHART_TOOLTIP = {
  background: '#ffffff',
  border: 'none',
  borderRadius: '16px',
  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.1)',
  padding: '12px 16px',
  fontWeight: '600',
  color: '#0F172A',
  fontSize: '13px',
};

// Mock data for missing history
const monthlyVolumeData = [
  { month: 'Oct', volume: 450 },
  { month: 'Nov', volume: 520 },
  { month: 'Dec', volume: 480 },
  { month: 'Jan', volume: 610 },
  { month: 'Feb', volume: 590 },
  { month: 'Mar', volume: 680 },
];

export default function BusinessDashboard() {
  const { user } = useAuth();
  
  // Bulk Request Form State
  const [address, setAddress] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [weight, setWeight] = useState('');
  const [wasteType, setWasteType] = useState('Mixed');
  
  // Requests State
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, [refresh]);

  const fetchRequests = async () => {
    try {
      const res = await getPickupRequests();
      // Filter only requests requested by this business
      const businessRequests = res.data.data.filter(r => r.requestedBy === user.name && r.isBulk);
      setMyRequests(businessRequests);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestPickup({
        address,
        location: { lat: 19.0760, lng: 72.8777 }, // Default Mumbai logic
        preferredTime,
        wasteType,
        isBulk: true,
        weight: Number(weight),
        requestedBy: user.name
      });
      setAddress('');
      setWeight('');
      setRefresh(r => r + 1);
      alert("Bulk pickup requested successfully! Vendors will bid on it soon.");
    } catch (err) {
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (requestId, bidId) => {
    try {
      await acceptBid(requestId, bidId);
      setRefresh(r => r + 1);
    } catch (err) {
      alert("Failed to accept bid");
    }
  };

  const totalSaved = '₹45,200';
  const totalVolume = myRequests.reduce((sum, req) => sum + (req.weight || 0), 0) + 3330; // mock historic

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="page-title">Business Hub</h1>
        <p className="page-subtitle">Manage operations, track sustainability, and optimize waste costs.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <MdBusiness size={120} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Active Plan</p>
          <p className="text-2xl font-black mb-1">Corporate Premium</p>
          <p className="text-emerald-400 font-bold mb-4">₹10,000 / month</p>
          <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 backdrop-blur-sm">
            Active till Jun 2026
          </div>
        </div>

        <div className="premium-card p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <MdSavings size={80} className="text-emerald-500" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <MdSavings size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800">{totalSaved}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cost Saved via Recycling</p>
        </div>

        <div className="premium-card p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <MdOutlineLeaderboard size={80} className="text-blue-500" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <MdTrendingUp size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800">{totalVolume} kg</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Bulk Volume MTD</p>
        </div>
      </div>

      {/* Analytics Chart & Bulk Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics */}
        <div className="premium-card p-6 flex flex-col">
          <h3 className="section-title">Monthly Waste Volume (kg)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={CHART_TOOLTIP} />
                <Bar dataKey="volume" fill="#0EA5E9" radius={[8, 8, 8, 8]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bulk Form */}
        <div className="premium-card p-6">
          <h3 className="section-title">Schedule Bulk Pickup</h3>
          <form onSubmit={handleBulkRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Pickup Address</label>
              <input
                type="text"
                required
                className="w-full form-input"
                placeholder="Business address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Est. Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="50"
                  className="w-full form-input"
                  placeholder="e.g. 500"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Waste Type</label>
                <select className="w-full form-input" value={wasteType} onChange={e => setWasteType(e.target.value)}>
                  <option>Mixed</option>
                  <option>E-waste</option>
                  <option>General</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Preferred Time</label>
              <input
                type="text"
                required
                className="w-full form-input"
                placeholder="e.g. 10:00 AM Today"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post to Marketplace'}
            </button>
          </form>
        </div>
      </div>

      {/* My Requests & Bids */}
      <h3 className="text-lg font-black text-slate-800 mb-4 tracking-tight pt-4">My Marketplace Requests</h3>
      {loading ? (
        <p>Loading...</p>
      ) : myRequests.length === 0 ? (
        <div className="premium-card p-8 border-dashed border-2 border-slate-200 text-center">
          <p className="text-slate-500 font-bold">No active bulk requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myRequests.map(req => (
            <div key={req._id} className="premium-card p-5 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-800">{req.weight} kg — {req.wasteType}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{req.address} • {req.preferredTime}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                  req.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                {req.status === 'Pending' ? (
                  <>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vendor Bids ({req.bids?.length || 0})</h5>
                    {req.bids?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Waiting for vendors to bid...</p>
                    ) : (
                      <div className="space-y-2">
                        {req.bids.map(bid => (
                          <div key={bid._id} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 bg-slate-50">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{bid.vendorName}</p>
                              <p className="text-emerald-600 font-bold text-sm">₹{bid.amount}</p>
                            </div>
                            <button
                              onClick={() => handleAcceptBid(req._id, bid._id)}
                              className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-md hover:bg-slate-700 transition"
                            >
                              Accept
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Job Tracking</h5>
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                      
                      {/* Step 1: Accepted */}
                      <div className="flex gap-4 mb-4 relative z-10">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white">
                          <MdCheckCircle size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Bid Accepted</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Assigned to: <span className="text-emerald-600 font-black">{req.assignedVendor}</span></p>
                          {req.bids?.filter(b => b.status === 'Accepted').map(b => (
                            <p key={b._id} className="text-[10px] text-slate-500 font-semibold mt-0.5">Agreed Price: ₹{b.amount}</p>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Scheduled/In-Transit */}
                      <div className="flex gap-4 mb-4 relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white ${req.status === 'Scheduled' || req.status === 'Completed' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${req.status === 'Scheduled' || req.status === 'Completed' ? 'bg-white' : 'bg-slate-400'}`}></div>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${req.status === 'Scheduled' || req.status === 'Completed' ? 'text-slate-800' : 'text-slate-400'}`}>Scheduled for Pickup</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Vendor has been notified to arrive at {req.preferredTime}</p>
                        </div>
                      </div>

                      {/* Step 3: Completed */}
                      <div className="flex gap-4 relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[3px] border-white ${req.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <MdCheckCircle size={14} />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${req.status === 'Completed' ? 'text-slate-800' : 'text-slate-400'}`}>Completed</p>
                          {req.status === 'Completed' && <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Waste has been successfully safely disposed.</p>}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
