import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { MdMenu } from 'react-icons/md';
import Sidebar from './Sidebar';

/**
 * Layout Component — Wraps all pages with sidebar navigation
 */
export default function Layout({ role, setRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-light)] text-[var(--text-primary)]">
      <Sidebar role={role} setRole={setRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#facc15] border-b-4 border-[var(--border)] z-[30] flex items-center justify-between px-4 shadow-[0_2px_0px_#121212]">
        <div className="flex items-center gap-2">
          <span className="text-lg bg-white border-2 border-[var(--border)] rounded w-8 h-8 flex items-center justify-center font-bold shadow-[2px_2px_0px_#121212]">
            ♻️
          </span>
          <h1 className="text-sm font-extrabold text-black truncate tracking-tight uppercase">SmartWaste</h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 bg-white border-2 border-[var(--border)] rounded text-black shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#121212]"
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
