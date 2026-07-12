import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'User Management', href: '/admin/users' },
    { name: 'Role Management', href: '/admin/roles' },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname !== '/admin') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-bg-secondary text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center px-6 bg-brand-950 font-bold text-xl tracking-wider">
          TRANSITOPS ADMIN
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-4 py-3 rounded-md transition-colors font-medium ${
                isActive(item.href)
                  ? 'bg-brand-700 text-white'
                  : 'text-brand-100 hover:bg-brand-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 bg-brand-950">
          <Link to="/login" className="block text-center px-4 py-2 text-brand-100 hover:text-white transition-colors">
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">
            {navigation.find((n) => isActive(n.href))?.name || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-medium text-gray-700">Admin User</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-bg-secondary">
          <div className="mx-auto max-w-6xl bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
