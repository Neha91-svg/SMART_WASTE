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
  MdEco
} from 'react-icons/md';

/**
 * Sidebar Component — Pure White Floating Panel
 */
export default function Sidebar({ currentPath, closeMobile }) {
  const { user, role, setRole, logout } = useAuth(); // Assume we still toggle role for demo
  const isAdmin = role === 'Admin';

  const menuItems = isAdmin ? [
    { name: 'Dashboard', path: '/', icon: MdDashboard },
    { name: 'Route Map', path: '/map', icon: MdMap },
    { name: 'Efficiency', path: '/efficiency', icon: MdBarChart },
    { name: 'E-Waste Centers', path: '/e-waste', icon: MdRestore },
  ] : [
    { name: 'Dashboard', path: '/', icon: MdDashboard },
    { name: 'Report Waste', path: '/report', icon: MdDeleteOutline },
    { name: 'Request Pickup', path: '/pickup', icon: MdLocalShipping },
    { name: 'E-Waste Centers', path: '/e-waste', icon: MdRestore },
    { name: 'AI Assistant', path: '/ai-chat', icon: MdSmartToy },
  ];

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
        <div className="bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 flex relative mb-4">
          <div
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-500 rounded-lg shadow-sm transition-transform duration-300 ease-out z-0"
            style={{ transform: isAdmin ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
          />
          <button
            onClick={() => setRole('User')}
            className={`flex-1 flex justify-center items-center py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${!isAdmin ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            User
          </button>
          <button
            onClick={() => setRole('Admin')}
            className={`flex-1 flex justify-center items-center py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${isAdmin ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admin
          </button>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200 text-blue-600 font-bold text-sm shadow-sm">
            {isAdmin ? 'A' : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{isAdmin ? 'Admin Console' : 'Ritesh Jadhav'}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">{isAdmin ? 'System Admin' : 'Citizen'}</p>
          </div>
          {/* Mock logout button */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
