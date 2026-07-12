import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Trash2, ShieldCheck, Mail, Phone, Award, Eye, Edit, SlidersHorizontal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const availableColumns = [
  { id: 'driver', label: 'Driver Details' },
  { id: 'contact', label: 'Contact Info' },
  { id: 'license', label: 'License' },
  { id: 'safety', label: 'Safety Score' },
  { id: 'status', label: 'Status' }
];

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState(['driver', 'contact', 'status']);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const columnToggleRef = useRef(null);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/api/drivers');
        if (res.data && res.data.success) {
          const data = res.data.data.drivers || res.data.data;
          setDrivers(data);
        }
      } catch (err) {
        toast.error('Failed to load drivers');
      } finally {
        setIsLoading(false);
      }
    };
    loadDrivers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnToggleRef.current && !columnToggleRef.current.contains(event.target)) {
        setShowColumnToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const name = d.user ? `${d.user.firstName} ${d.user.lastName}` : '';
      const email = d.user?.email || '';

      const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, search, statusFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredDrivers.map(d => d._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleDeleteDriver = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/api/drivers/${id}`);
        setDrivers(prev => prev.filter(d => d._id !== id));
        toast.success('Driver deleted successfully');
      } catch (err) {
        toast.error('Failed to delete driver');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} drivers?`)) {
      try {
        await Promise.all(selectedIds.map(id => api.delete(`/api/drivers/${id}`)));
        setDrivers(prev => prev.filter(d => !selectedIds.includes(d._id)));
        setSelectedIds([]);
        toast.success('Drivers deleted successfully');
      } catch (err) {
        toast.error('Failed to delete some drivers');
      }
    }
  };

  const exportToCSV = () => {
    if (drivers.length === 0) return;
    const headers = ['Driver Name', 'Email', 'Mobile', 'License Number', 'Category', 'Status', 'Safety Score'];
    const rows = filteredDrivers.map(d => [
      d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown',
      d.user?.email || '',
      d.user?.mobile || '',
      d.licenseNumber,
      d.licenseCategory,
      d.status,
      d.safetyScore
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'drivers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (colId) => {
    setVisibleColumns(prev =>
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-brand-success/10 text-brand-success border-brand-success/20';
      case 'On Trip': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'Off Duty': return 'bg-brand-warning/10 text-brand-warning border-brand-warning/20';
      case 'Suspended': return 'bg-brand-danger/10 text-brand-danger border-brand-danger/20';
      default: return 'bg-surface text-txt-secondary border-border-custom';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Driver Management</h1>
          <p className="text-sm text-txt-secondary mt-1">Manage driver personnel, licenses, and performance</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-custom text-txt-primary rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link to="/dashboard/drivers/create" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20 transition-all">
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </Link>
        </div>
      </div>

      <div className="bg-card-bg border border-border-custom rounded-3xl p-4 shadow-premium">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
              <input
                type="text"
                placeholder="Search by name, email or license..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-brand-danger/10 text-brand-danger rounded-xl text-sm font-bold hover:bg-brand-danger/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete ({selectedIds.length})</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative" ref={columnToggleRef}>
              <button onClick={() => setShowColumnToggle(!showColumnToggle)} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-custom text-txt-primary rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors shadow-sm">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Columns</span>
              </button>
              <AnimatePresence>
                {showColumnToggle && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-56 bg-card-bg border border-border-custom rounded-2xl shadow-premium z-20 p-2 overflow-hidden">
                    {availableColumns.map(col => (
                      <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-surface rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => toggleColumn(col.id)} className="w-4 h-4 rounded border-border-custom text-brand-primary focus:ring-brand-primary bg-surface" />
                        <span className="text-sm font-semibold text-txt-primary">{col.label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-custom">
                <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary w-12">
                  <input type="checkbox" checked={selectedIds.length === filteredDrivers.length && filteredDrivers.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-border-custom text-brand-primary focus:ring-brand-primary bg-surface" />
                </th>
                {visibleColumns.includes('driver') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Driver Details</th>}
                {visibleColumns.includes('contact') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Contact Info</th>}
                {visibleColumns.includes('license') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">License</th>}
                {visibleColumns.includes('safety') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Safety Score</th>}
                {visibleColumns.includes('status') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Status</th>}
                <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    <p className="text-sm text-txt-secondary mt-2">Loading drivers...</p>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface mb-3">
                      <Search className="w-6 h-6 text-txt-secondary" />
                    </div>
                    <h3 className="text-sm font-bold text-txt-primary">No drivers found</h3>
                    <p className="text-xs text-txt-secondary mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const driverName = driver.user ? `${driver.user.firstName} ${driver.user.lastName}` : 'Unknown Driver';
                  return (
                    <motion.tr key={driver._id} layoutId={`driver-row-${driver._id}`} className="group border-b border-border-custom/50 hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-4">
                        <input type="checkbox" checked={selectedIds.includes(driver._id)} onChange={() => handleSelectRow(driver._id)} className="w-4 h-4 rounded border-border-custom text-brand-primary focus:ring-brand-primary bg-surface" />
                      </td>
                      {visibleColumns.includes('driver') && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {driver.user?.profilePicture ? (
                              <img src={driver.user.profilePicture} alt={driverName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                                {driverName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-txt-primary">{driverName}</p>
                              <p className="text-xs text-txt-secondary">Added {new Date(driver.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('contact') && (
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-txt-secondary">
                              <Mail className="w-3 h-3" />
                              <span>{driver.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-txt-secondary">
                              <Phone className="w-3 h-3" />
                              <span>{driver.user?.mobile || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('license') && (
                        <td className="py-4 px-4">
                          <p className="text-sm font-bold text-txt-primary uppercase">{driver.licenseNumber}</p>
                          <p className="text-xs text-txt-secondary">{driver.licenseCategory}</p>
                        </td>
                      )}
                      {visibleColumns.includes('safety') && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-surface dark:bg-card-elevated h-2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${driver.safetyScore <= 70 ? 'bg-brand-danger' : driver.safetyScore <= 90 ? 'bg-brand-orange' : 'bg-brand-success'}`} style={{ width: `${driver.safetyScore || 100}%` }} />
                            </div>
                            <span className="text-sm font-bold text-txt-primary">{driver.safetyScore || 100}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('status') && (
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(driver.status)}`}>
                            {driver.status === 'Available' ? <CheckCircle2 className="w-3.5 h-3.5" /> : driver.status === 'Suspended' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                            {driver.status}
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/dashboard/drivers/${driver._id}`} className="p-2 text-txt-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/dashboard/drivers/${driver._id}/edit`} className="p-2 text-txt-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDeleteDriver(driver._id, driverName)} className="p-2 text-txt-secondary hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
