import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { MdMenu } from 'react-icons/md';
import Sidebar from './Sidebar';

/**
 * Layout Component — Clean wrapper with sidebar navigation
 */
export default function Layout({ role, setRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar role={role} setRole={setRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e2e8f0] z-[30] flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
            ♻️
          </div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">SmartWaste</h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MdMenu size={22} />
        </button>
      </div>

      <main className="flex-1 w-full h-screen overflow-y-auto pt-[4.5rem] pb-6 px-4 lg:pt-8 lg:pb-8 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
