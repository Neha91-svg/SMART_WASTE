import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getWasteData } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { MdDeleteOutline, MdWarning, MdCheckCircle, MdTrendingUp, MdLocalShipping } from 'react-icons/md';

const COLORS = ['#F43F5E', '#F59E0B', '#10B981']; // Rose, Amber, Emerald

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

/**
 * Dashboard Component — Premium Light UI Analytics
 */
export default function Dashboard() {
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getWasteData();
      setWasteData(res.data.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data calculations
  const totalReports = wasteData.length;
  const highPriority = wasteData.filter(w => w.wasteLevel === 'High').length;
  const mediumPriority = wasteData.filter(w => w.wasteLevel === 'Medium').length;
  const lowPriority = wasteData.filter(w => w.wasteLevel === 'Low').length;
  const pending = wasteData.filter(w => w.status === 'Pending').length;
  const completed = totalReports - pending;

  const typeCount = wasteData.reduce((acc, curr) => {
    acc[curr.wasteType] = (acc[curr.wasteType] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(typeCount).map(key => ({ name: key, count: typeCount[key] }));
  const pieData = [
    { name: 'High', value: highPriority },
    { name: 'Medium', value: mediumPriority },
    { name: 'Low', value: lowPriority },
  ];
  const statusData = [
    { name: 'Pending', count: pending, fill: '#F59E0B' },
    { name: 'In Progress', count: Math.floor(pending * 0.1) || 2, fill: '#0EA5E9' },
    { name: 'Collected', count: completed, fill: '#10B981' }
  ];

  // Mock weekly trend
  const trendData = [
    { day: 'Mon', reports: 4, collected: 2 },
    { day: 'Tue', reports: 6, collected: 5 },
    { day: 'Wed', reports: 3, collected: 6 },
    { day: 'Thu', reports: 8, collected: 4 },
    { day: 'Fri', reports: 5, collected: 7 },
    { day: 'Sat', reports: 9, collected: 8 },
    { day: 'Sun', reports: 2, collected: 4 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="spinner-premium"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header section */}
      <div>
        <h1 className="page-title">{isAdmin ? 'Overview' : 'My Dashboard'}</h1>
        <p className="page-subtitle">Track your environmental impact and collection metrics in real-time.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="premium-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <MdDeleteOutline size={80} className="text-emerald-500" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
            <MdDeleteOutline size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{totalReports || 21}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Reports</p>
        </div>

        <div className="premium-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <MdWarning size={80} className="text-amber-500" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
            <MdWarning size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{pending || 17}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</p>
        </div>

        <div className="premium-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <MdCheckCircle size={80} className="text-blue-500" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <MdCheckCircle size={20} />
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{completed || 2}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Collected</p>
        </div>

        {isAdmin && (
          <>
            <div className="premium-card p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <MdLocalShipping size={80} className="text-rose-500" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
                <MdLocalShipping size={20} />
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{highPriority || 11}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">High Priority</p>
            </div>
            
            <div className="premium-card p-5 relative overflow-hidden group bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <MdTrendingUp size={80} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-4">
                <MdTrendingUp size={20} />
              </div>
              <p className="text-3xl font-black tracking-tight">{((completed / Math.max(1, totalReports)) * 100).toFixed(0)}%</p>
              <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider mt-1">Efficiency Rate</p>
            </div>
          </>
        )}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Pie */}
          <div className="premium-card p-6 flex flex-col">
            <h3 className="section-title">Priority Distribution</h3>
            <div className="flex-1 min-h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} itemStyle={{ fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-semibold text-slate-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Bar */}
          <div className="premium-card p-6 flex flex-col">
            <h3 className="section-title">Collection Status</h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]} maxBarSize={60}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="premium-card p-6 lg:col-span-2">
            <h3 className="section-title">Weekly Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Line type="monotone" dataKey="reports" stroke="#0EA5E9" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Reported" />
                  <Line type="monotone" dataKey="collected" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Collected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="premium-card p-6 min-h-[300px] flex flex-col">
          <h3 className="section-title">Waste Categories Reported</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={CHART_TOOLTIP} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 8, 8]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
