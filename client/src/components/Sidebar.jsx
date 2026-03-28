import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdDeleteOutline,
  MdLocalShipping,
  MdMap,
  MdRecycling,
  MdSpeed,
  MdClose,
  MdAdminPanelSettings,
  MdPerson,
  MdSmartToy
} from 'react-icons/md';

/**
 * Sidebar Component — Professional navigation with role toggle
 */
export default function Sidebar({ role, setRole, mobileOpen, setMobileOpen }) {
  const userNavItems = [
    { to: '/', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { to: '/report-waste', icon: <MdDeleteOutline size={20} />, label: 'Report Waste' },
    { to: '/request-pickup', icon: <MdLocalShipping size={20} />, label: 'Request Pickup' },
    { to: '/ewaste-centers', icon: <MdRecycling size={20} />, label: 'E-Waste Centers' },
    { to: '/ai-chat', icon: <MdSmartToy size={20} />, label: 'AI Assistant' },
  ];

  const adminNavItems = [
    { to: '/', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { to: '/map', icon: <MdMap size={20} />, label: 'Route Map' },
    { to: '/efficiency', icon: <MdSpeed size={20} />, label: 'Efficiency' },
    { to: '/ewaste-centers', icon: <MdRecycling size={20} />, label: 'E-Waste Centers' },
  ];

  const currentNavItems = role === 'admin' ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative top-0 left-0 h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[260px] shrink-0 flex flex-col`}
        style={{ background: '#0f172a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-lg shadow-md">
              ♻️
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">SmartWaste</h1>
              <p className="text-[10px] text-emerald-400 font-medium mt-0.5 tracking-wide">PLATFORM</p>
            </div>
          </div>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 text-white lg:hidden hover:bg-white/20 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-5 mt-6 mb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Menu</p>
        </div>
        <nav className="px-3 flex flex-col gap-1 flex-1 overflow-y-auto mb-4">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Role Toggle */}
        <div className="p-3 mt-auto border-t border-white/10">
          <div className="px-1 pb-1">
            <p className="text-[10px] text-slate-500 mb-2 font-semibold uppercase tracking-wider text-center">Active Role</p>
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                  role === 'user'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <MdPerson size={16} /> User
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <MdAdminPanelSettings size={16} /> Admin
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
