import { useState, useEffect } from 'react';
import { optimizeRoute } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { MdSpeed, MdTrendingUp, MdLocalGasStation, MdTimer, MdRoute, MdPlayArrow } from 'react-icons/md';

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontWeight: '500',
  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  fontSize: '13px',
};

/**
 * Efficiency Simulation Page — Compare fixed vs optimized route
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
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="text-slate-500 text-sm font-medium">Running efficiency simulation...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="loading-container">
        <div className="text-center card p-10">
          <MdSpeed size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-lg font-bold text-slate-700 mb-2">No Simulation Data</h2>
          <p className="text-slate-500 text-sm mb-6">Load waste data and run the optimization.</p>
          <button onClick={runSimulation} className="btn-primary"><MdPlayArrow size={20} /> Run Simulation</button>
        </div>
      </div>
    );
  }

  const distanceComparison = [
    { name: 'Fixed Route', value: metrics.fixedDistance, fill: '#ef4444' },
    { name: 'Optimized', value: metrics.optimizedDistance, fill: '#059669' },
  ];

  const timeComparison = [
    { name: 'Fixed Route', value: metrics.fixedTime, fill: '#f59e0b' },
    { name: 'Optimized', value: metrics.optimizedTime, fill: '#3b82f6' },
  ];

  const savingsData = [
    { name: 'Distance', saved: metrics.distanceImprovement, fill: '#059669' },
    { name: 'Time', saved: metrics.timeImprovement, fill: '#3b82f6' },
  ];

  const fuelEstimate = {
    fixed: (metrics.fixedDistance * 0.15).toFixed(2),
    optimized: (metrics.optimizedDistance * 0.15).toFixed(2),
    saved: metrics.fuelSaved
  };

  const costSaved = (metrics.fuelSaved * 100).toFixed(0);

  const summaryCards = [
    { label: 'Distance Saved', value: `${metrics.distanceSaved}`, unit: 'km', sub: `↓ ${metrics.distanceImprovement}%`, color: '#059669', icon: <MdRoute size={20} /> },
    { label: 'Time Saved', value: `${metrics.timeSaved}`, unit: 'min', sub: `↓ ${metrics.timeImprovement}%`, color: '#3b82f6', icon: <MdTimer size={20} /> },
    { label: 'Fuel Saved', value: `${fuelEstimate.saved}`, unit: 'L', sub: `≈ ₹${costSaved}`, color: '#f59e0b', icon: <MdLocalGasStation size={20} /> },
    { label: 'Total Stops', value: `${metrics.totalStops}`, unit: '', sub: `${metrics.highPriorityStops} high priority`, color: '#8b5cf6', icon: <MdTrendingUp size={20} /> },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="page-header">
        <div className="page-header-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1>Efficiency Metrics</h1>
            <p className="page-subtitle">Compare fixed route vs. AI-optimized route performance</p>
          </div>
          <button onClick={runSimulation} disabled={loading} className="btn-primary px-5 shrink-0">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running...
              </span>
            ) : (
              <span className="flex items-center gap-2"><MdPlayArrow size={20} /> Re-run</span>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <div key={i} className="card p-4" style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg text-white shadow-sm" style={{ background: card.color }}>
                {card.icon}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value} {card.unit && <span className="text-sm font-semibold text-slate-400">{card.unit}</span>}
            </p>
            <p className="text-xs font-medium text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title">Distance Comparison (km)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distanceComparison} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} km`, 'Distance']} />
              <Bar dataKey="value" barSize={50} radius={[6, 6, 0, 0]}>
                {distanceComparison.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="section-title">Time Comparison (minutes)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeComparison} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} min`, 'Time']} />
              <Bar dataKey="value" barSize={50} radius={[6, 6, 0, 0]}>
                {timeComparison.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="section-title">Improvement %</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={savingsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} domain={[0, 100]} unit="%" axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={70} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value}%`, 'Improvement']} />
              <Bar dataKey="saved" barSize={30} radius={[0, 6, 6, 0]}>
                {savingsData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 flex flex-col">
          <h3 className="section-title">Fuel Usage</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[{ name: 'Fixed', value: parseFloat(fuelEstimate.fixed) }, { name: 'Optimized', value: parseFloat(fuelEstimate.optimized) }]} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="#fff" strokeWidth={2}>
                  <Cell fill="#ef4444" />
                  <Cell fill="#059669" />
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} L`, 'Fuel']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Fixed: {fuelEstimate.fixed}L</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span>Optimized: {fuelEstimate.optimized}L</span></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title">Detailed Specs</h3>
          <div className="space-y-0 text-sm">
            <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 p-2.5 rounded-t-lg border-b border-slate-100">
              <span>Metric</span>
              <span className="text-center">Fixed</span>
              <span className="text-center text-emerald-600">Optimal</span>
            </div>
            {[
              { metric: 'Distance', fixed: `${metrics.fixedDistance} km`, optimal: `${metrics.optimizedDistance} km` },
              { metric: 'Time', fixed: `${metrics.fixedTime} min`, optimal: `${metrics.optimizedTime} min` },
              { metric: 'Fuel', fixed: `${fuelEstimate.fixed} L`, optimal: `${fuelEstimate.optimized} L` },
              { metric: 'Cost (₹)', fixed: `₹${(parseFloat(fuelEstimate.fixed) * 100).toFixed(0)}`, optimal: `₹${(parseFloat(fuelEstimate.optimized) * 100).toFixed(0)}` },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-2 text-[13px] font-medium p-2.5 border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <span className="text-slate-500">{row.metric}</span>
                <span className="text-center text-red-500">{row.fixed}</span>
                <span className="text-center text-emerald-600">{row.optimal}</span>
              </div>
            ))}
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Overall Gain</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.distanceImprovement}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
