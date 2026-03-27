import { useState, useEffect } from 'react';
import { getWasteStats, getWasteData, getPickupRequests } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { MdDeleteOutline, MdLocalShipping, MdTrendingUp, MdWarning, MdCheckCircle } from 'react-icons/md';

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '3px solid #121212',
  borderRadius: '4px',
  fontWeight: 'bold',
  boxShadow: '4px 4px 0px #121212',
};

/**
 * Dashboard Page — Overview of waste collection status with metrics and charts
 */
export default function Dashboard() {
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
        <div className="text-center font-bold text-lg">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart data
  const wasteLevelData = [
    { name: 'High', value: wasteData.filter(w => w.wasteLevel === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: wasteData.filter(w => w.wasteLevel === 'Medium').length, color: '#facc15' },
    { name: 'Low', value: wasteData.filter(w => w.wasteLevel === 'Low').length, color: '#10b981' },
  ];

  const statusData = [
    { name: 'Pending', value: stats?.pending || 0, color: '#facc15' },
    { name: 'In Progress', value: stats?.inProgress || 0, color: '#06b6d4' },
    { name: 'Collected', value: stats?.collected || 0, color: '#10b981' },
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
    { label: 'Total Reports', value: stats?.total || 0, icon: <MdDeleteOutline size={24} />, bg: '#10b981' },
    { label: 'Pending', value: stats?.pending || 0, icon: <MdWarning size={24} />, bg: '#facc15' },
    { label: 'Collected', value: stats?.collected || 0, icon: <MdCheckCircle size={24} />, bg: '#06b6d4' },
    { label: 'Collection Rate', value: `${stats?.collectionRate || 0}%`, icon: <MdTrendingUp size={24} />, bg: '#a855f7' },
    { label: 'High Priority', value: stats?.highPriority || 0, icon: <MdDeleteOutline size={24} />, bg: '#ef4444' },
    { label: 'Pickups', value: pickups.length, icon: <MdLocalShipping size={24} />, bg: '#ec4899' },
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Level Distribution - Pie Chart */}
        <div className="brutalist-card p-5 bg-white flex flex-col">
          <h3 className="section-title">Waste Level Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={wasteLevelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  stroke="#121212"
                  strokeWidth={2}
                >
                  {wasteLevelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#121212' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 pt-4 border-t-2 border-dashed border-gray-200">
            {wasteLevelData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 font-bold text-sm">
                <div className="w-3.5 h-3.5 rounded-sm border-2 border-black shrink-0" style={{ background: item.color }}></div>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Status */}
        <div className="brutalist-card p-5 bg-white">
          <h3 className="section-title">Collection Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#121212', fontWeight: 600, fontSize: 12 }} axisLine={{ stroke: '#121212', strokeWidth: 2 }} />
              <YAxis tick={{ fill: '#121212', fontWeight: 600, fontSize: 12 }} axisLine={{ stroke: '#121212', strokeWidth: 2 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" stroke="#121212" strokeWidth={2} radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="brutalist-card p-5 bg-white lg:col-span-2">
          <h3 className="section-title">Weekly Collection Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fill: '#121212', fontWeight: 600, fontSize: 12 }} axisLine={{ stroke: '#121212', strokeWidth: 2 }} />
              <YAxis tick={{ fill: '#121212', fontWeight: 600, fontSize: 12 }} axisLine={{ stroke: '#121212', strokeWidth: 2 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="collections" stroke="#121212" fill="#10b981" strokeWidth={2} fillOpacity={0.6} />
              <Area type="monotone" dataKey="reports" stroke="#121212" fill="#06b6d4" strokeWidth={2} fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 pt-3 border-t-2 border-dashed border-gray-200 mt-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-black bg-[#10b981]"></div>
              <span>Collections</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-black bg-[#06b6d4]"></div>
              <span>Reports</span>
            </div>
          </div>
        </div>

        {/* Waste Type Breakdown */}
        <div className="brutalist-card p-5 bg-white flex flex-col">
          <h3 className="section-title">Waste Type</h3>
          <div className="flex-1 flex items-center">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={wasteTypeData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: '#121212', fontWeight: 700, fontSize: 13 }} width={70} axisLine={{ stroke: '#121212', strokeWidth: 2 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#a855f7" stroke="#121212" strokeWidth={2} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#121212', fontWeight: 800, fontSize: 16 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="brutalist-card overflow-hidden">
        <div className="px-5 py-4 border-b-[3px] border-black bg-white flex justify-between items-center">
          <h3 className="text-sm font-extrabold uppercase tracking-widest">Recent Waste Reports</h3>
          <span className="text-[11px] font-bold text-gray-400 uppercase">
            {Math.min(wasteData.length, 8)} of {wasteData.length}
          </span>
        </div>
        <div className="overflow-x-auto bg-white">
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
                  <td className="font-semibold">
                    <span className="truncate block max-w-[200px]">
                      {report.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.wasteLevel.toLowerCase()}`}>{report.wasteLevel}</span>
                  </td>
                  <td className="font-semibold text-gray-600">{report.wasteType}</td>
                  <td>
                    <span className={`badge ${report.status === 'Pending' ? 'badge-pending' : report.status === 'In Progress' ? 'badge-progress' : 'badge-collected'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="font-semibold text-gray-500 text-[13px]">{new Date(report.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {wasteData.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-semibold">No recent reports found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
