import { useState, useEffect } from 'react';
import { getCRMCustomers, getCRMVendors, getCRMStats, updateCRMCustomer, updateCRMVendor } from '../services/api';
import {
  MdPeople, MdStorefront, MdTrendingUp, MdAttachMoney,
  MdSearch, MdFilterList, MdExpandMore, MdExpandLess,
  MdBusiness, MdApartment, MdStar, MdStarHalf, MdStarBorder,
  MdLocalShipping, MdCheckCircle, MdSchedule, MdWarning,
  MdEmail, MdPhone, MdLocationOn, MdEdit, MdSave, MdClose,
  MdReceipt, MdTimeline, MdWorkspacePremium
} from 'react-icons/md';

/**
 * AdminCRM — Full CRM for Admin to track Customers & Vendors
 * Two tabs: Customers & Vendors with expandable detail panels
 */
export default function AdminCRM() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [detailTab, setDetailTab] = useState('orders'); // orders | transactions
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [custRes, vendRes, statsRes] = await Promise.all([
        getCRMCustomers(),
        getCRMVendors(),
        getCRMStats()
      ]);
      setCustomers(custRes.data.data);
      setVendors(vendRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('CRM data load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredCustomers = customers.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (planFilter !== 'All' && c.plan !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.contactPerson.toLowerCase().includes(q) ||
             c.city.toLowerCase().includes(q) ||
             c.email.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredVendors = vendors.filter(v => {
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) ||
             v.contactPerson.toLowerCase().includes(q) ||
             v.city.toLowerCase().includes(q) ||
             v.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    setDetailTab('orders');
    setEditingNotes(null);
  };

  const handleSaveNotes = async (id, isVendor) => {
    try {
      if (isVendor) {
        await updateCRMVendor(id, { notes: notesValue });
        setVendors(prev => prev.map(v => v._id === id ? { ...v, notes: notesValue } : v));
      } else {
        await updateCRMCustomer(id, { notes: notesValue });
        setCustomers(prev => prev.map(c => c._id === id ? { ...c, notes: notesValue } : c));
      }
      setEditingNotes(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.3;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<MdStar key={i} className="text-amber-400" size={16} />);
      else if (i === full && hasHalf) stars.push(<MdStarHalf key={i} className="text-amber-400" size={16} />);
      else stars.push(<MdStarBorder key={i} className="text-slate-300" size={16} />);
    }
    return <div className="flex items-center gap-0.5">{stars}<span className="text-xs font-bold text-slate-500 ml-1">{rating}</span></div>;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Suspended': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getPlanStyle = (plan) => {
    switch (plan) {
      case 'Enterprise': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Premium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Basic': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'text-emerald-600 bg-emerald-50';
      case 'Scheduled': case 'In Progress': return 'text-blue-600 bg-blue-50';
      case 'Pending': return 'text-amber-600 bg-amber-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getTxnTypeStyle = (type) => {
    switch (type) {
      case 'Payment': case 'Payout': return 'text-emerald-600';
      case 'Refund': case 'Deduction': return 'text-red-500';
      case 'Credit': case 'Bonus': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="spinner-premium mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <MdPeople className="text-emerald-500" />
            CRM
          </h1>
          <p className="page-subtitle">Manage customers, vendors, orders, and transactions.</p>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="premium-card p-5 border-l-4 border-l-blue-500 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:scale-110 transition-transform">
              <MdPeople size={80} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Customers</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalCustomers}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">{stats.activeCustomers} active</p>
          </div>
          <div className="premium-card p-5 border-l-4 border-l-emerald-500 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:scale-110 transition-transform">
              <MdStorefront size={80} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Vendors</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalVendors}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">{stats.activeVendors} active</p>
          </div>
          <div className="premium-card p-5 border-l-4 border-l-indigo-500 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:scale-110 transition-transform">
              <MdTrendingUp size={80} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-slate-800">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">All-time collected</p>
          </div>
          <div className="premium-card p-5 border-l-4 border-l-amber-500 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:scale-110 transition-transform">
              <MdAttachMoney size={80} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vendor Payouts</p>
            <p className="text-3xl font-black text-slate-800">{formatCurrency(stats.totalPayouts)}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Avg rating: {stats.avgRating}★</p>
          </div>
        </div>
      )}

      {/* Main CRM Panel */}
      <div className="premium-card min-h-[600px] flex flex-col overflow-hidden">
        {/* Tab Bar & Controls */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              <button
                onClick={() => { setActiveTab('customers'); setExpandedId(null); setStatusFilter('All'); setPlanFilter('All'); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'customers' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MdPeople size={18} /> Customers
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'customers' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                }`}>{customers.length}</span>
              </button>
              <button
                onClick={() => { setActiveTab('vendors'); setExpandedId(null); setStatusFilter('All'); setPlanFilter('All'); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'vendors' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MdStorefront size={18} /> Vendors
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'vendors' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>{vendors.length}</span>
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, city..."
                  className="pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all w-64"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <MdFilterList className="text-slate-400" size={16} />
                <select
                  className="py-2 px-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                {activeTab === 'customers' && (
                  <select
                    className="py-2 px-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:border-emerald-400 cursor-pointer"
                    value={planFilter}
                    onChange={e => setPlanFilter(e.target.value)}
                  >
                    <option value="All">All Plans</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Content */}
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'customers' ? (
            <CustomerTable
              data={filteredCustomers}
              expandedId={expandedId}
              onToggle={handleToggleExpand}
              detailTab={detailTab}
              setDetailTab={setDetailTab}
              editingNotes={editingNotes}
              setEditingNotes={setEditingNotes}
              notesValue={notesValue}
              setNotesValue={setNotesValue}
              onSaveNotes={handleSaveNotes}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusStyle={getStatusStyle}
              getPlanStyle={getPlanStyle}
              getOrderStatusStyle={getOrderStatusStyle}
              getTxnTypeStyle={getTxnTypeStyle}
            />
          ) : (
            <VendorTable
              data={filteredVendors}
              expandedId={expandedId}
              onToggle={handleToggleExpand}
              detailTab={detailTab}
              setDetailTab={setDetailTab}
              editingNotes={editingNotes}
              setEditingNotes={setEditingNotes}
              notesValue={notesValue}
              setNotesValue={setNotesValue}
              onSaveNotes={handleSaveNotes}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              renderStars={renderStars}
              getStatusStyle={getStatusStyle}
              getOrderStatusStyle={getOrderStatusStyle}
              getTxnTypeStyle={getTxnTypeStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CUSTOMER TABLE
// ============================================================
function CustomerTable({
  data, expandedId, onToggle, detailTab, setDetailTab,
  editingNotes, setEditingNotes, notesValue, setNotesValue, onSaveNotes,
  formatCurrency, formatDate, getStatusStyle, getPlanStyle, getOrderStatusStyle, getTxnTypeStyle
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MdPeople className="text-slate-200 mb-4" size={64} />
        <p className="text-slate-400 font-bold text-sm">No customers match your criteria.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse min-w-[900px]">
      <thead>
        <tr className="border-b-2 border-slate-100">
          <th className="py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Customer</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Contact</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Location</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Plan</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Orders</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Revenue</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-12"></th>
        </tr>
      </thead>
      <tbody>
        {data.map(cust => (
          <>
            <tr
              key={cust._id}
              onClick={() => onToggle(cust._id)}
              className={`border-b border-slate-50 cursor-pointer transition-colors ${
                expandedId === cust._id ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              <td className="py-4 px-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    cust.type === 'Business' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                  }`}>
                    {cust.type === 'Business' ? <MdBusiness size={20} /> : <MdApartment size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{cust.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cust.type}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm font-semibold text-slate-700 truncate">{cust.contactPerson}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{cust.email}</p>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-slate-600 text-sm font-medium">
                  <MdLocationOn size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate max-w-[120px]">{cust.city}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getPlanStyle(cust.plan)}`}>
                  {cust.plan === 'Enterprise' && <MdWorkspacePremium size={12} />}
                  {cust.plan}
                </span>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm font-black text-slate-800">{cust.totalOrders}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Last: {formatDate(cust.lastOrderDate)}</p>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm font-black text-slate-800">{formatCurrency(cust.totalSpent)}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Avg: {formatCurrency(cust.totalOrders > 0 ? Math.round(cust.totalSpent / cust.totalOrders) : 0)}</p>
              </td>
              <td className="py-4 px-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(cust.status)}`}>
                  {cust.status}
                </span>
              </td>
              <td className="py-4 px-4">
                {expandedId === cust._id ? <MdExpandLess className="text-slate-400" size={20} /> : <MdExpandMore className="text-slate-400" size={20} />}
              </td>
            </tr>

            {/* Expanded Detail */}
            {expandedId === cust._id && (
              <tr key={`${cust._id}-detail`}>
                <td colSpan="8" className="p-0">
                  <div className="bg-gradient-to-b from-blue-50/30 to-white p-6 border-b-2 border-blue-100 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Contact & Info Card */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Details</h4>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-sm"><MdPeople className="text-slate-400 shrink-0" size={16} /><span className="font-semibold text-slate-700">{cust.contactPerson}</span></div>
                            <div className="flex items-center gap-2 text-sm"><MdEmail className="text-slate-400 shrink-0" size={16} /><span className="font-medium text-slate-600">{cust.email}</span></div>
                            <div className="flex items-center gap-2 text-sm"><MdPhone className="text-slate-400 shrink-0" size={16} /><span className="font-medium text-slate-600">{cust.phone}</span></div>
                            <div className="flex items-start gap-2 text-sm"><MdLocationOn className="text-slate-400 shrink-0 mt-0.5" size={16} /><span className="font-medium text-slate-600">{cust.address}</span></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Quick Stats</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{cust.totalOrders}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Orders</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{formatCurrency(cust.totalSpent)}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Total Spent</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{formatCurrency(cust.totalOrders > 0 ? Math.round(cust.totalSpent / cust.totalOrders) : 0)}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Avg Order</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{formatDate(cust.joinDate)}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Since</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle + Right: Orders & Transactions */}
                      <div className="lg:col-span-2 flex flex-col">
                        {/* Sub-tabs */}
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => setDetailTab('orders')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailTab === 'orders' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            <MdReceipt size={14} /> Orders ({cust.orders?.length || 0})
                          </button>
                          <button onClick={() => setDetailTab('transactions')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailTab === 'transactions' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            <MdTimeline size={14} /> Transactions ({cust.transactions?.length || 0})
                          </button>
                        </div>

                        {detailTab === 'orders' ? (
                          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex-1">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(cust.orders || []).map((ord, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="py-2.5 px-4 text-xs font-bold text-indigo-600">{ord.orderId}</td>
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{formatDate(ord.date)}</td>
                                    <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">{ord.wasteType}</td>
                                    <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{ord.weight} kg</td>
                                    <td className="py-2.5 px-4 text-xs font-black text-slate-800">₹{ord.amount?.toLocaleString()}</td>
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{ord.vendorAssigned}</td>
                                    <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getOrderStatusStyle(ord.status)}`}>{ord.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex-1">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(cust.transactions || []).map((txn, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{formatDate(txn.date)}</td>
                                    <td className="py-2.5 px-4"><span className={`text-xs font-bold ${getTxnTypeStyle(txn.type)}`}>{txn.type}</span></td>
                                    <td className="py-2.5 px-4 text-xs font-black text-slate-800">₹{Math.abs(txn.amount)?.toLocaleString()}</td>
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600 max-w-[250px] truncate">{txn.description}</td>
                                    <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getOrderStatusStyle(txn.status)}`}>{txn.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Admin Notes */}
                        <div className="mt-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Notes</h5>
                            {editingNotes === cust._id ? (
                              <div className="flex gap-2">
                                <button onClick={() => onSaveNotes(cust._id, false)} className="text-emerald-600 hover:text-emerald-700"><MdSave size={16} /></button>
                                <button onClick={() => setEditingNotes(null)} className="text-slate-400 hover:text-slate-600"><MdClose size={16} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingNotes(cust._id); setNotesValue(cust.notes || ''); }} className="text-slate-400 hover:text-slate-600"><MdEdit size={14} /></button>
                            )}
                          </div>
                          {editingNotes === cust._id ? (
                            <textarea
                              className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 resize-none"
                              rows={2}
                              value={notesValue}
                              onChange={e => setNotesValue(e.target.value)}
                            />
                          ) : (
                            <p className="text-sm text-slate-600 font-medium">{cust.notes || <span className="italic text-slate-400">No notes yet.</span>}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================
// VENDOR TABLE
// ============================================================
function VendorTable({
  data, expandedId, onToggle, detailTab, setDetailTab,
  editingNotes, setEditingNotes, notesValue, setNotesValue, onSaveNotes,
  formatCurrency, formatDate, renderStars, getStatusStyle, getOrderStatusStyle, getTxnTypeStyle
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MdStorefront className="text-slate-200 mb-4" size={64} />
        <p className="text-slate-400 font-bold text-sm">No vendors match your criteria.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse min-w-[900px]">
      <thead>
        <tr className="border-b-2 border-slate-100">
          <th className="py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Vendor</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Contact</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Service Area</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Rating</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Jobs</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Earnings</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
          <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-12"></th>
        </tr>
      </thead>
      <tbody>
        {data.map(vend => (
          <>
            <tr
              key={vend._id}
              onClick={() => onToggle(vend._id)}
              className={`border-b border-slate-50 cursor-pointer transition-colors ${
                expandedId === vend._id ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              <td className="py-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <MdLocalShipping size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{vend.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Fleet: {vend.fleetSize} vehicles</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm font-semibold text-slate-700 truncate">{vend.contactPerson}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{vend.email}</p>
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                  {vend.serviceArea?.slice(0, 3).map((area, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{area}</span>
                  ))}
                  {vend.serviceArea?.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-bold">+{vend.serviceArea.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">{renderStars(vend.rating)}</td>
              <td className="py-4 px-4">
                <p className="text-sm font-black text-slate-800">{vend.totalJobsCompleted}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Last: {formatDate(vend.lastJobDate)}</p>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm font-black text-slate-800">{formatCurrency(vend.totalEarnings)}</p>
              </td>
              <td className="py-4 px-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(vend.status)}`}>
                  {vend.status}
                </span>
              </td>
              <td className="py-4 px-4">
                {expandedId === vend._id ? <MdExpandLess className="text-slate-400" size={20} /> : <MdExpandMore className="text-slate-400" size={20} />}
              </td>
            </tr>

            {/* Expanded Detail */}
            {expandedId === vend._id && (
              <tr key={`${vend._id}-detail`}>
                <td colSpan="8" className="p-0">
                  <div className="bg-gradient-to-b from-emerald-50/30 to-white p-6 border-b-2 border-emerald-100 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Contact & Specializations */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Details</h4>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-sm"><MdPeople className="text-slate-400 shrink-0" size={16} /><span className="font-semibold text-slate-700">{vend.contactPerson}</span></div>
                            <div className="flex items-center gap-2 text-sm"><MdEmail className="text-slate-400 shrink-0" size={16} /><span className="font-medium text-slate-600">{vend.email}</span></div>
                            <div className="flex items-center gap-2 text-sm"><MdPhone className="text-slate-400 shrink-0" size={16} /><span className="font-medium text-slate-600">{vend.phone}</span></div>
                            <div className="flex items-start gap-2 text-sm"><MdLocationOn className="text-slate-400 shrink-0 mt-0.5" size={16} /><span className="font-medium text-slate-600">{vend.address}</span></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Specializations</h4>
                          <div className="flex flex-wrap gap-2">
                            {vend.specializations?.map((spec, i) => (
                              <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">{spec}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Performance</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{vend.totalJobsCompleted}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Jobs Done</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{formatCurrency(vend.totalEarnings)}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Earned</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{vend.fleetSize}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Fleet</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-black text-slate-800">{vend.rating}★</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Rating</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle + Right: Jobs & Transactions */}
                      <div className="lg:col-span-2 flex flex-col">
                        {/* Sub-tabs */}
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => setDetailTab('orders')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailTab === 'orders' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            <MdReceipt size={14} /> Jobs ({vend.jobs?.length || 0})
                          </button>
                          <button onClick={() => setDetailTab('transactions')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${detailTab === 'transactions' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            <MdTimeline size={14} /> Transactions ({vend.transactions?.length || 0})
                          </button>
                        </div>

                        {detailTab === 'orders' ? (
                          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex-1">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job ID</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earned</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(vend.jobs || []).map((job, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="py-2.5 px-4 text-xs font-bold text-emerald-600">{job.jobId}</td>
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{formatDate(job.date)}</td>
                                    <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">{job.clientName}</td>
                                    <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">{job.wasteType}</td>
                                    <td className="py-2.5 px-4 text-xs font-bold text-slate-800">{job.weight} kg</td>
                                    <td className="py-2.5 px-4 text-xs font-black text-slate-800">₹{job.amountEarned?.toLocaleString()}</td>
                                    <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getOrderStatusStyle(job.status)}`}>{job.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex-1">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(vend.transactions || []).map((txn, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{formatDate(txn.date)}</td>
                                    <td className="py-2.5 px-4"><span className={`text-xs font-bold ${getTxnTypeStyle(txn.type)}`}>{txn.type}</span></td>
                                    <td className="py-2.5 px-4 text-xs font-black text-slate-800">₹{Math.abs(txn.amount)?.toLocaleString()}</td>
                                    <td className="py-2.5 px-4 text-xs font-medium text-slate-600 max-w-[250px] truncate">{txn.description}</td>
                                    <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getOrderStatusStyle(txn.status)}`}>{txn.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Admin Notes */}
                        <div className="mt-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Notes</h5>
                            {editingNotes === vend._id ? (
                              <div className="flex gap-2">
                                <button onClick={() => onSaveNotes(vend._id, true)} className="text-emerald-600 hover:text-emerald-700"><MdSave size={16} /></button>
                                <button onClick={() => setEditingNotes(null)} className="text-slate-400 hover:text-slate-600"><MdClose size={16} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingNotes(vend._id); setNotesValue(vend.notes || ''); }} className="text-slate-400 hover:text-slate-600"><MdEdit size={14} /></button>
                            )}
                          </div>
                          {editingNotes === vend._id ? (
                            <textarea
                              className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 resize-none"
                              rows={2}
                              value={notesValue}
                              onChange={e => setNotesValue(e.target.value)}
                            />
                          ) : (
                            <p className="text-sm text-slate-600 font-medium">{vend.notes || <span className="italic text-slate-400">No notes yet.</span>}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}
