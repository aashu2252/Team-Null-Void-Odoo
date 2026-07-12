import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuSections = [
    {
      title: 'General',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
        )}
      ]
    },
    {
      title: 'Fleet',
      items: [
        { name: 'Vehicles', path: '/dashboard/vehicles', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )},
        { name: 'Drivers', path: '/dashboard/drivers', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )},
        { name: 'Trips', path: '/dashboard/trips', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        )}
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Maintenance', path: '/dashboard/maintenance', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )},
        { name: 'Fuel Logs', path: '/dashboard/fuel-logs', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
          </svg>
        )},
        { name: 'Expenses', path: '/dashboard/expenses', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', path: '/dashboard/reports', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9-1h2a2 2 0 002-2v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2v3a2 2 0 002 2z" />
          </svg>
        )}
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Settings', path: '/dashboard/settings', icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        )}
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar Layout */}
      <aside className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-8 cursor-pointer select-none">
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl font-bold text-white">TO</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-md font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  TransitOps
                </h1>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">ERP Platform</p>
              </div>
            )}
          </div>

          {/* Collapsible Menu Lists */}
          <div className="space-y-6">
            {menuSections.map((section, secIdx) => (
              <div key={secIdx} className="space-y-2">
                {/* Header label for groups */}
                {!collapsed && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-slate-800/80 text-cyan-400 font-semibold shadow-inner border-l-4 border-cyan-500'
                            : 'text-slate-450 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                        title={collapsed ? item.name : undefined}
                      >
                        <div className={`transition-transform duration-100 ${isActive ? 'scale-105' : 'text-slate-450'}`}>
                          {item.icon}
                        </div>
                        {!collapsed && <span className="text-sm">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer collapse toggle */}
        <div className="p-4 border-t border-slate-850 flex justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors duration-100 active:scale-95"
            title={collapsed ? "Expand menu" : "Collapse menu"}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-300 select-none">
              TransitOps Console
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* User credentials */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-sm shadow-inner">
                {user?.firstName ? user.firstName.substring(0, 1).toUpperCase() + (user.lastName ? user.lastName.substring(0, 1).toUpperCase() : '') : 'TO'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'John Doe'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {user?.role?.name || user?.role || 'Dispatcher'}
                </p>
              </div>
            </div>

            <span className="text-slate-750">|</span>

            {/* Logout button */}
            <button
              onClick={logout}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all duration-100 active:scale-95 shadow-md flex items-center gap-1.5 font-semibold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Content viewport */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
