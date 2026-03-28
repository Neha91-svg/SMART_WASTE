import { useState, useEffect } from 'react';
import { getPickupRequests, updatePickupStatus } from '../services/api';
import { MdExplore, MdBusinessCenter, MdPerson, MdCheckCircle, MdLocalShipping, MdOutlineSchedule } from 'react-icons/md';

export default function AdminTracker() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, B2B, B2C

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getPickupRequests();
      setRequests(res.data.data);
    } catch (err) {
      console.error('Error fetching tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'B2B') return req.isBulk;
    if (filter === 'B2C') return !req.isBulk;
    return true;
  });

  const totalB2B = requests.filter(r => r.isBulk).length;
  const totalB2C = requests.filter(r => !r.isBulk).length;
  const completed = requests.filter(r => r.status === 'Completed').length;
  const activeUnassigned = requests.filter(r => r.status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="spinner-premium mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <MdExplore className="text-emerald-500" />
            Job Tracker
          </h1>
          <p className="page-subtitle">Platform-wide visibility into marketplace bidding and citizen pickups.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card p-4 border-l-4 border-l-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Jobs Logged</p>
          <p className="text-3xl font-black text-slate-800">{requests.length}</p>
        </div>
        <div className="premium-card p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">B2B Bulk Jobs</p>
          <p className="text-3xl font-black text-slate-800">{totalB2B}</p>
        </div>
        <div className="premium-card p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Completed</p>
          <p className="text-3xl font-black text-slate-800">{completed}</p>
        </div>
        <div className="premium-card p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Awaiting Vendor</p>
          <p className="text-3xl font-black text-slate-800">{activeUnassigned}</p>
        </div>
      </div>

      {/* Main Tracker Board */}
      <div className="premium-card p-6 min-h-[500px] flex flex-col">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
          <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            {['All', 'B2B', 'B2C'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'B2B' ? 'Business Only' : f === 'B2C' ? 'Citizen Only' : 'All Requests'}
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-400">Showing {filteredRequests.length} records</p>
        </div>

        {/* Data List */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-3 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="py-3 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Requester</th>
                <th className="py-3 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Details</th>
                <th className="py-3 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Assigned Vendor</th>
                <th className="py-3 px-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Status/Tracking</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-bold text-sm">
                    No records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {/* Job Type Column */}
                    <td className="py-4 px-4 w-[120px]">
                      {req.isBulk ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                          <MdBusinessCenter size={14} /> B2B
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                          <MdPerson size={14} /> B2C
                        </div>
                      )}
                    </td>

                    {/* Requester Column */}
                    <td className="py-4 px-4 max-w-[200px]">
                      <p className="font-bold text-slate-800 text-sm truncate" title={req.requestedBy}>{req.requestedBy || 'Anonymous User'}</p>
                      <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">{req.address}</p>
                    </td>

                    {/* Cargo Details */}
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        {req.isBulk ? `${req.weight || '?'} kg` : 'Standard Load'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{req.wasteType}</p>
                    </td>

                    {/* Assigned Vendor */}
                    <td className="py-4 px-4">
                      {req.assignedVendor ? (
                        <div className="inline-flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                          <MdLocalShipping /> {req.assignedVendor}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold italic">
                          <MdOutlineSchedule /> Awaiting Vendor
                        </div>
                      )}
                    </td>

                    {/* Status Tracking */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {req.status === 'Completed' ? (
                          <div className="text-emerald-500 flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded text-xs font-black uppercase tracking-wider">
                            <MdCheckCircle size={14} /> Delivered
                          </div>
                        ) : req.status === 'Scheduled' ? (
                          <div className="text-blue-600 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded text-xs font-black uppercase tracking-wider">
                            <MdLocalShipping size={14} /> In Transit
                          </div>
                        ) : (
                          <div className="text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded text-xs font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Bidding Open 
                            <span className="text-amber-400 ml-1">({req.bids?.length || 0})</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
