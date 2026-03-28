import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MdMenu } from 'react-icons/md';
import { useState } from 'react';

/**
 * Layout Component — Hyper-Modern Light UI Framework
 */
export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-[#F4F7FB] overflow-hidden text-slate-800 font-sans relative">
      {/* Background Decorative Blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none"></div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2L2 19h20L12 2zm0 3.8l7.5 12.7H4.5L12 5.8z"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">Eco-Air</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-100 rounded-lg text-slate-600 active:scale-95 transition-transform">
          <MdMenu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Floating Sidebar Container */}
      <div className={`
        fixed lg:static top-0 left-0 h-full z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:w-72 lg:p-6
      `}>
        <div className="h-full w-72 lg:w-full bg-white lg:rounded-3xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.06)] border lg:border-slate-100 border-r border-slate-200 flex flex-col relative overflow-hidden">
          <Sidebar currentPath={location.pathname} closeMobile={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto pt-16 lg:pt-0 relative z-10 w-full lg:px-8 lg:py-6 px-4 py-4">
        <div className="max-w-[1400px] mx-auto w-full animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
