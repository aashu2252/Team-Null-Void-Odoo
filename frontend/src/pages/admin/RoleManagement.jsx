import React, { useState, useEffect } from 'react';
import { MODULES } from '../../config/permissions';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/roles');
      setRoles(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentRole(null);
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsEditing(true);
  };

  const handleEdit = (role) => {
    setCurrentRole(role);
    setName(role.name);
    setDescription(role.description);
    setSelectedPermissions(role.permissions);
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, description, permissions: selectedPermissions };
      if (currentRole) {
        await api.put(`/api/roles/${currentRole._id}`, payload);
        toast.success('Role updated successfully');
      } else {
        await api.post('/api/roles', payload);
        toast.success('Role created successfully');
      }
      setIsEditing(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/api/roles/${id}`);
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const togglePermission = (code) => {
    if (selectedPermissions.includes('*')) return; // Super admin
    
    if (selectedPermissions.includes(code)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== code));
    } else {
      setSelectedPermissions([...selectedPermissions, code]);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{currentRole ? 'Edit Role' : 'Create Role'}</h2>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800">
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
              <label className="flex items-center space-x-2 text-sm font-medium text-brand-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedPermissions.includes('*')}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedPermissions(['*']);
                    else setSelectedPermissions([]);
                  }}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Grant All Permissions (Super Admin)</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MODULES.map((module) => (
                <div key={module.moduleName} className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">{module.moduleName}</h4>
                  <div className="space-y-2">
                    {module.permissions.map((perm) => (
                      <label key={perm.code} className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={selectedPermissions.includes('*') || selectedPermissions.includes(perm.code)}
                          disabled={selectedPermissions.includes('*')}
                          onChange={() => togglePermission(perm.code)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
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
              Save Role
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Role Management</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded shadow hover:bg-brand-700 transition-colors"
        >
          + Add Role
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">Role Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Description</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Permissions</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{role.name}</td>
                <td className="px-4 py-3 text-gray-600">{role.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {role.permissions.includes('*') 
                    ? <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded text-xs font-bold">All</span>
                    : <span className="text-xs">{role.permissions.length} selected</span>
                  }
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  <button onClick={() => handleDelete(role._id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;
