import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import usePermissions from '../hooks/usePermissions';
import AIAssistant from '../components/AIAssistant';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  CreditCard,
  FileBarChart,
  Settings,
  Bell,
  Search,
  MessageSquare,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  Keyboard,
  LogOut,
  Sparkles,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeOrg, setActiveOrg] = useState('Apex Logistics Inc.');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { hasPermission } = usePermissions();

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requiredPermission: 'dashboard.view' },
    { name: 'Fleet', path: '/dashboard/vehicles', icon: Truck, requiredPermission: 'vehicle.view' },
    { name: 'Drivers', path: '/dashboard/drivers', icon: Users, requiredPermission: 'driver.view' },
    { name: 'Trips', path: '/dashboard/trips', icon: Route, requiredPermission: 'trip.view' },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: Wrench, requiredPermission: 'maintenance.view' },
    { name: 'Fuel & Expenses', path: '/dashboard/expenses', icon: Fuel, requiredPermission: 'expense.view' },
    { name: 'Analytics', path: '/dashboard/reports', icon: FileBarChart, requiredPermission: 'analytics.view' },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, requiredPermission: '*' } // Only super admins for now or add a specific setting permission
  ];

  const menuItems = allMenuItems.filter(item => hasPermission(item.requiredPermission) || hasPermission('*'));

  const commandPaletteItems = [
    { name: 'Go to Dashboard', shortcut: 'G + D', action: () => navigate('/dashboard') },
    { name: 'View Fleet', shortcut: 'G + F', action: () => navigate('/dashboard/vehicles') },
    { name: 'View Drivers', shortcut: 'G + DR', action: () => navigate('/dashboard/drivers') },
    { name: 'Dispatch New Trip', shortcut: 'G + T', action: () => navigate('/dashboard/trips') },
    { name: 'Check Maintenance', shortcut: 'G + M', action: () => navigate('/dashboard/maintenance') },
    { name: 'Check Fuel & Expenses', shortcut: 'G + E', action: () => navigate('/dashboard/expenses') },
    { name: 'View Analytics', shortcut: 'G + A', action: () => navigate('/dashboard/reports') },
    { name: 'Settings Center', shortcut: 'G + S', action: () => navigate('/dashboard/settings') },
    { name: 'Toggle Dark/Light Theme', shortcut: 'T + T', action: () => toggleTheme() },
  ];

  const filteredPaletteItems = commandPaletteItems.filter((item) =>
    item.name.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  const notifications = [
    { id: 1, text: 'Alert: Trip TRK-109 is delayed near Philadelphia', type: 'error', time: '10m ago' },
    { id: 2, text: 'Maintenance: Engine Check due for VH-204', type: 'warning', time: '1h ago' },
    { id: 3, text: 'Safety Score: Driver Marcus Vance hit 98% rating!', type: 'success', time: '4h ago' }
  ];

  return (
    <div className="flex h-screen bg-bg-app text-txt-primary overflow-hidden transition-colors duration-300">

      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:flex flex-col justify-between bg-sidebar-bg border-r border-border-custom transition-all duration-350 z-20 shrink-0 ${collapsed ? 'w-20' : 'w-64'
        }`}>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-8 px-2 select-none justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-brand-primary to-brand-teal flex items-center justify-center shadow-lg shadow-brand-primary/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-md font-bold tracking-tight text-txt-primary">
                    TransitOps
                  </h1>
                  <p className="text-[10px] text-brand-teal font-bold uppercase tracking-wider">Console Center</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1.5">
            {menuItems.map((item, itemIdx) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={itemIdx}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative ${isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-txt-secondary hover:bg-surface hover:text-txt-primary'
                    }`}
                  title={collapsed ? item.name : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-primary' : 'text-txt-secondary'}`} />
                  {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-custom flex items-center justify-between">
          {!collapsed && (
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs font-semibold text-brand-danger hover:bg-brand-danger/10 px-3 py-2 rounded-xl transition-colors cursor-pointer w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
          {collapsed && (
            <button
              onClick={logout}
              className="text-brand-danger hover:bg-brand-danger/10 p-2.5 rounded-xl transition-colors cursor-pointer mx-auto"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Sticky Glass Navbar */}
        <header className="h-16 border-b border-border-custom bg-card-bg/85 backdrop-blur-[18px] flex items-center justify-between px-6 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-surface transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Org Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface text-xs font-bold tracking-tight text-txt-primary transition-colors cursor-pointer select-none border border-border-custom/50"
              >
                <span>{activeOrg}</span>
                <ChevronDown className="w-3.5 h-3.5 text-txt-secondary" />
              </button>
              {showOrgDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowOrgDropdown(false)} />
                  <div className="absolute left-0 mt-2 w-48 bg-card-bg border border-border-custom rounded-xl shadow-xl z-50 py-1.5">
                    <button
                      onClick={() => { setActiveOrg('Apex Logistics Inc.'); setShowOrgDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-surface font-semibold"
                    >
                      Apex Logistics Inc.
                    </button>
                    <button
                      onClick={() => { setActiveOrg('TransitOps West Coast'); setShowOrgDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-surface font-semibold"
                    >
                      TransitOps West Coast
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1.5 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-surface transition-colors cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Command className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-surface transition-colors focus:outline-none"
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

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

          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 focus:outline-none max-w-[1680px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Operations Assistant */}
      <AIAssistant />

      {/* Command Palette Drawer / Modal */}
      <AnimatePresence>
        {showPalette && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-card-bg border border-border-custom rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-3.5 border-b border-border-custom flex items-center gap-3">
                <Search className="w-4 h-4 text-txt-secondary" />
                <input
                  type="text"
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  placeholder="Type a command or page name..."
                  className="flex-1 bg-transparent border-none text-xs text-txt-primary placeholder-txt-muted focus:outline-none focus:ring-0"
                  autoFocus
                />
                <button
                  onClick={() => setShowPalette(false)}
                  className="text-[10px] bg-surface px-2 py-1 rounded text-txt-secondary border border-border-custom cursor-pointer"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {filteredPaletteItems.length > 0 ? (
                  filteredPaletteItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setShowPalette(false);
                      }}
                      className="w-full text-left flex justify-between items-center px-3.5 py-2.5 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary text-xs text-txt-secondary font-medium transition-colors cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono text-txt-muted bg-surface/50 border border-border-custom px-2 py-0.5 rounded">
                        {item.shortcut}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-txt-secondary">
                    No results found for "{paletteSearch}"
                  </div>
                )}
              </div>
            </motion.div>
            <div className="fixed inset-0 -z-10" onClick={() => setShowPalette(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative flex flex-col w-72 max-w-xs bg-sidebar-bg border-r border-border-custom p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-teal flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-sm font-bold text-txt-primary">TransitOps</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-surface text-txt-secondary hover:text-txt-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 mt-4">
                {menuItems.map((item, itemIdx) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${isActive
                          ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                          : 'text-txt-secondary hover:bg-surface hover:text-txt-primary'
                        }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'text-txt-secondary'}`} />
                      <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border-custom">
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-xs font-semibold text-brand-danger w-full hover:bg-brand-danger/10 px-3 py-2.5 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
