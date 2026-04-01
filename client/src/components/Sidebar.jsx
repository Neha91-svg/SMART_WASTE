import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdDashboard,
  MdDeleteOutline,
  MdLocalShipping,
  MdMap,
  MdBarChart,
  MdRestore,
  MdSmartToy,
  MdLogout,
  MdEco,
  MdGrain,
  MdBusinessCenter,
  MdStorefront,
  MdExplore,
  MdPeople,
  MdSatelliteAlt
} from 'react-icons/md';

/**
 * Sidebar Component — Pure White Floating Panel
 */
export default function Sidebar({ currentPath, closeMobile }) {
  const { user, role, setRole, logout } = useAuth();

  const getMenuItems = () => {
    switch(role) {
      case 'Admin':
        return [
          { name: 'Dashboard', path: '/', icon: MdDashboard },
          { name: 'Job Tracker', path: '/tracker', icon: MdExplore },
          { name: 'CRM', path: '/crm', icon: MdPeople },
          { name: 'Route Map', path: '/map', icon: MdMap },
          { name: 'Heatmap', path: '/heatmap', icon: MdGrain },
          { name: 'Efficiency', path: '/efficiency', icon: MdBarChart },
          { name: 'Satellite AI', path: '/satellite', icon: MdSatelliteAlt },
          { name: 'E-Waste Centers', path: '/e-waste', icon: MdRestore },
        ];
      case 'Business':
        return [
          { name: 'Business Hub', path: '/business', icon: MdBusinessCenter },
          { name: 'E-Waste Centers', path: '/e-waste', icon: MdRestore },
          { name: 'AI Assistant', path: '/ai-chat', icon: MdSmartToy },
        ];
      case 'Vendor':
        return [
          { name: 'Marketplace', path: '/vendor', icon: MdStorefront },
          { name: 'E-Waste Centers', path: '/e-waste', icon: MdRestore },
        ];
      case 'User':
      default:
        return [
          { name: 'Dashboard', path: '/', icon: MdDashboard },
          { name: 'Report Waste', path: '/report', icon: MdDeleteOutline },
          { name: 'Request Pickup', path: '/pickup', icon: MdLocalShipping },
          { name: 'E-Waste Centers', path: '/e-waste', icon: MdRestore },
          { name: 'AI Assistant', path: '/ai-chat', icon: MdSmartToy },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Brand Header */}
      <div className="p-6 shrink-0 flex items-center gap-3 border-b border-slate-100/50">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
          <MdEco size={24} />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">Eco-Air</h1>
          <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-1">Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 hide-scrollbar">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Menu</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                  : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Role Toggle & User Profile (Bottom) */}
      <div className="p-4 shrink-0 bg-slate-50/50 border-t border-slate-100">
        
        {/* Role Selector Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {['User', 'Admin', 'Business', 'Vendor'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors border ${
                role === r 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200 text-blue-600 font-bold text-sm shadow-sm shrink-0">
            {role.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">{user?.type}</p>
          </div>
          {/* Mock logout button */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
