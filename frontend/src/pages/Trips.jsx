import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  MapPin,
  Truck,
  Users,
  Box,
  DollarSign,
  Clock,
  Navigation,
  ArrowRight,
  Plus,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Trips() {
  const [trips, setTrips] = useState([
    {
      id: 'TRK-204',
      cargoWeight: 24000,
      revenue: 2800,
      driver: 'Marcus Vance',
      vehicle: 'VH-101 (Volvo FH16)',
      fuelConsumed: 32,
      status: 'Dispatched',
      source: 'New York City (NY)',
      destination: 'Washington D.C. (WDC)',
      plannedDistance: 240,
      actualDistance: 180,
      startOdometer: 42000,
      endOdometer: 42240,
      eta: '2:45 PM (On Time)',
      progress: 75,
      stops: [
        { name: 'NYC Hub (Departure)', time: '08:00 AM', status: 'Completed' },
        { name: 'Philadelphia I-95 Stop', time: '11:15 AM', status: 'Completed' },
        { name: 'Baltimore Terminal', time: '01:30 PM', status: 'Active' },
        { name: 'Washington Terminal (Arrival)', time: '02:45 PM', status: 'Pending' }
      ],
      logs: [
        { text: 'Departed NYC Hub terminal on schedule.', time: '08:00 AM' },
        { text: 'Cargo checklist validation cleared.', time: '09:15 AM' },
        { text: 'Arrived at Philadelphia checking stop.', time: '11:15 AM' },
        { text: 'Bypassed toll gate, auto-billed via TransitRFID.', time: '12:10 PM' }
      ]
    },
    {
      id: 'TRK-109',
      cargoWeight: 6000,
      revenue: 1200,
      driver: 'Carlos Ruiz',
      vehicle: 'VH-105 (Isuzu NPR)',
      fuelConsumed: 26,
      status: 'Cancelled',
      source: 'Boston (MA)',
      destination: 'Newark (NJ)',
      plannedDistance: 220,
      actualDistance: 120,
      startOdometer: 31000,
      endOdometer: 31220,
      eta: 'Route Cancelled (Road Hazard)',
      progress: 55,
      stops: [
        { name: 'Boston Warehouse (Departure)', time: '09:30 AM', status: 'Completed' },
        { name: 'Worcester Stop', time: '11:00 AM', status: 'Completed' },
        { name: 'Providence Crossing', time: '01:45 PM', status: 'Active' },
        { name: 'Newark Terminal (Arrival)', time: '04:15 PM', status: 'Pending' }
      ],
      logs: [
        { text: 'Manifest uploaded and driver dispatched.', time: '09:30 AM' },
        { text: 'Slowdown alert: Congestion near Worcester I-90.', time: '11:10 AM' },
        { text: 'Driver reported severe highway safety issues; route cancelled.', time: '01:00 PM' }
      ]
    },
    {
      id: 'TRK-302',
      cargoWeight: 18000,
      revenue: 3500,
      driver: 'Sarah Jenkins',
      vehicle: 'VH-102 (Peterbilt 579)',
      fuelConsumed: 0,
      status: 'Draft',
      source: 'Richmond (VA)',
      destination: 'Philadelphia (PA)',
      plannedDistance: 260,
      actualDistance: 0,
      startOdometer: 58000,
      endOdometer: 58260,
      eta: 'Awaiting Departure',
      progress: 5,
      stops: [
        { name: 'Richmond Depot (Departure)', time: 'Pending', status: 'Active' },
        { name: 'Washington Ring Road Stop', time: 'Pending', status: 'Pending' },
        { name: 'Philadelphia Terminal (Arrival)', time: 'Pending', status: 'Pending' }
      ],
      logs: [
        { text: 'Cargo loading manifest finalized.', time: 'Yesterday' },
        { text: 'Vehicle assigned and safety logs cleared.', time: '08:00 AM' }
      ]
    }
  ]);

  const [activeTripId, setActiveTripId] = useState('TRK-204');
  const [dispatchMode, setDispatchMode] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [newManifest, setNewManifest] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    revenue: '',
    fuelConsumed: 0,
    source: '',
    destination: '',
    plannedDistance: '',
    startOdometer: '',
    status: 'Draft'
  });

  const loadData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get('/api/trips?limit=1000'),
        api.get('/api/vehicles?limit=1000'),
        api.get('/api/drivers?limit=1000')
      ]);

      if (tripsRes.data?.success) {
        const tripsData = Array.isArray(tripsRes.data.data) ? tripsRes.data.data : tripsRes.data.data?.trips || [];
        const mapped = tripsData.map(t => ({
          ...t,
          id: t.id || t._id,
          driver: t.driver?.name || t.driver || 'Unassigned',
          vehicle: t.vehicle?.vehicleName || t.vehicle?.registrationNumber || t.vehicle || 'Unassigned',
          stops: t.stops || [
            { name: `${t.source} Terminal`, time: 'Dispatched', status: 'Active' },
            { name: `${t.destination} Terminal`, time: 'Pending', status: 'Pending' }
          ],
          logs: t.logs || [{ text: 'Trip record loaded from database.', time: 'System' }],
          progress: t.progress || (t.status === 'Completed' ? 100 : t.status === 'Dispatched' ? 50 : 0),
          eta: t.eta || 'Scheduled'
        }));
        setTrips(mapped);
        if (mapped.length > 0 && !mapped.find(x => x.id === activeTripId)) {
          setActiveTripId(mapped[0].id);
        }
      }

      if (vehiclesRes.data?.success) {
        const vehiclesData = Array.isArray(vehiclesRes.data.data) ? vehiclesRes.data.data : vehiclesRes.data.data?.vehicles || [];
        setVehicles(vehiclesData);
      }

      if (driversRes.data?.success) {
        const driversData = Array.isArray(driversRes.data.data) ? driversRes.data.data : driversRes.data.data?.drivers || [];
        setDrivers(driversData);
      }
    } catch (err) {
      console.warn('Backend offline — retaining local trip manifests.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredVehiclesForDropdown = useMemo(() => {
    const activeVehicleIds = new Set(
      trips
        .filter(t => (t.status === 'Dispatched' || t.status === 'Active') && (!editingTrip || t._id !== editingTrip._id))
        .map(t => t.vehicle?._id || t.vehicle)
    );

    return vehicles.filter(v => {
      if (editingTrip && (v._id === (editingTrip.vehicle?._id || editingTrip.vehicle))) {
        return true;
      }
      return v.status === 'Available' && !activeVehicleIds.has(v._id);
    }).map(v => ({
      _id: v._id,
      label: `${v.vehicleName} (${v.registrationNumber})`,
      maxLoadCapacity: v.maxLoadCapacity
    }));
  }, [vehicles, trips, editingTrip]);

  const availableVehicles = filteredVehiclesForDropdown;

  const filteredDriversForDropdown = useMemo(() => {
    const activeDriverIds = new Set(
      trips
        .filter(t => (t.status === 'Dispatched' || t.status === 'Active') && (!editingTrip || t._id !== editingTrip._id))
        .map(t => t.driver?._id || t.driver)
    );

    return drivers.filter(d => {
      if (editingTrip && (d._id === (editingTrip.driver?._id || editingTrip.driver))) {
        return true;
      }
      const isExpired = d.licenseExpiryDate && new Date(d.licenseExpiryDate) < new Date();
      return d.status === 'Available' && d.status !== 'Suspended' && !isExpired && !activeDriverIds.has(d._id);
    }).map(d => ({
      _id: d._id,
      label: d.name
    }));
  }, [drivers, trips, editingTrip]);

  const availableDrivers = filteredDriversForDropdown;

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!newManifest.cargoWeight || !newManifest.source || !newManifest.destination || !newManifest.plannedDistance || !newManifest.vehicleId || !newManifest.driverId) {
      toast.error('Please fill out all required dispatch details including vehicle and driver.');
      return;
    }

    const selectedVehicle = vehicles.find(v => v._id === newManifest.vehicleId);
    if (selectedVehicle && parseFloat(newManifest.cargoWeight) > selectedVehicle.maxLoadCapacity) {
      toast.error(`Cargo weight (${newManifest.cargoWeight} lbs) exceeds vehicle maximum capacity (${selectedVehicle.maxLoadCapacity} lbs).`);
      return;
    }

    const payload = {
      source: newManifest.source,
      destination: newManifest.destination,
      vehicle: newManifest.vehicleId || undefined,
      driver: newManifest.driverId || undefined,
      cargoWeight: parseFloat(newManifest.cargoWeight),
      plannedDistance: parseFloat(newManifest.plannedDistance),
      startOdometer: parseFloat(newManifest.startOdometer) || 0,
      revenue: parseFloat(newManifest.revenue) || 0,
      status: newManifest.status || 'Draft'
    };

    try {
      if (editingTrip) {
        const res = await api.put(`/api/trips/${editingTrip._id}`, payload);
        if (res.data?.success) {
          toast.success('Trip updated successfully!', {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          setEditingTrip(null);
          setDispatchMode(false);
          loadData();
        }
      } else {
        const res = await api.post('/api/trips', payload);
        if (res.data?.success) {
          if (payload.status === 'Dispatched') {
            await Promise.all([
              api.put(`/api/vehicles/${payload.vehicle}`, { status: 'On Trip' }),
              api.put(`/api/drivers/${payload.driver}`, { status: 'On Trip' })
            ]);
          }
          toast.success('Trip created successfully!', {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          setDispatchMode(false);
          loadData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }

    setNewManifest({
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      revenue: '',
      fuelConsumed: 0,
      source: '',
      destination: '',
      plannedDistance: '',
      startOdometer: '',
      status: 'Draft'
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeTrip?._id) return;
    
    let extraFields = {};
    if (newStatus === 'Completed') {
      const endOdoStr = window.prompt("Enter End Odometer (mi):", activeTrip.startOdometer || "");
      if (endOdoStr === null) return;
      const actualDistStr = window.prompt("Enter Actual Distance (mi):", activeTrip.plannedDistance || "");
      if (actualDistStr === null) return;
      
      const endOdo = parseFloat(endOdoStr);
      const actualDist = parseFloat(actualDistStr);
      
      if (isNaN(endOdo) || isNaN(actualDist)) {
        toast.error("Odometer and distance must be valid numbers.");
        return;
      }
      
      extraFields = {
        endOdometer: endOdo,
        actualDistance: actualDist,
        completionDate: new Date().toISOString(),
        progress: 100
      };
    } else if (newStatus === 'Dispatched') {
      extraFields = {
        dispatchDate: new Date().toISOString(),
        progress: 50
      };
    }

    try {
      const res = await api.put(`/api/trips/${activeTrip._id}`, {
        status: newStatus,
        ...extraFields
      });

      if (res.data?.success) {
        const vehicleId = activeTrip.vehicle?._id || activeTrip.vehicle;
        const driverId = activeTrip.driver?._id || activeTrip.driver;
        
        if (newStatus === 'Dispatched') {
          if (vehicleId) await api.put(`/api/vehicles/${vehicleId}`, { status: 'On Trip' });
          if (driverId) await api.put(`/api/drivers/${driverId}`, { status: 'On Trip' });
        } else if (newStatus === 'Completed') {
          if (vehicleId) await api.put(`/api/vehicles/${vehicleId}`, { status: 'Available', odometer: extraFields.endOdometer });
          if (driverId) await api.put(`/api/drivers/${driverId}`, { status: 'Available' });
        } else if (newStatus === 'Cancelled') {
          if (vehicleId) await api.put(`/api/vehicles/${vehicleId}`, { status: 'Available' });
          if (driverId) await api.put(`/api/drivers/${driverId}`, { status: 'Available' });
        }

        toast.success(`Trip status updated to ${newStatus}!`, {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleEditTripClick = (trip) => {
    setEditingTrip(trip);
    setNewManifest({
      vehicleId: trip.vehicle?._id || trip.vehicle || '',
      driverId: trip.driver?._id || trip.driver || '',
      cargoWeight: trip.cargoWeight || '',
      revenue: trip.revenue || '',
      fuelConsumed: trip.fuelConsumed || 0,
      source: trip.source || '',
      destination: trip.destination || '',
      plannedDistance: trip.plannedDistance || '',
      startOdometer: trip.startOdometer || '',
      status: trip.status || 'Draft'
    });
    setDispatchMode(true);
  };

  const handleDeleteTripClick = async (trip) => {
    if (!window.confirm(`Are you sure you want to delete trip ${trip.id}?`)) {
      return;
    }

    try {
      const res = await api.delete(`/api/trips/${trip._id}`);
      if (res.data?.success) {
        if (trip.status === 'Dispatched') {
          const vehicleId = trip.vehicle?._id || trip.vehicle;
          const driverId = trip.driver?._id || trip.driver;
          if (vehicleId) await api.put(`/api/vehicles/${vehicleId}`, { status: 'Available' });
          if (driverId) await api.put(`/api/drivers/${driverId}`, { status: 'Available' });
        }
        toast.success('Trip deleted successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Dispatched':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/15';
      case 'Cancelled':
        return 'bg-brand-danger/10 text-brand-danger border-brand-danger/15';
      case 'Draft':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/15';
      case 'Completed':
      default:
        return 'bg-brand-success/10 text-brand-success border-brand-success/15';
    }
  };

  return (
    <div className="space-y-6 max-w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Trip Coordinator</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Route mapping, cargo weights, odometer records, and compliance tracking.</p>
        </div>

        <button
          onClick={() => setDispatchMode(!dispatchMode)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
            dispatchMode 
              ? 'bg-surface border border-border-custom text-txt-primary hover:bg-surface/80' 
              : 'bg-brand-primary hover:bg-brand-primary/95 text-white shadow-brand-primary/10'
          }`}
        >
          {dispatchMode ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{dispatchMode ? 'View Manifests' : 'Create Dispatch'}</span>
        </button>
      </div>

      {!dispatchMode && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {trips.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTripId(t.id)}
              className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTripId === t.id
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
                  : 'bg-card-bg text-txt-secondary border-border-custom hover:bg-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{t.id}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: t.status === 'Dispatched' ? '#1677FF' : t.status === 'Cancelled' ? '#EF4444' : '#F97316'
                }} />
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {dispatchMode ? (
              <motion.div
                key="dispatch-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium"
              >
                <div className="flex items-center gap-2 border-b border-border-custom/50 pb-3 mb-4">
                  <Compass className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-txt-primary">Create Dispatch Manifest</h3>
                </div>
                <form onSubmit={handleDispatchSubmit} className="space-y-4">

                  {/* Row 1: Source + Destination */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Source Station*
                      </label>
                      <input
                        type="text"
                        required
                        value={newManifest.source}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, source: e.target.value }))}
                        placeholder="e.g. NYC Port Hub"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Destination Station*
                      </label>
                      <input
                        type="text"
                        required
                        value={newManifest.destination}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, destination: e.target.value }))}
                        placeholder="e.g. Atlanta Depot"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  {/* Row 2: Cargo Weight + Planned Distance + Revenue */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Cargo Weight (lbs)*
                      </label>
                      <input
                        type="number"
                        required
                        value={newManifest.cargoWeight}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, cargoWeight: e.target.value }))}
                        placeholder="e.g. 24000"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Planned Distance (mi)*
                      </label>
                      <input
                        type="number"
                        required
                        value={newManifest.plannedDistance}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, plannedDistance: e.target.value }))}
                        placeholder="e.g. 240"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Projected Revenue ($)
                      </label>
                      <input
                        type="number"
                        value={newManifest.revenue}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, revenue: e.target.value }))}
                        placeholder="e.g. 2800"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Start Odometer (optional) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Start Odometer (mi)
                    </label>
                    <input
                      type="number"
                      value={newManifest.startOdometer}
                      onChange={(e) => setNewManifest(prev => ({ ...prev, startOdometer: e.target.value }))}
                      placeholder="e.g. 42000"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  {/* Row 4: Driver + Vehicle dropdowns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Assigned Driver
                      </label>
                      <select
                        value={newManifest.driverId}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, driverId: e.target.value }))}
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="">-- Select Driver --</option>
                        {availableDrivers.length > 0 ? (
                          availableDrivers.map(d => (
                            <option key={d._id} value={d._id}>{d.label}</option>
                          ))
                        ) : (
                          <>
                            <option value="">David Miller (Standby)</option>
                            <option value="">Amanda Ross (Off Duty)</option>
                            <option value="">Marcus Vance (Active)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Assigned Vehicle
                      </label>
                      <select
                        value={newManifest.vehicleId}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, vehicleId: e.target.value }))}
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="">-- Select Vehicle --</option>
                        {availableVehicles.length > 0 ? (
                          availableVehicles.map(v => (
                            <option key={v._id} value={v._id}>{v.label}</option>
                          ))
                        ) : (
                          <>
                            <option value="">VH-103 (Ford F-550)</option>
                            <option value="">VH-104 (Hino 268)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Submit Row */}
                  <div className="pt-3 border-t border-border-custom flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDispatchMode(false)}
                      className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition-all cursor-pointer"
                    >
                      Dispatch Manifest
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="trip-details"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
                  <div className="flex justify-between items-start border-b border-border-custom/50 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">Active Manifest</span>
                      <h3 className="text-base font-bold text-txt-primary mt-0.5">{activeTrip.id}</h3>
                    </div>
                    <span className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColorClass(activeTrip.status)}`}>
                      {activeTrip.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex gap-3 items-center">
                      <Box className="w-5 h-5 text-brand-primary shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-txt-secondary">Cargo Weight</span>
                        <p className="text-xs font-bold text-txt-primary mt-0.5">{activeTrip.cargoWeight.toLocaleString()} lbs</p>
                        <span className="text-[10px] text-txt-muted">Uptime Checked</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex gap-3 items-center">
                      <DollarSign className="w-5 h-5 text-brand-success shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-txt-secondary">Projected Revenue</span>
                        <p className="text-xs font-bold text-txt-primary mt-0.5">${activeTrip.revenue.toLocaleString()}</p>
                        <span className="text-[10px] text-txt-muted">Tolls & Fuel Allowance Deducted</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex gap-3 items-center">
                      <Users className="w-5 h-5 text-brand-teal shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-txt-secondary">Operator assigned</span>
                        <p className="text-xs font-bold text-txt-primary mt-0.5">{activeTrip.driver}</p>
                        <span className="text-[10px] text-txt-muted">Safety Clearance OK</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex gap-3 items-center">
                      <Truck className="w-5 h-5 text-brand-purple shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-txt-secondary">Fleet Vehicle</span>
                        <p className="text-xs font-bold text-txt-primary mt-0.5">{activeTrip.vehicle}</p>
                        <span className="text-[10px] text-txt-muted">Telematics Connected</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
                    Route Waypoints & Checklist
                  </h4>

                  <div className="relative border-l-2 border-border-custom ml-3 space-y-6 py-1">
                    {activeTrip.stops.map((stop, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className={`absolute -left-[7px] top-0.5 w-3 h-3 rounded-full ring-4 ring-card-bg ${
                          stop.status === 'Completed' ? 'bg-brand-success' : stop.status === 'Active' ? 'bg-brand-primary' : 'bg-txt-muted'
                        }`} />
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className={`text-xs font-bold ${
                              stop.status === 'Completed' ? 'text-txt-secondary line-through' : 'text-txt-primary'
                            }`}>
                              {stop.name}
                            </h5>
                            <span className="text-[9px] text-txt-muted mt-0.5 font-mono">ETA/Time: {stop.time}</span>
                          </div>
                          
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            stop.status === 'Completed' ? 'bg-brand-success/10 text-brand-success' : stop.status === 'Active' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-surface text-txt-muted'
                          }`}>
                            {stop.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-3.5">
              Route Manifest Status
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                  <span className="text-xs font-bold text-txt-primary truncate max-w-[120px]">{activeTrip.source}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-txt-muted shrink-0" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-teal shrink-0" />
                  <span className="text-xs font-bold text-txt-primary truncate max-w-[120px]">{activeTrip.destination}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-bold text-txt-muted mb-1">
                  <span>DISPATCH COMPLETED PROGRESS</span>
                  <span>{activeTrip.progress}%</span>
                </div>
                <div className="w-full bg-surface dark:bg-card-elevated h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${activeTrip.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[9px] text-txt-muted uppercase font-bold block">Planned Distance</span>
                  <span className="text-txt-primary">{activeTrip.plannedDistance} mi</span>
                </div>
                <div>
                  <span className="text-[9px] text-txt-muted uppercase font-bold block">Telemetry ETA</span>
                  <span className="text-brand-primary">{activeTrip.eta}</span>
                </div>
              </div>

              <div className="p-3 bg-surface/50 dark:bg-card-elevated rounded-xl border border-border-custom/50 relative overflow-hidden flex flex-col justify-between h-24">
                <span className="text-[8px] font-bold text-txt-muted uppercase block">Route Pipeline Preview</span>
                
                <div className="relative h-10 flex items-center justify-between px-6">
                  <div className="absolute left-6 right-6 h-0.5 border-t border-dashed border-txt-muted/30" />
                  <div 
                    className="absolute left-6 h-0.5 bg-brand-primary" 
                    style={{ width: `calc(${activeTrip.progress}% - 3rem)` }}
                  />
                  
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-brand-primary/10 relative z-10" />
                  
                  <div 
                    className="absolute z-20 top-[11px] -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `calc(1.5rem + ${activeTrip.progress}% * 0.7)` }}
                  >
                    <Truck className="w-4 h-4 text-brand-primary animate-pulse" />
                  </div>

                  <div className="w-2.5 h-2.5 rounded-full bg-brand-teal ring-4 ring-brand-teal/10 relative z-10" />
                </div>

                <div className="flex justify-between text-[8px] text-txt-muted font-bold font-mono px-2">
                  <span>DEP: {activeTrip.source.split(' ')[0]}</span>
                  <span>ARR: {activeTrip.destination.split(' ')[0]}</span>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Manifest Actions
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {activeTrip && activeTrip.status === 'Draft' && (
                <button
                  onClick={() => handleUpdateStatus('Dispatched')}
                  className="flex-1 min-w-[100px] px-3.5 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary/95 transition-all cursor-pointer text-center"
                >
                  Dispatch Trip
                </button>
              )}
              {activeTrip && activeTrip.status === 'Dispatched' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('Completed')}
                    className="flex-1 min-w-[100px] px-3.5 py-2 bg-brand-success text-white rounded-xl text-xs font-semibold hover:bg-brand-success/95 transition-all cursor-pointer text-center font-bold"
                  >
                    Complete Trip
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Cancelled')}
                    className="flex-1 min-w-[100px] px-3.5 py-2 bg-brand-danger text-white rounded-xl text-xs font-semibold hover:bg-brand-danger/95 transition-all cursor-pointer text-center font-bold"
                  >
                    Cancel Trip
                  </button>
                </>
              )}
              {activeTrip && (
                <>
                  <button
                    onClick={() => handleEditTripClick(activeTrip)}
                    className="px-3.5 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-bold hover:bg-surface/80 transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTripClick(activeTrip)}
                    className="px-3.5 py-2 bg-surface text-brand-danger border border-border-custom rounded-xl text-xs font-bold hover:bg-brand-danger/10 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Real-time Manifest Activity Feed
            </h4>

            <div className="space-y-4">
              {activeTrip.logs.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    <FileText className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs text-txt-primary leading-tight font-medium">{log.text}</p>
                    <span className="text-[9px] text-txt-muted block mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
