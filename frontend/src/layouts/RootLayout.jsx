import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

export default function RootLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Operations', path: '/operations' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Settings', path: '/settings' }
  ];

  const triggerToast = () => {
    toast.success('Welcome to TransitOps ERP!', {
      style: {
        background: '#1f2937',
        color: '#f3f4f6',
        border: '1px solid #374151'
      }
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={triggerToast}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl font-bold text-white">TO</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                TransitOps
              </h1>
              <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">ERP Platform</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-400 border-l-4 border-cyan-500 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-cyan-400 scale-125' : 'bg-slate-600 group-hover:bg-slate-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Summary */}
        <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-cyan-400 border border-slate-700">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">John Doe</p>
            <p className="text-xs text-slate-500 font-mono">ERP Administrator</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="text-sm text-slate-400">
            System Status: <span className="text-emerald-400 font-semibold">● Online</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={triggerToast}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 active:scale-95"
            >
              Test Notification
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-sm text-slate-300 font-medium">Hackathon DevMode</span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950/50">
          <Outlet />
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toaster position="top-right" />
    </div>
  );
}
