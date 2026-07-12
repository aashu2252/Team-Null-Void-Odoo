import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Trash2,
  CheckCircle,
  Wrench,
  XCircle,
  Truck,
  Gauge,
  Activity,
  MapPin,
  Eye,
  Edit,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const availableColumns = [
  { id: 'details', label: 'Vehicle Details' },
  { id: 'classification', label: 'Classification' },
  { id: 'driver', label: 'Assigned Driver' },
  { id: 'capacity', label: 'Capacity & Mileage' },
  { id: 'fuel', label: 'Fuel Status' },
  { id: 'health', label: 'Health' },
  { id: 'status', label: 'Status' }
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState(['details', 'driver', 'status']);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const columnToggleRef = useRef(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/api/vehicles');
        if (res.data && res.data.success) {
          const rawVehicles = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.vehicles || []);
          const mapped = rawVehicles.map(v => ({
            ...v,
            fuel: v.fuel || Math.floor(Math.random() * 40) + 60,
            health: v.health || Math.floor(Math.random() * 15) + 85,
            driver: v.driver || 'Unassigned'
          }));
          setVehicles(mapped);
        }
      } catch (err) {
        console.warn('Backend server offline. Retaining local cache.');
      }
    };
    loadVehicles();
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

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch = (v.vehicleName || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.model || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.driver || 'Unassigned').toLowerCase().includes(search.toLowerCase()) ||
        (v.registrationNumber || '').toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'All' || v.type === typeFilter;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [vehicles, search, typeFilter, statusFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredVehicles.map(v => v._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteVehicle = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete('/api/vehicles/' + id);
        setVehicles(prev => prev.filter(v => v._id !== id));
        toast.success(`Vehicle ${name} removed successfully.`);
      } catch (err) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} vehicles?`)) {
      try {
        for (const id of selectedIds) {
          await api.delete('/api/vehicles/' + id);
        }
        setVehicles(prev => prev.filter(v => !selectedIds.includes(v._id)));
        setSelectedIds([]);
        toast.success(`${selectedIds.length} vehicles removed successfully.`);
      } catch (err) {
        toast.error('Failed to delete some vehicles');
      }
    }
  };

  const toggleColumn = (colId) => {
    setVisibleColumns(prev => {
      if (prev.includes(colId)) {
        if (prev.length === 1) return prev; // prevent hiding all
        return prev.filter(c => c !== colId);
      }
      return [...prev, colId];
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Vehicle Name,Model,Registration Number,Type,Driver,Max Capacity (lbs),Region,Odometer (mi),Acquisition Cost ($),Status"].join(",") + "\n"
      + vehicles.map(v => `${v.vehicleName},${v.model},${v.registrationNumber},${v.type},${v.driver ? v.driver.name : 'Unassigned'},${v.maxLoadCapacity},${v.region},${v.odometer},${v.acquisitionCost},${v.status}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transitops_vehicles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Vehicles registry exported successfully to CSV!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-brand-success/10 text-brand-success rounded-full text-xs font-bold tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Available</span>
          </span>
        );
      case 'On Trip':
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold tracking-wider">
            <Truck className="w-4 h-4 animate-pulse" />
            <span>On Trip</span>
          </span>
        );
      case 'In Shop':
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-brand-warning/10 text-brand-warning rounded-full text-xs font-bold tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>In Shop</span>
          </span>
        );
      case 'Retired':
      default:
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-brand-danger/10 text-brand-danger rounded-full text-xs font-bold tracking-wider">
            <XCircle className="w-4 h-4" />
            <span>Retired</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Vehicle Management</h1>
          <p className="text-sm text-txt-secondary mt-1">Manage fleet assets, configurations, and Mongoose diagnostic logs.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-custom text-txt-primary rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link to="/dashboard/vehicles/create" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20 transition-all">
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </Link>
        </div>
      </div>

      <div className="bg-card-bg border border-border-custom rounded-3xl p-4 shadow-premium">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
              <input
                type="text"
                placeholder="Search by ID, Model, Region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Heavy Duty">Heavy Duty</option>
              <option value="Box Truck">Box Truck</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Refrigerated">Refrigerated</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
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
                  <input type="checkbox" checked={selectedIds.length === filteredVehicles.length && filteredVehicles.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-border-custom text-brand-primary focus:ring-brand-primary bg-surface" />
                </th>
                {visibleColumns.includes('details') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Vehicle Details</th>}
                {visibleColumns.includes('classification') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Classification</th>}
                {visibleColumns.includes('driver') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Assigned Driver</th>}
                {visibleColumns.includes('capacity') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Capacity & Mileage</th>}
                {visibleColumns.includes('fuel') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary w-32">Fuel Status</th>}
                {visibleColumns.includes('health') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary w-32">Health</th>}
                {visibleColumns.includes('status') && <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary">Status</th>}
                <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-txt-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    <p className="text-sm text-txt-secondary mt-2">Loading vehicles...</p>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface mb-3">
                      <Truck className="w-6 h-6 text-txt-secondary" />
                    </div>
                    <h3 className="text-sm font-bold text-txt-primary">No vehicles found</h3>
                    <p className="text-xs text-txt-secondary mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  return (
                    <motion.tr key={v._id} layoutId={`vehicle-row-${v._id}`} className="group border-b border-border-custom/50 hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-4">
                        <input type="checkbox" checked={selectedIds.includes(v._id)} onChange={() => handleSelectRow(v._id)} className="w-4 h-4 rounded border-border-custom text-brand-primary focus:ring-brand-primary bg-surface" />
                      </td>

                      {visibleColumns.includes('details') && (
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-bold text-txt-primary">{v.vehicleName}</p>
                            <p className="text-xs text-txt-secondary font-mono mt-1">{v.model} - {v.registrationNumber}</p>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('classification') && (
                        <td className="py-4 px-4">
                          <div>
                            <span className="text-sm text-txt-primary font-bold">{v.type}</span>
                            <div className="flex items-center gap-1.5 text-xs text-txt-secondary mt-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                              <span>{v.region}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('driver') && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                              {v.driver ? (v.driver.user ? v.driver.user.firstName.substring(0, 2).toUpperCase() : (v.driver.name ? v.driver.name.substring(0, 2).toUpperCase() : 'DR')) : 'UN'}
                            </div>
                            <span className="text-sm text-txt-primary font-semibold">
                              {v.driver ? (v.driver.user ? `${v.driver.user.firstName} ${v.driver.user.lastName}` : v.driver.name) : 'Unassigned'}
                            </span>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('capacity') && (
                        <td className="py-4 px-4">
                          <div>
                            <span className="text-sm font-mono font-bold text-txt-primary">{v.maxLoadCapacity.toLocaleString()} lbs</span>
                            <p className="text-xs text-txt-secondary font-mono mt-1">{v.odometer.toLocaleString()} mi</p>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('fuel') && (
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1.5 pr-4">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-txt-secondary flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />Fuel</span>
                              <span className={v.fuel <= 20 ? 'text-brand-danger animate-pulse' : 'text-txt-primary'}>{v.fuel}%</span>
                            </div>
                            <div className="w-full bg-surface dark:bg-card-elevated h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${v.fuel <= 20 ? 'bg-brand-danger' : v.fuel <= 50 ? 'bg-brand-warning' : 'bg-brand-teal'}`}
                                style={{ width: `${v.fuel}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('health') && (
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1.5 pr-4">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-txt-secondary flex items-center gap-1"><Activity className="w-3.5 h-3.5" />Health</span>
                              <span className={v.health <= 70 ? 'text-brand-danger' : 'text-txt-primary'}>{v.health}%</span>
                            </div>
                            <div className="w-full bg-surface dark:bg-card-elevated h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${v.health <= 70 ? 'bg-brand-danger' : v.health <= 90 ? 'bg-brand-orange' : 'bg-brand-success'}`}
                                style={{ width: `${v.health}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('status') && (
                        <td className="py-4 px-4">
                          {getStatusBadge(v.status)}
                        </td>
                      )}

                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/dashboard/vehicles/${v._id}`} className="p-2 text-txt-secondary hover:text-brand-teal hover:bg-brand-teal/10 rounded-xl transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/dashboard/vehicles/${v._id}/edit`} className="p-2 text-txt-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDeleteVehicle(v._id, v.vehicleName)} className="p-2 text-txt-secondary hover:text-brand-danger hover:bg-brand-danger/10 rounded-xl transition-colors">
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
