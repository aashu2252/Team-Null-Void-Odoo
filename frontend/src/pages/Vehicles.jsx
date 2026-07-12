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
          const data = res.data.data.vehicles || res.data.data;
          setVehicles(data);
        }
      } catch (err) {
        toast.error('Failed to load vehicles from database');
      } finally {
        setIsLoading(false);
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
      const matchSearch = v.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(search.toLowerCase());

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
    <div className="space-y-6 max-w-full font-sans pb-8">
      <div>
        <h2 className="text-2xl font-bold text-txt-primary tracking-tight">Vehicle Registry</h2>
        <p className="text-sm text-txt-secondary mt-0.5">Manage and track fleet assets, configurations, and Mongoose diagnostic logs.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-card-bg border border-border-custom p-5 rounded-[24px] shadow-premium">

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Model, Region..."
              className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-txt-muted" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all cursor-pointer"
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
            className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/20 text-brand-danger rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          )}

          <div className="relative" ref={columnToggleRef}>
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-custom text-txt-primary rounded-xl text-sm font-bold hover:bg-surface/80 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>

            <AnimatePresence>
              {showColumnToggle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-card-bg border border-border-custom rounded-2xl shadow-premium z-50 p-2"
                >
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 mb-2">
                    Toggle Columns
                  </div>
                  <div className="space-y-1">
                    {availableColumns.map(col => (
                      <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-surface rounded-xl cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.id)}
                          onChange={() => toggleColumn(col.id)}
                          className="rounded border-border-custom text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-txt-primary">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-custom text-txt-primary rounded-xl text-sm font-bold hover:bg-surface/80 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <Link
            to="/dashboard/vehicles/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20 transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Add Vehicle</span>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px]">
        <table className="w-full border-separate border-spacing-y-3 min-w-[800px]">
          <thead>
            <tr className="text-txt-secondary text-xs uppercase font-extrabold tracking-wider px-4">
              <th className="pb-2 text-center w-12">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredVehicles.length > 0 && selectedIds.length === filteredVehicles.length}
                  className="rounded border-border-custom text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                />
              </th>
              {visibleColumns.includes('details') && <th className="pb-2 text-left pl-4">Vehicle Details</th>}
              {visibleColumns.includes('classification') && <th className="pb-2 text-left">Classification</th>}
              {visibleColumns.includes('driver') && <th className="pb-2 text-left">Assigned Driver</th>}
              {visibleColumns.includes('capacity') && <th className="pb-2 text-left">Capacity & Mileage</th>}
              {visibleColumns.includes('fuel') && <th className="pb-2 text-left w-32">Fuel Status</th>}
              {visibleColumns.includes('health') && <th className="pb-2 text-left w-32">Health</th>}
              {visibleColumns.includes('status') && <th className="pb-2 text-left">Status</th>}
              <th className="pb-2 text-center w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-16 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                  </div>
                </td>
              </tr>
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => {
                const isSelected = selectedIds.includes(v._id);
                return (
                  <motion.tr
                    key={v._id}
                    layoutId={`vehicle-row-${v._id}`}
                    whileHover={{ scale: 1.005, y: -2 }}
                    className={`bg-card-bg border border-border-custom rounded-2xl transition-all duration-150 shadow-sm hover:shadow-premium ${isSelected ? 'ring-2 ring-brand-primary/30' : ''
                      }`}
                  >
                    <td className="py-5 text-center rounded-l-2xl border-y border-l border-border-custom/50">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(v._id)}
                        className="rounded border-border-custom text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {visibleColumns.includes('details') && (
                      <td className="py-5 pl-4 border-y border-border-custom/50">
                        <div>
                          <p className="text-sm font-bold text-txt-primary">{v.vehicleName}</p>
                          <p className="text-xs text-txt-secondary font-mono mt-1">{v.model} - {v.registrationNumber}</p>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('classification') && (
                      <td className="py-5 border-y border-border-custom/50">
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
                      <td className="py-5 border-y border-border-custom/50">
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
                      <td className="py-5 border-y border-border-custom/50">
                        <div>
                          <span className="text-sm font-mono font-bold text-txt-primary">{v.maxLoadCapacity.toLocaleString()} lbs</span>
                          <p className="text-xs text-txt-secondary font-mono mt-1">{v.odometer.toLocaleString()} mi</p>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('fuel') && (
                      <td className="py-5 border-y border-border-custom/50 pr-4">
                        <div className="flex flex-col gap-1.5">
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
                      <td className="py-5 border-y border-border-custom/50 pr-4">
                        <div className="flex flex-col gap-1.5">
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
                      <td className="w-fit py-5 border-y border-border-custom/50">
                        {getStatusBadge(v.status)}
                      </td>
                    )}

                    <td className="py-5 text-center rounded-r-2xl border-y border-r border-border-custom/50 pr-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/dashboard/vehicles/${v._id}`}
                          className="p-2 text-txt-secondary hover:text-brand-teal hover:bg-brand-teal/10 rounded-xl transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <Link
                          to={`/dashboard/vehicles/${v._id}/edit`}
                          className="p-2 text-txt-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit vehicle"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteVehicle(v._id, v.vehicleName)}
                          className="p-2 text-txt-secondary hover:text-brand-danger hover:bg-brand-danger/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete vehicle"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-16">
                  <div className="text-center flex flex-col items-center">
                    <Truck className="w-12 h-12 text-txt-muted mb-4 opacity-50" />
                    <p className="text-base font-bold text-txt-primary">No vehicles found</p>
                    <p className="text-sm text-txt-secondary mt-1">There are no vehicles matching your search criteria in the registry.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
