import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreVertical,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Wrench,
  XCircle,
  Truck,
  Gauge,
  Activity,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([
    { id: 'VH-101', model: 'Volvo FH16 (Heavy)', license: 'NJ-847-XYZ', type: 'Heavy Duty', driver: 'Marcus Vance', capacity: '24 Tons', assignment: 'Trip TRK-204', fuel: 72, health: 94, status: 'On Trip' },
    { id: 'VH-102', model: 'Peterbilt 579 (Semi)', license: 'NY-204-ABC', type: 'Heavy Duty', driver: 'Sarah Jenkins', capacity: '22 Tons', assignment: 'Trip TRK-302', fuel: 48, health: 87, status: 'On Trip' },
    { id: 'VH-103', model: 'Ford F-550 (Flatbed)', license: 'PA-912-LMN', type: 'Flatbed', driver: 'David Miller', capacity: '8 Tons', assignment: 'Unassigned', fuel: 95, health: 99, status: 'Available' },
    { id: 'VH-104', model: 'Hino 268 (Box Truck)', license: 'NJ-502-QWE', type: 'Box Truck', driver: 'Bypass Lead', capacity: '10 Tons', assignment: 'Unassigned', fuel: 10, health: 64, status: 'Maintenance' },
    { id: 'VH-105', model: 'Isuzu NPR (Refrigerated)', license: 'TX-441-TYU', type: 'Refrigerated', driver: 'Carlos Ruiz', capacity: '6 Tons', assignment: 'Trip TRK-109', fuel: 81, health: 92, status: 'On Trip' },
    { id: 'VH-106', model: 'Freightliner M2', license: 'CA-889-OPQ', type: 'Box Truck', driver: 'Amanda Ross', capacity: '12 Tons', assignment: 'Unassigned', fuel: 0, health: 45, status: 'Out of Service' }
  ]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [newVehicle, setNewVehicle] = useState({
    id: '',
    model: '',
    license: '',
    type: 'Heavy Duty',
    driver: 'Unassigned',
    capacity: '',
    assignment: 'Unassigned',
    fuel: 100,
    health: 100,
    status: 'Available'
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch = v.id.toLowerCase().includes(search.toLowerCase()) || 
                          v.model.toLowerCase().includes(search.toLowerCase()) ||
                          v.driver.toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter === 'All' || v.type === typeFilter;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      
      return matchSearch && matchType && matchStatus;
    });
  }, [vehicles, search, typeFilter, statusFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredVehicles.map(v => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.model || !newVehicle.capacity) {
      toast.error('Please enter all required fields.');
      return;
    }

    setVehicles(prev => [
      ...prev,
      {
        ...newVehicle,
        fuel: parseInt(newVehicle.fuel) || 100,
        health: parseInt(newVehicle.health) || 100
      }
    ]);
    
    toast.success(`Vehicle ${newVehicle.id} added successfully!`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });
    
    setNewVehicle({
      id: '',
      model: '',
      license: '',
      type: 'Heavy Duty',
      driver: 'Unassigned',
      capacity: '',
      assignment: 'Unassigned',
      fuel: 100,
      health: 100,
      status: 'Available'
    });
    setShowAddModal(false);
  };

  const handleDeleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    toast.success(`Vehicle ${id} removed from registry.`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Model,License,Type,Driver,Capacity,Assignment,Fuel,Health,Status"].join(",") + "\n"
      + vehicles.map(v => `${v.id},${v.model},${v.license},${v.type},${v.driver},${v.capacity},${v.assignment},${v.fuel}%,${v.health}%,${v.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transitops_vehicles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Vehicles registry exported successfully to CSV!', {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-success/10 text-brand-success rounded-full text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Available</span>
          </span>
        );
      case 'On Trip':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span>On Trip</span>
          </span>
        );
      case 'Maintenance':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-warning/10 text-brand-warning rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Maintenance</span>
          </span>
        );
      case 'Out of Service':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-danger/10 text-brand-danger rounded-full text-[10px] font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" />
            <span>Out of Service</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h2 className="text-xl font-bold text-txt-primary">Vehicle Registry</h2>
        <p className="text-xs text-txt-secondary mt-0.5">Manage and track fleet assets, configurations, and diagnostics.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card-bg border border-border-custom p-4 rounded-[20px] shadow-premium">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Model, or Driver..."
              className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl pl-9 pr-4 py-2 text-xs text-txt-primary placeholder-txt-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-txt-muted" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
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
            className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setVehicles(prev => prev.filter(v => !selectedIds.includes(v.id)));
                setSelectedIds([]);
                toast.success('Selected vehicles removed.');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/20 text-brand-danger rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border-custom text-txt-primary rounded-xl text-xs font-semibold hover:bg-surface/80 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3 min-w-[1000px]">
          <thead>
            <tr className="text-txt-muted text-[10px] uppercase font-extrabold tracking-wider px-4">
              <th className="pb-1 text-center w-12">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredVehicles.length > 0 && selectedIds.length === filteredVehicles.length}
                  className="rounded border-border-custom text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
                />
              </th>
              <th className="pb-1 text-left pl-3">Vehicle Details</th>
              <th className="pb-1 text-left">Classification</th>
              <th className="pb-1 text-left">Assigned Driver</th>
              <th className="pb-1 text-left">Capacity</th>
              <th className="pb-1 text-left">Active Job</th>
              <th className="pb-1 text-left">Fuel level</th>
              <th className="pb-1 text-left">Diagnostics</th>
              <th className="pb-1 text-left">Status</th>
              <th className="pb-1 text-center w-16">Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                return (
                  <motion.tr
                    key={v.id}
                    layoutId={`vehicle-row-${v.id}`}
                    whileHover={{ scale: 1.005, y: -2 }}
                    className={`bg-card-bg border border-border-custom rounded-2xl transition-all duration-150 cursor-pointer shadow-premium hover:shadow-premium-hover ${
                      isSelected ? 'ring-2 ring-brand-primary/30' : ''
                    }`}
                  >
                    <td className="py-4 text-center rounded-l-2xl border-y border-l border-border-custom/50 bg-card-bg">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(v.id)}
                        className="rounded border-border-custom text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
                      />
                    </td>

                    <td className="py-4 pl-3 border-y border-border-custom/50 bg-card-bg">
                      <div>
                        <p className="text-xs font-bold text-txt-primary">{v.id}</p>
                        <p className="text-[10px] text-txt-secondary font-mono mt-0.5">{v.model} • {v.license}</p>
                      </div>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      <span className="text-xs text-txt-primary font-semibold">{v.type}</span>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[10px]">
                          {v.driver.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-txt-primary font-medium">{v.driver}</span>
                      </div>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      <span className="text-xs font-mono font-semibold text-txt-secondary">{v.capacity}</span>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      <span className={`text-xs font-medium ${v.assignment !== 'Unassigned' ? 'text-brand-primary hover:underline' : 'text-txt-muted'}`}>
                        {v.assignment}
                      </span>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      <div className="flex items-center gap-2">
                        <Gauge className={`w-3.5 h-3.5 shrink-0 ${v.fuel <= 20 ? 'text-brand-danger animate-pulse' : 'text-txt-secondary'}`} />
                        <div className="w-16 bg-surface dark:bg-card-elevated h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${v.fuel <= 20 ? 'bg-brand-danger' : v.fuel <= 50 ? 'bg-brand-warning' : 'bg-brand-teal'}`}
                            style={{ width: `${v.fuel}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-txt-primary font-mono">{v.fuel}%</span>
                      </div>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-txt-secondary shrink-0" />
                        <div className="w-16 bg-surface dark:bg-card-elevated h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${v.health <= 70 ? 'bg-brand-danger' : v.health <= 90 ? 'bg-brand-orange' : 'bg-brand-success'}`}
                            style={{ width: `${v.health}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-txt-primary font-mono">{v.health}%</span>
                      </div>
                    </td>

                    <td className="py-4 border-y border-border-custom/50 bg-card-bg">
                      {getStatusBadge(v.status)}
                    </td>

                    <td className="py-4 text-center rounded-r-2xl border-y border-r border-border-custom/50 bg-card-bg">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVehicle(v.id);
                          }}
                          className="p-1.5 text-txt-secondary hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove vehicle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="py-12">
                  <div className="text-center text-xs text-txt-muted py-8">
                    No vehicles match the active query.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg border border-border-custom rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-4 bg-surface/50 border-b border-border-custom flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-txt-primary">Register New Fleet Vehicle</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddVehicleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Vehicle ID (Unique)*
                    </label>
                    <input
                      type="text"
                      required
                      value={newVehicle.id}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                      placeholder="e.g. VH-107"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      License Plate Number*
                    </label>
                    <input
                      type="text"
                      required
                      value={newVehicle.license}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, license: e.target.value.toUpperCase() }))}
                      placeholder="e.g. NJ-992-ABC"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Manufacturer & Model*
                    </label>
                    <input
                      type="text"
                      required
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g. Volvo FH16"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Cargo Weight Capacity*
                    </label>
                    <input
                      type="text"
                      required
                      value={newVehicle.capacity}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="e.g. 24 Tons"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Classification Type
                    </label>
                    <select
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Heavy Duty">Heavy Duty</option>
                      <option value="Box Truck">Box Truck</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Refrigerated">Refrigerated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Assigned Driver
                    </label>
                    <input
                      type="text"
                      value={newVehicle.driver}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, driver: e.target.value }))}
                      placeholder="Driver full name"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Fuel level (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newVehicle.fuel}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, fuel: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Health Score (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newVehicle.health}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, health: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Initial Status
                    </label>
                    <select
                      value={newVehicle.status}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-custom flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition-all cursor-pointer"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
