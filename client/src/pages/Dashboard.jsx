import { useState, useEffect } from 'react';
import { getWasteStats, getWasteData, getPickupRequests } from '../services/api';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { MdDeleteOutline, MdLocalShipping, MdTrendingUp, MdWarning, MdCheckCircle, MdRecycling, MdArrowForward } from 'react-icons/md';

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontWeight: '500',
  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  fontSize: '13px',
};

/**
 * Dashboard Page — Clean analytics overview
 */
export default function Dashboard({ role = 'admin' }) {
  const [stats, setStats] = useState(null);
  const [wasteData, setWasteData] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, wasteRes, pickupRes] = await Promise.all([
        getWasteStats(),
        getWasteData(),
        getPickupRequests()
      ]);
      setStats(statsRes.data);
      setWasteData(wasteRes.data.data);
      setPickups(pickupRes.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="text-slate-500 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart data
  const wasteLevelData = [
    { name: 'High', value: wasteData.filter(w => w.wasteLevel === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: wasteData.filter(w => w.wasteLevel === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: wasteData.filter(w => w.wasteLevel === 'Low').length, color: '#059669' },
  ];

  const statusData = [
    { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats?.inProgress || 0, color: '#3b82f6' },
    { name: 'Collected', value: stats?.collected || 0, color: '#059669' },
  ];

  const wasteTypeData = [
    { name: 'General', count: wasteData.filter(w => w.wasteType === 'General').length },
    { name: 'E-waste', count: wasteData.filter(w => w.wasteType === 'E-waste').length },
  ];

  const weeklyTrend = [
    { day: 'Mon', collections: 12, reports: 18 },
    { day: 'Tue', collections: 15, reports: 14 },
    { day: 'Wed', collections: 10, reports: 22 },
    { day: 'Thu', collections: 18, reports: 16 },
    { day: 'Fri', collections: 22, reports: 20 },
    { day: 'Sat', collections: 8, reports: 10 },
    { day: 'Sun', collections: 5, reports: 6 },
  ];

  const statCards = [
    { label: 'Total Reports', value: stats?.total || 0, icon: <MdDeleteOutline size={20} />, bg: '#059669' },
    { label: 'Pending', value: stats?.pending || 0, icon: <MdWarning size={20} />, bg: '#f59e0b' },
    { label: 'Collected', value: stats?.collected || 0, icon: <MdCheckCircle size={20} />, bg: '#3b82f6' },
    { label: 'Collection Rate', value: `${stats?.collectionRate || 0}%`, icon: <MdTrendingUp size={20} />, bg: '#8b5cf6' },
    { label: 'High Priority', value: stats?.highPriority || 0, icon: <MdDeleteOutline size={20} />, bg: '#ef4444' },
    { label: 'Pickups', value: pickups.length, icon: <MdLocalShipping size={20} />, bg: '#06b6d4' },
  ];

  // --- USER DASHBOARD ---
  if (role === 'user') {
    return (
      <div className="space-y-6 pb-6">
        <div className="page-header" style={{ borderLeftColor: '#059669' }}>
          <div className="page-header-inner">
            <h1>Welcome to SmartWaste</h1>
            <p className="page-subtitle">Your personal portal for a cleaner Mumbai environment.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/report-waste" 
            className="group card p-5 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div>
              <h2 className="text-base font-bold text-slate-800">Report Waste</h2>
              <p className="text-sm text-slate-500 mt-1">Submit a new waste hotspot</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <MdDeleteOutline size={22} />
            </div>
          </Link>
          
          <Link 
            to="/request-pickup" 
            className="group card p-5 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div>
              <h2 className="text-base font-bold text-slate-800">Request Pickup</h2>
              <p className="text-sm text-slate-500 mt-1">Schedule a truck collection</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <MdLocalShipping size={22} />
            </div>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#059669' }}>
              <MdTrendingUp size={20} />
            </div>
            <p className="stat-value">{stats?.collected || 0}</p>
            <p className="stat-label">Total Collections</p>
          </div>
          <Link to="/ewaste-centers" className="stat-card hover:-translate-y-0.5 cursor-pointer">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>
              <MdRecycling size={20} />
            </div>
            <p className="stat-value">5</p>
            <p className="stat-label">E-Waste Centers</p>
          </Link>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>
              <MdCheckCircle size={20} />
            </div>
            <p className="stat-value">{stats?.collectionRate || 0}%</p>
            <p className="stat-label">City Efficiency</p>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD ---
  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>Dashboard Overview</h1>
          <p className="page-subtitle">Smart Waste Collection & E-Waste Disposal Metrics</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <p className="stat-value">{card.value}</p>
            <p className="stat-label">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title">Waste Level Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={wasteLevelData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2}>
                  {wasteLevelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 pt-3 border-t border-slate-100">
            {wasteLevelData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }}></div>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title">Collection Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title">Weekly Collection Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="collections" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
              <Area type="monotone" dataKey="reports" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 pt-3 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Collections</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Reports</span>
            </div>
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <h3 className="section-title">Waste Type</h3>
          <div className="flex-1 flex items-center">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={wasteTypeData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontWeight: 600, fontSize: 13 }} width={70} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} label={{ position: 'right', fill: '#1e293b', fontWeight: 700, fontSize: 14 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800">Recent Waste Reports</h3>
          <span className="text-xs font-medium text-slate-400">
            {Math.min(wasteData.length, 8)} of {wasteData.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="brutalist-table w-full">
            <thead>
              <tr>
                <th>Location</th>
                <th>Level</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {wasteData.slice(0, 8).map((report, i) => (
                <tr key={i}>
                  <td className="font-medium">
                    <span className="truncate block max-w-[200px]">
                      {report.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.wasteLevel.toLowerCase()}`}>{report.wasteLevel}</span>
                  </td>
                  <td className="text-slate-500">{report.wasteType}</td>
                  <td>
                    <span className={`badge ${report.status === 'Pending' ? 'badge-pending' : report.status === 'In Progress' ? 'badge-progress' : 'badge-collected'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="text-slate-400 text-[13px]">{new Date(report.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {wasteData.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No recent reports found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
