import { useState, useEffect } from 'react';
import { optimizeRoute } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { MdSpeed, MdTrendingUp, MdLocalGasStation, MdTimer, MdRoute, MdPlayArrow } from 'react-icons/md';

const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '3px solid #121212',
  boxShadow: '4px 4px 0px #121212',
  borderRadius: '4px',
  padding: '10px',
  fontWeight: 'bold',
  color: '#000',
};

/**
 * Efficiency Simulation Page — Compare before/after optimization with charts
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
      alert('Failed to run simulation. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  if (loading && !hasRun) {
    return (
      <div className="loading-container">
        <div className="text-center font-bold text-lg">
          <div className="spinner" style={{ borderTopColor: '#0ea5e9' }}></div>
          <p>Running efficiency simulation...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="loading-container">
        <div className="text-center brutalist-card bg-[#facc15] p-10">
          <MdSpeed size={56} className="mx-auto text-black mb-4" />
          <h2 className="text-xl font-extrabold text-black uppercase tracking-wide mb-2">No Simulation Data</h2>
          <p className="text-gray-700 font-semibold mb-6 text-sm">Load waste data and run the optimization simulation.</p>
          <button onClick={runSimulation} className="btn-primary px-6 py-3">
            <MdPlayArrow size={22} /> Run Simulation
          </button>
        </div>
      </div>
    );
  }

  // Chart data
  const distanceComparison = [
    { name: 'Fixed Route', value: metrics.fixedDistance, fill: '#ef4444' },
    { name: 'Optimized', value: metrics.optimizedDistance, fill: '#10b981' },
  ];

  const timeComparison = [
    { name: 'Fixed Route', value: metrics.fixedTime, fill: '#f59e0b' },
    { name: 'Optimized', value: metrics.optimizedTime, fill: '#06b6d4' },
  ];

  const savingsData = [
    { name: 'Distance', saved: metrics.distanceImprovement, fill: '#10b981' },
    { name: 'Time', saved: metrics.timeImprovement, fill: '#06b6d4' },
  ];

  const fuelEstimate = {
    fixed: (metrics.fixedDistance * 0.15).toFixed(2),
    optimized: (metrics.optimizedDistance * 0.15).toFixed(2),
    saved: metrics.fuelSaved
  };

  const costSaved = (metrics.fuelSaved * 100).toFixed(0);

  const summaryCards = [
    { label: 'Distance Saved', value: `${metrics.distanceSaved}`, unit: 'km', sub: `↓ ${metrics.distanceImprovement}% reduction`, color: '#10b981', icon: <MdRoute size={22} /> },
    { label: 'Time Saved', value: `${metrics.timeSaved}`, unit: 'min', sub: `↓ ${metrics.timeImprovement}% reduction`, color: '#0ea5e9', icon: <MdTimer size={22} /> },
    { label: 'Fuel Saved', value: `${fuelEstimate.saved}`, unit: 'L', sub: `≈ ₹${costSaved} saved`, color: '#f59e0b', icon: <MdLocalGasStation size={22} /> },
    { label: 'Total Stops', value: `${metrics.totalStops}`, unit: '', sub: `${metrics.highPriorityStops} high priority`, color: '#a855f7', icon: <MdTrendingUp size={22} /> },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="page-header" style={{ background: '#0ea5e9' }}>
        <div className="page-header-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1>Efficiency Metrics</h1>
            <p className="page-subtitle">Compare fixed route vs. AI-optimized route performance</p>
          </div>
          <button onClick={runSimulation} disabled={loading} className="btn-primary bg-[#facc15] text-black px-5 py-3 shrink-0">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin"></div>
                Running...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MdPlayArrow size={22} /> Re-run
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="brutalist-card bg-white p-4" style={{ borderTopWidth: '6px', borderTopColor: card.color }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-dashed border-gray-200">
              <div className="p-1.5 border-2 border-black text-white shadow-[2px_2px_0px_#121212] rounded" style={{ background: card.color }}>
                {card.icon}
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wide">{card.label}</span>
            </div>
            <p className="text-3xl font-black" style={{ color: card.color }}>
              {card.value} {card.unit && <span className="text-base">{card.unit}</span>}
            </p>
            <p className="text-[11px] font-bold text-gray-500 mt-1.5 bg-gray-100 px-1.5 py-0.5 border border-gray-200 inline-block rounded">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Comparison */}
        <div className="brutalist-card bg-white p-5">
          <h3 className="section-title">Distance Comparison (km)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distanceComparison} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
              <YAxis tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} km`, 'Distance']} />
              <Bar dataKey="value" barSize={50} stroke="#000" strokeWidth={3} radius={[4, 4, 0, 0]}>
                {distanceComparison.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Comparison */}
        <div className="brutalist-card bg-white p-5">
          <h3 className="section-title">Time Comparison (minutes)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeComparison} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
              <YAxis tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} min`, 'Time']} />
              <Bar dataKey="value" barSize={50} stroke="#000" strokeWidth={3} radius={[4, 4, 0, 0]}>
                {timeComparison.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Improvement % */}
        <div className="brutalist-card bg-white p-5">
          <h3 className="section-title">Improvement %</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={savingsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} domain={[0, 100]} unit="%" axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} width={70} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value}%`, 'Improvement']} />
              <Bar dataKey="saved" barSize={30} stroke="#000" strokeWidth={2} radius={[0, 4, 4, 0]}>
                {savingsData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Comparison */}
        <div className="brutalist-card bg-white p-5 flex flex-col">
          <h3 className="section-title">Fuel Usage</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Fixed Route', value: parseFloat(fuelEstimate.fixed) },
                    { name: 'Optimized', value: parseFloat(fuelEstimate.optimized) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={3}
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} L`, 'Fuel']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 bg-gray-50 border-2 border-gray-200 p-2 rounded font-bold text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-black bg-[#ef4444]"></div>
              <span>Fixed: {fuelEstimate.fixed}L</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-black bg-[#10b981]"></div>
              <span>Optimized: {fuelEstimate.optimized}L</span>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="brutalist-card bg-white p-5">
          <h3 className="section-title">Detailed Specs</h3>
          <div className="space-y-0 font-bold text-sm">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-[10px] uppercase text-gray-600 bg-gray-100 p-2 border-b-2 border-black">
              <span>Metric</span>
              <span className="text-center">Fixed</span>
              <span className="text-center text-[#10b981]">Optimum</span>
            </div>
            {/* Rows */}
            {[
              { metric: 'Distance', fixed: `${metrics.fixedDistance} km`, optimal: `${metrics.optimizedDistance} km` },
              { metric: 'Time', fixed: `${metrics.fixedTime} min`, optimal: `${metrics.optimizedTime} min` },
              { metric: 'Fuel', fixed: `${fuelEstimate.fixed} L`, optimal: `${fuelEstimate.optimized} L` },
              { metric: 'Cost (₹)', fixed: `₹${(parseFloat(fuelEstimate.fixed) * 100).toFixed(0)}`, optimal: `₹${(parseFloat(fuelEstimate.optimized) * 100).toFixed(0)}` },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-2 text-[13px] p-2 border-b border-gray-200 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <span className="text-gray-600">{row.metric}</span>
                <span className="text-center text-[#ef4444]">{row.fixed}</span>
                <span className="text-center text-[#10b981]">{row.optimal}</span>
              </div>
            ))}
            {/* Overall Gain */}
            <div className="mt-3 pt-3 border-t-[3px] border-black text-center bg-[#10b981]/10 p-3 rounded">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Overall Gain</p>
              <p className="text-3xl font-black text-[#10b981] mt-1">{metrics.distanceImprovement}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
