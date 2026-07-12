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
  const [trips, setTrips] = useState([]);

  const [activeTripId, setActiveTripId] = useState('');
  const [dispatchMode, setDispatchMode] = useState(false);

  // Backend refs for dropdowns
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

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

  // Load trips + vehicle/driver refs from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
          api.get('/api/trips'),
          api.get('/api/vehicles'),
          api.get('/api/drivers')
        ]);

        if (tripsRes.data?.success) {
          const rawTrips = Array.isArray(tripsRes.data.data) ? tripsRes.data.data : (tripsRes.data.data?.trips || []);
          if (rawTrips.length > 0) {
            const mapped = rawTrips.map(t => ({
              ...t,
              id: t.id || t._id,
              driver: t.driver?.user ? `${t.driver.user.firstName} ${t.driver.user.lastName}` : (t.driver?.name || t.driver || 'Unassigned'),
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
            setActiveTripId(mapped[0]?.id);
          } else {
            setTrips([]);
            setActiveTripId('');
          }
        }

        if (vehiclesRes.data?.success) {
          const rawVehicles = Array.isArray(vehiclesRes.data.data) ? vehiclesRes.data.data : (vehiclesRes.data.data?.vehicles || []);
          setAvailableVehicles(rawVehicles.map(v => ({
            _id: v._id,
            label: `${v.vehicleName} (${v.registrationNumber})`
          })));
        }

        if (driversRes.data?.success) {
          const rawDrivers = Array.isArray(driversRes.data.data) ? driversRes.data.data : (driversRes.data.data?.drivers || []);
          setAvailableDrivers(rawDrivers.map(d => ({
            _id: d._id,
            label: d.name || (d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown')
          })));
        }
      } catch (err) {
        console.warn('Backend offline — retaining local trip manifests.');
      }
    };
    loadData();
  }, []);

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!newManifest.cargoWeight || !newManifest.source || !newManifest.destination || !newManifest.plannedDistance) {
      toast.error('Please fill out all required dispatch details.');
      return;
    }

    const selectedVehicle = availableVehicles.find(v => v._id === newManifest.vehicleId);
    const selectedDriver = availableDrivers.find(d => d._id === newManifest.driverId);

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
      const res = await api.post('/api/trips', payload);
      if (res.data?.success) {
        const saved = res.data.data;
        const createdTrip = {
          ...saved,
          id: saved.id || saved._id,
          driver: selectedDriver?.label || 'Unassigned',
          vehicle: selectedVehicle?.label || 'Unassigned',
          actualDistance: 0,
          progress: 0,
          eta: 'Scheduled',
          stops: [
            { name: `${newManifest.source} Terminal`, time: 'Dispatched', status: 'Active' },
            { name: `${newManifest.destination} Terminal`, time: 'Pending', status: 'Pending' }
          ],
          logs: [{ text: 'Trip manifest saved to database.', time: 'Just now' }]
        };
        setTrips(prev => [createdTrip, ...prev]);
        setActiveTripId(createdTrip.id);
        toast.success(`Manifest dispatched to database!`, {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
      }
    } catch (err) {
      console.warn('Backend write failed — saving trip locally.', err);
      const createdId = 'TRK-' + (trips.length + 200);
      const createdTrip = {
        ...newManifest,
        id: createdId,
        driver: selectedDriver?.label || newManifest.driverId || 'Unassigned',
        vehicle: selectedVehicle?.label || newManifest.vehicleId || 'Unassigned',
        cargoWeight: parseFloat(newManifest.cargoWeight),
        revenue: parseFloat(newManifest.revenue) || 0,
        plannedDistance: parseFloat(newManifest.plannedDistance),
        startOdometer: parseFloat(newManifest.startOdometer) || 0,
        actualDistance: 0, progress: 0, eta: 'Scheduled',
        stops: [
          { name: `${newManifest.source} Terminal`, time: 'Dispatched', status: 'Active' },
          { name: `${newManifest.destination} Terminal`, time: 'Pending', status: 'Pending' }
        ],
        logs: [{ text: 'Trip manifest created locally (offline).', time: 'Just now' }]
      };
      setTrips(prev => [createdTrip, ...prev]);
      setActiveTripId(createdId);
      toast.success(`Manifest ${createdId} saved locally (offline mode).`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }

    setDispatchMode(false);
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
            ) : !activeTrip ? (
              <div className="bg-card-bg border border-border-custom rounded-[20px] p-8 text-center text-txt-secondary text-xs">
                <Compass className="w-8 h-8 text-brand-primary/40 mx-auto mb-3 animate-spin-slow" />
                No active dispatch manifests. Click "Create Dispatch" to schedule a trip.
              </div>
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
          {!activeTrip ? (
            <div className="bg-card-bg border border-border-custom rounded-[20px] p-6 text-center text-txt-secondary text-xs shadow-premium flex flex-col items-center justify-center min-h-[200px]">
              <Compass className="w-8 h-8 text-brand-primary/30 mb-2" />
              Awaiting active dispatch to view route pipeline & manifest activity log feed.
            </div>
          ) : (
            <>
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
                  Real-time Manifest Activity Feed
                </h4>

                <div className="space-y-4">
                  {(activeTrip.logs || []).map((log, index) => (
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
            </>
          )}

        </div>

      </div>

    </div>
  );
}
