import { useState, useEffect } from 'react';
import { optimizeRoute } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { MdSpeed, MdTrendingUp, MdLocalGasStation, MdTimer, MdRoute, MdPlayArrow } from 'react-icons/md';

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
 * Efficiency Simulation Page — Premium Light UI Metrics
 */
export default function Efficiency() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const truckStart = { lat: 19.0760, lng: 72.8777 };
      const res = await optimizeRoute(truckStart);
      setMetrics(res.data.data.metrics);
      setHasRun(true);
    } catch (err) {
      console.error('Simulation failed:', err);
      alert('Failed to run simulation.');
    } finally { setLoading(false); }
  };

  useEffect(() => { runSimulation(); }, []);

  if (loading && !hasRun) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="spinner-premium mx-auto mb-4"></div>
          <p className="text-slate-500 font-semibold tracking-wide">Running AI Simulation...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="premium-card p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdSpeed size={40} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Efficiency Engine Ready</h2>
          <p className="text-slate-500 font-medium mb-8">Run the optimization simulation to calculate route efficiency, time savings, and estimated fuel reduction.</p>
          <button onClick={runSimulation} className="btn-premium px-8 py-3 text-lg w-full"><MdPlayArrow size={24} /> Start Simulation</button>
        </div>
      </div>
    );
  }

  const distanceComparison = [
    { name: 'Standard Route', value: metrics.fixedDistance, fill: '#64748B' }, // Slate-500
    { name: 'AI Optimized', value: metrics.optimizedDistance, fill: '#10B981' }, // Emerald
  ];

  const timeComparison = [
    { name: 'Standard Route', value: metrics.fixedTime, fill: '#64748B' },
    { name: 'AI Optimized', value: metrics.optimizedTime, fill: '#0EA5E9' }, // Azure Blue
  ];

  const savingsData = [
    { name: 'Distance', saved: metrics.distanceImprovement, fill: '#10B981' },
    { name: 'Time', saved: metrics.timeImprovement, fill: '#0EA5E9' },
  ];

  const fuelEstimate = {
    fixed: (metrics.fixedDistance * 0.15).toFixed(2),
    optimized: (metrics.optimizedDistance * 0.15).toFixed(2),
    saved: metrics.fuelSaved
  };

  const costSaved = (metrics.fuelSaved * 100).toFixed(0);

  const summaryCards = [
    { label: 'Distance Reduced', value: `${metrics.distanceSaved}`, unit: 'km', sub: `↓ ${metrics.distanceImprovement}%`, colorStr: 'emerald', icon: <MdRoute size={24} /> },
    { label: 'Time Regained', value: `${metrics.timeSaved}`, unit: 'min', sub: `↓ ${metrics.timeImprovement}%`, colorStr: 'blue', icon: <MdTimer size={24} /> },
    { label: 'Fuel Conserved', value: `${fuelEstimate.saved}`, unit: 'L', sub: `≈ ₹${costSaved}`, colorStr: 'amber', icon: <MdLocalGasStation size={24} /> },
    { label: 'Optimized Stops', value: `${metrics.totalStops}`, unit: '', sub: `${metrics.highPriorityStops} critical`, colorStr: 'indigo', icon: <MdTrendingUp size={24} /> },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Performance Metrics</h1>
          <p className="page-subtitle">Analyze AI-driven route optimization and resource savings.</p>
        </div>
        <button onClick={runSimulation} disabled={loading} className="btn-premium px-6 py-3">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div> Re-running...
            </span>
          ) : (
            <span className="flex items-center gap-2"><MdPlayArrow size={22} /> Run Simulation Again</span>
          )}
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="premium-card p-5 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500 text-${card.colorStr}-500`}>
              {card.icon}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-${card.colorStr}-50 flex items-center justify-center text-${card.colorStr}-600 shadow-sm`}>
                {card.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight">{card.label}</span>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tight">
              {card.value} {card.unit && <span className="text-sm font-semibold text-slate-400 ml-1">{card.unit}</span>}
            </p>
            <p className={`text-xs font-bold text-${card.colorStr}-600 mt-2 bg-${card.colorStr}-50 px-2 py-1 rounded inline-block`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <h3 className="section-title">Distance Analyis (km)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distanceComparison} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="value" barSize={60} radius={[8, 8, 8, 8]}>
                {distanceComparison.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="premium-card p-6">
          <h3 className="section-title">Time Analysis (minutes)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeComparison} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="value" barSize={60} radius={[8, 8, 8, 8]}>
                {timeComparison.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Specs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Improvement % */}
        <div className="premium-card p-6">
          <h3 className="section-title">Efficiency Gains</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={savingsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} width={70} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="saved" barSize={36} radius={[0, 8, 8, 0]}>
                {savingsData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Pie */}
        <div className="premium-card p-6 flex flex-col">
          <h3 className="section-title">Fuel Consumption</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[{ name: 'Standard', value: parseFloat(fuelEstimate.fixed) }, { name: 'Optimized', value: parseFloat(fuelEstimate.optimized) }]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                  <Cell fill="#64748B" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-slate-500"></div>Standard: {fuelEstimate.fixed}L</div>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Optimal: {fuelEstimate.optimized}L</div>
          </div>
        </div>

        {/* Dense Specs Table */}
        <div className="premium-card p-6">
          <h3 className="section-title">Comparative Analysis</h3>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-[calc(100%-3rem)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics</span>
                <div className="flex text-xs font-bold uppercase tracking-wider gap-8 text-right">
                  <span className="text-slate-400 w-16">Standard</span>
                  <span className="text-emerald-500 w-16">AI Opt.</span>
                </div>
              </div>
              {[
                { label: 'Drive Dist', std: `${metrics.fixedDistance}km`, opt: `${metrics.optimizedDistance}km` },
                { label: 'Total Time', std: `${metrics.fixedTime}m`, opt: `${metrics.optimizedTime}m` },
                { label: 'Fuel Usage', std: `${fuelEstimate.fixed}L`, opt: `${fuelEstimate.optimized}L` },
                { label: 'Est. Cost', std: `₹${(parseFloat(fuelEstimate.fixed)*100).toFixed(0)}`, opt: `₹${(parseFloat(fuelEstimate.optimized)*100).toFixed(0)}` },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600">{row.label}</span>
                  <div className="flex gap-8 text-right">
                    <span className="text-slate-500 w-16">{row.std}</span>
                    <span className="text-emerald-600 w-16">{row.opt}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Efficiency Gain</span>
              <span className="text-xl font-black text-emerald-500 bg-emerald-100 px-3 py-1 rounded-lg">+{metrics.distanceImprovement}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
