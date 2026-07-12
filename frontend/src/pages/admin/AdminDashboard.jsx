import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-50 rounded-lg p-6 border border-brand-100 flex flex-col items-start">
          <h3 className="text-lg font-semibold text-brand-900 mb-2">User Management</h3>
          <p className="text-gray-600 mb-4">View, create, and manage user accounts and assign roles.</p>
          <Link to="/admin/users" className="mt-auto inline-block bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition-colors">
            Manage Users
          </Link>
        </div>

        <div className="bg-brand-50 rounded-lg p-6 border border-brand-100 flex flex-col items-start">
          <h3 className="text-lg font-semibold text-brand-900 mb-2">Role Management</h3>
          <p className="text-gray-600 mb-4">Configure roles and precise permissions for the system.</p>
          <Link to="/admin/roles" className="mt-auto inline-block bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition-colors">
            Manage Roles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
