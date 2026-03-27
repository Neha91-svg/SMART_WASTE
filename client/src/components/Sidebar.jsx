import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  MdDashboard,
  MdDeleteOutline,
  MdLocalShipping,
  MdMap,
  MdRecycling,
  MdSpeed,
  MdClose,
  MdAdminPanelSettings,
  MdPerson
} from 'react-icons/md';

/**
 * Sidebar Component — Navigation with role toggle (Admin/User)
 */
export default function Sidebar({ role, setRole, mobileOpen, setMobileOpen }) {
  const userNavItems = [
    { to: '/', icon: <MdDashboard size={26} />, label: 'Dashboard' },
    { to: '/report-waste', icon: <MdDeleteOutline size={26} />, label: 'Report Waste' },
    { to: '/request-pickup', icon: <MdLocalShipping size={26} />, label: 'Request Pickup' },
    { to: '/ewaste-centers', icon: <MdRecycling size={26} />, label: 'E-Waste Centers' },
  ];

  const adminNavItems = [
    { to: '/', icon: <MdDashboard size={26} />, label: 'Dashboard' },
    { to: '/map', icon: <MdMap size={26} />, label: 'Route Map' },
    { to: '/efficiency', icon: <MdSpeed size={26} />, label: 'Efficiency' },
    { to: '/ewaste-centers', icon: <MdRecycling size={26} />, label: 'E-Waste Centers' },
  ];

  const currentNavItems = role === 'admin' ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative top-0 left-0 h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[240px] shrink-0 flex flex-col`}
        style={{ background: 'var(--bg-sidebar)', borderRight: '4px solid #121212' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4" style={{ borderColor: '#121212' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl bg-[#facc15] text-black w-10 h-10 flex items-center justify-center rounded-lg border-2 border-black font-extrabold shadow-[2px_2px_0px_#121212]">
              ♻️
            </span>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight leading-none">SmartWaste</h1>
              <p className="text-[11px] text-[#10b981] font-bold uppercase tracking-widest mt-0.5">Platform</p>
            </div>
          </div>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded bg-white text-black lg:hidden border-2 border-black shadow-[2px_2px_0px_#121212]"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-5 mt-8 mb-3">
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Navigation</p>
        </div>
        <nav className="px-3 flex flex-col gap-4 flex-1 overflow-y-auto mb-6">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-4 py-3.5 rounded-lg font-extrabold text-[15px] uppercase tracking-wide border-2 transition-all ${
                  isActive 
                    ? 'bg-[#facc15] text-black border-black shadow-[4px_4px_0px_#121212] -translate-y-[2px]' 
                    : 'bg-transparent text-gray-300 border-transparent hover:bg-white/5 hover:text-white'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-4">
                    {/* Optional left visual anchor mimicking the image's left bar, integrated with Brutalism */}
                    {isActive && (
                      <div className="absolute left-[-2px] inset-y-[-2px] w-2.5 bg-black border-r-2 border-black rounded-l-md" />
                    )}
                    <span className={`transition-transform duration-200 ${isActive ? 'translate-x-2' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`transition-transform duration-200 ${isActive ? 'translate-x-2' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  {/* Right dot indicator for active state matching reference image */}
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-black mr-1" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Role Toggle */}
        <div className="p-3 mt-auto border-t-2" style={{ borderColor: '#2a2a2a' }}>
          <div className="bg-[#0f0f0f] p-2.5 border-2 border-gray-700 rounded-lg">
            <p className="text-[10px] text-[#10b981] mb-2 font-black uppercase tracking-widest text-center">Active Role</p>
            <div className="flex gap-2">
              <button
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-extrabold uppercase transition-all border-2 ${
                  role === 'user'
                    ? 'bg-[#facc15] text-black border-black shadow-[2px_2px_0px_#121212]'
                    : 'bg-transparent text-gray-500 border-gray-600 hover:border-gray-400 hover:text-white'
                }`}
              >
                <MdPerson size={18} /> User
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-extrabold uppercase transition-all border-2 ${
                  role === 'admin'
                    ? 'bg-[#facc15] text-black border-black shadow-[2px_2px_0px_#121212]'
                    : 'bg-transparent text-gray-500 border-gray-600 hover:border-gray-400 hover:text-white'
                }`}
              >
                <MdAdminPanelSettings size={18} /> Admin
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
