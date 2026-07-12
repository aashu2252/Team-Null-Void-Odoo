import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Trips() {
  const [trips, setTrips] = useState([
    {
      id: 'TRK-204',
      cargo: 'Pharmaceuticals (Temp-Controlled)',
      value: '$280,000',
      driver: 'Marcus Vance',
      vehicle: 'VH-101 (Volvo FH16)',
      expenses: '$840.00',
      status: 'In Transit',
      origin: 'New York City (NY)',
      destination: 'Washington D.C. (WDC)',
      distance: '240 Miles',
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
        { text: 'Temperature sensor telemetry verified at 38°F.', time: '09:15 AM' },
        { text: 'Arrived at Philadelphia checking stop.', time: '11:15 AM' },
        { text: 'Bypassed toll gate, auto-billed via TransitRFID.', time: '12:10 PM' }
      ]
    },
    {
      id: 'TRK-109',
      cargo: 'Fresh Groceries',
      value: '$45,000',
      driver: 'Carlos Ruiz',
      vehicle: 'VH-105 (Isuzu NPR)',
      expenses: '$320.00',
      status: 'Delayed',
      origin: 'Boston (MA)',
      destination: 'Newark (NJ)',
      distance: '220 Miles',
      eta: '4:15 PM (45m Delay)',
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
        { text: 'Driver reported severe highway construction delays.', time: '01:00 PM' }
      ]
    },
    {
      id: 'TRK-302',
      cargo: 'Consumer Electronics',
      value: '$650,000',
      driver: 'Sarah Jenkins',
      vehicle: 'VH-102 (Peterbilt 579)',
      expenses: '$1,200.00',
      status: 'Loading',
      origin: 'Richmond (VA)',
      destination: 'Philadelphia (PA)',
      distance: '260 Miles',
      eta: 'Tomorrow 9:00 AM',
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
  
  const [newManifest, setNewManifest] = useState({
    id: '',
    cargo: '',
    value: '',
    driver: 'David Miller',
    vehicle: 'VH-103 (Ford F-550)',
    expenses: '$150.00',
    origin: '',
    destination: '',
    distance: '',
    eta: ''
  });

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!newManifest.id || !newManifest.cargo || !newManifest.origin || !newManifest.destination) {
      toast.error('Please fill out all required dispatch details.');
      return;
    }

    const createdTrip = {
      ...newManifest,
      status: 'Loading',
      progress: 0,
      stops: [
        { name: `${newManifest.origin} Terminal`, time: 'Dispatched', status: 'Active' },
        { name: `${newManifest.destination} Terminal`, time: 'Pending', status: 'Pending' }
      ],
      logs: [
        { text: `Trip dispatched by lead operations desk.`, time: 'Just now' }
      ]
    };

    setTrips(prev => [createdTrip, ...prev]);
    setActiveTripId(newManifest.id);
    setDispatchMode(false);
    toast.success(`Manifest ${newManifest.id} dispatched!`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setNewManifest({
      id: '',
      cargo: '',
      value: '',
      driver: 'David Miller',
      vehicle: 'VH-103 (Ford F-550)',
      expenses: '$150.00',
      origin: '',
      destination: '',
      distance: '',
      eta: ''
    });
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'In Transit':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/15';
      case 'Delayed':
        return 'bg-brand-danger/10 text-brand-danger border-brand-danger/15';
      case 'Loading':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/15';
      default:
        return 'bg-brand-success/10 text-brand-success border-brand-success/15';
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary font-sans">Trip Dispatcher</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Route coordination, cargo checklists, driver tracking manifests.</p>
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
                  backgroundColor: t.status === 'In Transit' ? '#1677FF' : t.status === 'Delayed' ? '#EF4444' : '#F97316'
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Trip Manifest ID*
                      </label>
                      <input
                        type="text"
                        required
                        value={newManifest.id}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                        placeholder="e.g. TRK-410"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Cargo Type & Value*
                      </label>
                      <input
                        type="text"
                        required
                        value={newManifest.cargo}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, cargo: e.target.value, value: '$100,000' }))}
                        placeholder="e.g. Automotive Spare Parts"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Origin Station*
                      </label>
                      <input
                        type="text"
                        required
                        value={newManifest.origin}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, origin: e.target.value }))}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Route distance
                      </label>
                      <input
                        type="text"
                        value={newManifest.distance}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, distance: e.target.value }))}
                        placeholder="e.g. 840 Miles"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Target ETA Description
                      </label>
                      <input
                        type="text"
                        value={newManifest.eta}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, eta: e.target.value }))}
                        placeholder="e.g. Tomorrow 4:00 PM"
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Assigned Operator
                      </label>
                      <select
                        value={newManifest.driver}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, driver: e.target.value }))}
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="David Miller">David Miller (Standby)</option>
                        <option value="Amanda Ross">Amanda Ross (Off Duty)</option>
                        <option value="Marcus Vance">Marcus Vance (Active)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Assigned Vehicle
                      </label>
                      <select
                        value={newManifest.vehicle}
                        onChange={(e) => setNewManifest(prev => ({ ...prev, vehicle: e.target.value }))}
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="VH-103 (Ford F-550)">VH-103 (Ford F-550)</option>
                        <option value="VH-104 (Hino 268)">VH-104 (Hino 268)</option>
                      </select>
                    </div>
                  </div>

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
                        <span className="text-[9px] uppercase font-bold text-txt-secondary">Cargo & Value</span>
                        <p className="text-xs font-bold text-txt-primary mt-0.5">{activeTrip.cargo}</p>
                        <span className="text-[10px] text-txt-muted">{activeTrip.value}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex gap-3 items-center">
                      <DollarSign className="w-5 h-5 text-brand-success shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-txt-secondary">Estimated Costs</span>
                        <p className="text-xs font-bold text-txt-primary mt-0.5">{activeTrip.expenses}</p>
                        <span className="text-[10px] text-txt-muted">Tolls & Fuel Allowance</span>
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
                  <span className="text-xs font-bold text-txt-primary">{activeTrip.origin}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-txt-muted shrink-0" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-teal shrink-0" />
                  <span className="text-xs font-bold text-txt-primary">{activeTrip.destination}</span>
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
                  <span className="text-[9px] text-txt-muted uppercase font-bold block">Route Distance</span>
                  <span className="text-txt-primary">{activeTrip.distance}</span>
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
                  <span>DEP: {activeTrip.origin.split(' ')[0]}</span>
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
