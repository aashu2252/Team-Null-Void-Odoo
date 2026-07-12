import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState(''); // Only needed for create

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/roles')
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole(roles.length > 0 ? roles[0]._id : '');
    setIsActive(true);
    setIsEditing(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setRole(user.role?._id || user.role);
    setIsActive(user.isActive);
    setPassword(''); // Reset password field when opening edit
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { firstName, lastName, email, role, isActive };
      if (password.trim() !== '') {
        payload.password = password;
      }
      
      if (currentUser) {
        await api.put(`/api/users/${currentUser._id}`, payload);
        toast.success('User updated successfully');
      } else {
        await api.post('/api/auth/register', payload);
        toast.success('User created successfully');
      }
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/users/${id}`);
        toast.success('User deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{currentUser ? 'Edit User' : 'Create User'}</h2>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className={currentUser ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currentUser ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required={!currentUser}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500 bg-white"
              >
                {roles.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Account Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 shadow"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition-colors"
        >
          + Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {user.role?.name || 'No Role'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isActive 
                    ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Active</span>
                    : <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">Inactive</span>
                  }
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  {user.role?.name !== 'Super Admin' && (
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
