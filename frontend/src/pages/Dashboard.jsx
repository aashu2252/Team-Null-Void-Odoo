import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  Compass,
  AlertTriangle,
  Clock,
  Wrench,
  Fuel,
  CloudSun,
  Zap,
  Play,
  UserCheck,
  CheckSquare,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const getRoleGreeting = (role) => {
    switch (role) {
      case 'Dispatcher':
        return 'Welcome Back, Dispatcher Control Lead';
      case 'Fleet Manager':
        return 'Welcome Back, Fleet Operations Director';
      case 'Safety Officer':
        return 'Welcome Back, Chief Safety & Compliance Officer';
      case 'Financial Analyst':
        return 'Welcome Back, Principal Financial Analyst';
      default:
        return `Welcome Back, ${role || 'Operations Lead'}`;
    }
  };

  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesRes, tripsRes, driversRes, maintRes, fuelRes] = await Promise.all([
        api.get('/api/vehicles?limit=1000'),
        api.get('/api/trips?limit=1000'),
        api.get('/api/drivers?limit=1000'),
        api.get('/api/maintenance?limit=1000'),
        api.get('/api/fuel-logs?limit=1000')
      ]);

      if (vehiclesRes.data?.success) {
        setVehicles(Array.isArray(vehiclesRes.data.data) ? vehiclesRes.data.data : vehiclesRes.data.data?.vehicles || []);
      }
      if (tripsRes.data?.success) {
        setTrips(Array.isArray(tripsRes.data.data) ? tripsRes.data.data : tripsRes.data.data?.trips || []);
      }
      if (driversRes.data?.success) {
        setDrivers(Array.isArray(driversRes.data.data) ? driversRes.data.data : driversRes.data.data?.drivers || []);
      }
      if (maintRes.data?.success) {
        setMaintenance(Array.isArray(maintRes.data.data) ? maintRes.data.data : maintRes.data.data?.maintenance || []);
      }
      if (fuelRes.data?.success) {
        setFuelLogs(Array.isArray(fuelRes.data.data) ? fuelRes.data.data : fuelRes.data.data?.fuelLogs || []);
      }
    } catch (err) {
      console.warn('Failed to hydrate dashboard telemetry from backend APIs.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered dataset calculations
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchType = selectedType === 'All' || v.type?.toLowerCase() === selectedType.toLowerCase();
      const matchStatus = selectedStatus === 'All' || v.status?.toLowerCase() === selectedStatus.toLowerCase();
      const matchRegion = selectedRegion === 'All' || v.region?.toLowerCase() === selectedRegion.toLowerCase();
      return matchType && matchStatus && matchRegion;
    });
  }, [vehicles, selectedType, selectedStatus, selectedRegion]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const vId = t.vehicle?._id || t.vehicle;
      const vehicleObj = vehicles.find(v => v._id === vId);
      if (!vehicleObj) return true; // keep it if no vehicle context (or all)
      const matchType = selectedType === 'All' || vehicleObj.type?.toLowerCase() === selectedType.toLowerCase();
      const matchStatus = selectedStatus === 'All' || vehicleObj.status?.toLowerCase() === selectedStatus.toLowerCase();
      const matchRegion = selectedRegion === 'All' || vehicleObj.region?.toLowerCase() === selectedRegion.toLowerCase();
      return matchType && matchStatus && matchRegion;
    });
  }, [trips, vehicles, selectedType, selectedStatus, selectedRegion]);

  const filteredDrivers = useMemo(() => {
    if (selectedType === 'All' && selectedStatus === 'All' && selectedRegion === 'All') {
      return drivers;
    }
    const matchedVehicleIds = new Set(filteredVehicles.map(v => v._id));
    const matchedDriverIds = new Set(
      filteredTrips
        .filter(t => matchedVehicleIds.has(t.vehicle?._id || t.vehicle))
        .map(t => t.driver?._id || t.driver)
    );
    return drivers.filter(d => matchedDriverIds.has(d._id));
  }, [drivers, filteredVehicles, filteredTrips, selectedType, selectedStatus, selectedRegion]);

  const filteredFuelLogs = useMemo(() => {
    const matchedVehicleIds = new Set(filteredVehicles.map(v => v._id));
    return fuelLogs.filter(f => matchedVehicleIds.has(f.vehicle?._id || f.vehicle));
  }, [fuelLogs, filteredVehicles]);

  const filteredMaintenance = useMemo(() => {
    const matchedVehicleIds = new Set(filteredVehicles.map(v => v._id));
    return maintenance.filter(m => matchedVehicleIds.has(m.vehicle?._id || m.vehicle));
  }, [maintenance, filteredVehicles]);

  const calculatedKPIs = useMemo(() => {
    const totalVehiclesCount = filteredVehicles.length;
    const availableCount = filteredVehicles.filter(v => v.status === 'Available').length;
    const activeTripsCount = filteredTrips.filter(t => t.status === 'Active' || t.status === 'In Transit').length;
    const pendingTripsCount = filteredTrips.filter(t => t.status === 'Pending' || t.status === 'Scheduled').length;
    const driversActiveCount = filteredDrivers.filter(d => d.status === 'On Duty' || d.status === 'Active' || d.status === 'On Trip').length;
    const totalFuelGallons = filteredFuelLogs.reduce((sum, f) => sum + (f.liters || f.gallons || 0), 0);
    const activeMaintenance = filteredMaintenance.filter(m => m.status === 'Active' || m.status === 'Pending').length;

    const baseVal = Math.round(totalVehiclesCount * 0.9);
    const sparkAvailable = [{ v: baseVal - 4 }, { v: baseVal - 2 }, { v: baseVal }, { v: availableCount }];
    const sparkTrips = [{ v: activeTripsCount + pendingTripsCount - 15 }, { v: activeTripsCount + pendingTripsCount - 10 }, { v: activeTripsCount + pendingTripsCount - 5 }, { v: activeTripsCount + pendingTripsCount }];
    const sparkDrivers = [{ v: driversActiveCount - 3 }, { v: driversActiveCount - 2 }, { v: driversActiveCount - 1 }, { v: driversActiveCount }];
    const sparkPending = [{ v: pendingTripsCount + 4 }, { v: pendingTripsCount + 2 }, { v: pendingTripsCount + 1 }, { v: pendingTripsCount }];
    const sparkFuel = [{ v: Math.round(totalFuelGallons * 0.8) }, { v: Math.round(totalFuelGallons * 0.9) }, { v: Math.round(totalFuelGallons * 0.95) }, { v: Math.round(totalFuelGallons) }];
    const sparkMaint = [{ v: activeMaintenance + 3 }, { v: activeMaintenance + 2 }, { v: activeMaintenance + 1 }, { v: activeMaintenance }];

    return [
      {
        title: 'Fleet Available',
        value: `${availableCount} / ${totalVehiclesCount}`,
        trend: totalVehiclesCount > 0 ? `+${Math.round((availableCount / totalVehiclesCount) * 100)}%` : '0%',
        trendUp: true,
        sparkline: sparkAvailable,
        color: 'from-brand-teal to-cyan-500',
        accent: 'border-t-brand-teal',
        icon: Truck
      },
      {
        title: 'Trips Scheduled Today',
        value: (activeTripsCount + pendingTripsCount).toString(),
        trend: '+12%',
        trendUp: true,
        sparkline: sparkTrips,
        color: 'from-brand-primary to-blue-500',
        accent: 'border-t-brand-primary',
        icon: Compass
      },
      {
        title: 'Drivers Active',
        value: driversActiveCount.toString(),
        trend: '+2.5%',
        trendUp: true,
        sparkline: sparkDrivers,
        color: 'from-brand-success to-emerald-500',
        accent: 'border-t-brand-success',
        icon: Users
      },
      {
        title: 'Pending Deliveries',
        value: pendingTripsCount.toString(),
        trend: '-8%',
        trendUp: false,
        sparkline: sparkPending,
        color: 'from-brand-orange to-amber-500',
        accent: 'border-t-brand-orange',
        icon: Clock
      },
      {
        title: 'Fuel Usage Today',
        value: `${Math.round(totalFuelGallons).toLocaleString()} L`,
        trend: '-3.1%',
        trendUp: false,
        sparkline: sparkFuel,
        color: 'from-brand-purple to-indigo-500',
        accent: 'border-t-brand-purple',
        icon: Fuel
      },
      {
        title: 'Maintenance Due',
        value: activeMaintenance.toString(),
        trend: 'Scheduled',
        trendUp: true,
        sparkline: sparkMaint,
        color: 'from-brand-danger to-rose-500',
        accent: 'border-t-brand-danger',
        icon: Wrench
      }
    ];
  }, [filteredVehicles, filteredTrips, filteredDrivers, filteredFuelLogs, filteredMaintenance]);

  const kpis = calculatedKPIs;

  const timelineData = useMemo(() => {
    const totalCount = filteredTrips.length;
    return [
      { hour: '06:00', trips: Math.round(totalCount * 0.15) },
      { hour: '08:00', trips: Math.round(totalCount * 0.35) },
      { hour: '10:00', trips: Math.round(totalCount * 0.55) },
      { hour: '12:00', trips: Math.round(totalCount * 0.65) },
      { hour: '14:00', trips: Math.round(totalCount * 0.60) },
      { hour: '16:00', trips: Math.round(totalCount * 0.45) },
      { hour: '18:00', trips: Math.round(totalCount * 0.28) },
      { hour: '20:00', trips: Math.round(totalCount * 0.18) },
    ];
  }, [filteredTrips]);

  const vehicleHealthData = useMemo(() => {
    const optimal = filteredVehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length;
    const monitor = filteredVehicles.filter(v => v.status === 'Off Duty' || v.status === 'Suspended').length;
    const service = filteredVehicles.filter(v => v.status === 'In Shop' || v.status === 'Maintenance').length;
    return [
      { name: 'Optimal (Active/Available)', value: optimal, color: '#22C55E' },
      { name: 'Monitor (Off Duty/Standby)', value: monitor, color: '#F97316' },
      { name: 'Immediate Service (In Shop)', value: service, color: '#EF4444' },
    ];
  }, [filteredVehicles]);

  const fuelUsageData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const usageByDay = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    filteredFuelLogs.forEach(f => {
      if (f.date) {
        const dayName = days[new Date(f.date).getDay()];
        usageByDay[dayName] += f.liters || f.gallons || 0;
      }
    });
    return Object.keys(usageByDay).map(day => ({
      day,
      usage: Math.round(usageByDay[day])
    }));
  }, [filteredFuelLogs]);

  const dynamicAlerts = useMemo(() => {
    const alertsList = [];
    filteredMaintenance.slice(0, 3).forEach(m => {
      alertsList.push({
        type: 'maintenance',
        title: `${m.vehicle?.registrationNumber || m.vehicleName || 'Asset'} Diagnostic Alert`,
        description: `${m.title}: ${m.description || 'Routine diagnostics flagged.'}`,
        time: 'Active status'
      });
    });
    filteredTrips.filter(t => t.status === 'Delayed').slice(0, 2).forEach(t => {
      alertsList.push({
        type: 'delay',
        title: `Trip ${t.id || t._id.slice(-6)} Delayed`,
        description: `Route from ${t.source} to ${t.destination} is delayed.`,
        time: 'In Transit'
      });
    });
    if (alertsList.length === 0) {
      return [
        { type: 'info', title: 'System Diagnostics Optimal', description: 'All telemetry channels green. No diagnostic issues flagged.', time: 'Now' },
        { type: 'info', title: 'Route Telemetry Optimal', description: 'VHF telemetry signals indicate all route ETAs match planned schedules.', time: 'Now' }
      ];
    }
    return alertsList;
  }, [filteredMaintenance, filteredTrips]);

  const dynamicDeliveries = useMemo(() => {
    const list = filteredTrips.filter(t => t.status === 'Scheduled' || t.status === 'Active').slice(0, 3);
    if (list.length === 0) {
      return [
        { title: 'No scheduled cargo', time: '--:--', description: 'Create and dispatch trips in the Logistics console.' }
      ];
    }
    return list.map(t => ({
      title: `${t.id || t._id.slice(-6)} — ${t.destination}`,
      time: t.startDate ? new Date(t.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending',
      description: `Dispatched from ${t.source}. Status: ${t.status}.`
    }));
  }, [filteredTrips]);

  // ── Role-aware greeting ──────────────────────────────────────────────────
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const name = user?.fullName || user?.name || 'Operator';
    const role = user?.role || 'Operator';

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const roleConfig = {
      'Dispatcher': {
        headline: `${salutation}, ${name} — Dispatch Hub`,
        subtitle: `${dateStr}. Today's dispatch queue and route assignments are ready for review.`,
        badge: '🚦 Active Dispatcher',
        badgeColor: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
      },
      'Fleet Manager': {
        headline: `${salutation}, ${name} — Fleet Command`,
        subtitle: `${dateStr}. Fleet telemetry, vehicle health, and operational KPIs are live.`,
        badge: '🚛 Fleet Manager',
        badgeColor: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20'
      },
      'Safety Officer': {
        headline: `${salutation}, ${name} — Safety Center`,
        subtitle: `${dateStr}. Compliance status, incident flags, and safety scores are up to date.`,
        badge: '🛡️ Safety Officer',
        badgeColor: 'bg-brand-success/10 text-brand-success border-brand-success/20'
      },
      'Financial Analyst': {
        headline: `${salutation}, ${name} — Finance Desk`,
        subtitle: `${dateStr}. Expense ledger, fuel costs, and revenue analytics are ready.`,
        badge: '💰 Financial Analyst',
        badgeColor: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
      },
      'Driver': {
        headline: `${salutation}, ${name} — Driver Portal`,
        subtitle: `${dateStr}. Your active trip manifest and route details are displayed below.`,
        badge: '🚗 Driver',
        badgeColor: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
      }
    };

    return roleConfig[role] || {
      headline: `${salutation}, ${name}`,
      subtitle: `${dateStr}. Here is your operational telemetry snapshot.`,
      badge: `⚙️ ${role}`,
      badgeColor: 'bg-surface text-txt-secondary border-border-custom'
    };
  }, [user]);
  // ────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs text-txt-secondary font-semibold">Syncing Real-time Dashboard...</span>
        </div>
      </div>
    );
  }

  const roleName = user?.role?.name || user?.role || 'Dispatcher';

  if (roleName === 'Driver') {
    const currentDriver = drivers.find(d => (d.user?._id || d.user) === user?._id);
    const driverTrips = currentDriver ? trips.filter(t => (t.driver?._id || t.driver) === currentDriver._id) : [];
    const activeTrip = driverTrips.find(t => t.status === 'Dispatched' || t.status === 'Active');
    const vehicleObj = activeTrip ? vehicles.find(v => v._id === (activeTrip.vehicle?._id || activeTrip.vehicle)) : null;
    const completedTrips = driverTrips.filter(t => t.status === 'Completed' || t.status === 'Cancelled');

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-full font-sans"
      >
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-bg border border-border-custom p-6 rounded-[20px] shadow-premium">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-bold text-txt-primary">{greeting.headline}</h2>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${greeting.badgeColor}`}>
                {greeting.badge}
              </span>
            </div>
            <p className="text-xs text-txt-secondary mt-1">
              {greeting.subtitle}
            </p>
          </div>
        </div>

        {/* DRIVER ACTIVE TELEMETRY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Active Trip Details */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Active Trip Telemetry
            </h3>

            {activeTrip ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-primary">{activeTrip.id || activeTrip._id.slice(-6)}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary uppercase">
                    {activeTrip.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface/50 border border-border-custom/50 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-txt-secondary block">Source</span>
                    <span className="text-xs font-bold text-txt-primary mt-0.5 block">{activeTrip.source}</span>
                  </div>
                  <div className="p-3 bg-surface/50 border border-border-custom/50 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-txt-secondary block">Destination</span>
                    <span className="text-xs font-bold text-txt-primary mt-0.5 block">{activeTrip.destination}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-bold text-txt-muted mb-1">
                    <span>TRIP PROGRESS</span>
                    <span>{activeTrip.progress || 50}%</span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full"
                      style={{ width: `${activeTrip.progress || 50}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold block">Planned Distance</span>
                    <span className="text-txt-primary">{activeTrip.plannedDistance} mi</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold block">Cargo Weight</span>
                    <span className="text-txt-primary">{activeTrip.cargoWeight.toLocaleString()} lbs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-txt-secondary text-xs">
                No active trip assigned. Enjoy your standby status!
              </div>
            )}
          </div>

          {/* Card 2: Assigned Vehicle Details */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Assigned Vehicle Details
            </h3>

            {vehicleObj ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-teal/10 rounded-xl flex items-center justify-center text-brand-teal">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-txt-primary">{vehicleObj.vehicleName}</h4>
                    <span className="text-[10px] text-txt-muted font-mono">{vehicleObj.registrationNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold block">Model</span>
                    <span className="text-txt-primary">{vehicleObj.model}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold block">Current Odometer</span>
                    <span className="text-txt-primary">{vehicleObj.odometer.toLocaleString()} mi</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold block">Vehicle Type</span>
                    <span className="text-txt-primary">{vehicleObj.type}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold block">Telemetry Status</span>
                    <span className="text-brand-success">Connected</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-txt-secondary text-xs">
                No vehicle currently assigned.
              </div>
            )}
          </div>

        </div>

        {/* Card 3: Trip History */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
          <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
            Driver Trip History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                  <th className="pb-3">Trip ID</th>
                  <th className="pb-3">Route</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Distance</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {completedTrips.length > 0 ? (
                  completedTrips.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 font-bold text-txt-primary">{t.id || t._id.slice(-6)}</td>
                      <td className="py-3.5 font-semibold text-txt-primary">
                        {t.source} → {t.destination}
                      </td>
                      <td className="py-3.5 text-txt-secondary font-mono">
                        {t.completionDate ? new Date(t.completionDate).toISOString().split('T')[0] : 'N/A'}
                      </td>
                      <td className="py-3.5 text-right font-mono text-txt-primary">
                        {t.actualDistance || t.plannedDistance} mi
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          t.status === 'Completed' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' : 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-txt-secondary">
                      No past trip history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>
    );
  }

  if (roleName === 'Safety Officer') {
    const safetyKPIs = kpis.filter(k => k.title !== 'Fuel Usage Today' && k.title !== 'Pending Deliveries');
    const expiredDrivers = drivers.filter(d => d.licenseExpiryDate && new Date(d.licenseExpiryDate) < new Date());
    const nearExpiryDrivers = drivers.filter(d => {
      if (!d.licenseExpiryDate) return false;
      const daysLeft = (new Date(d.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft <= 30;
    });

    const topSafeDrivers = [...drivers]
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 5);

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-full font-sans"
      >
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-bg border border-border-custom p-6 rounded-[20px] shadow-premium">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-bold text-txt-primary">{greeting.headline}</h2>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${greeting.badgeColor}`}>
                {greeting.badge}
              </span>
            </div>
            <p className="text-xs text-txt-secondary mt-1">
              {greeting.subtitle}
            </p>
          </div>
        </div>

        {/* Safety KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {safetyKPIs.slice(0, 4).map((kpi, idx) => {
            const IconComp = kpi.icon;
            return (
              <div key={idx} className="bg-card-bg border border-border-custom rounded-2xl p-5 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-txt-secondary tracking-wider">{kpi.title}</span>
                  <h3 className="text-xl font-bold text-txt-primary mt-1.5">{kpi.value}</h3>
                  <span className="text-[10px] text-brand-success font-semibold mt-1 block">Active monitoring</span>
                </div>
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Widget 1: CDL Expiry Tracker */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Driver License Compliance Monitoring
            </h3>
            
            <div className="space-y-3.5">
              {expiredDrivers.length === 0 && nearExpiryDrivers.length === 0 ? (
                <div className="text-center py-8 text-xs text-txt-secondary">
                  All active CDLs fully compliant. No expirations flagged.
                </div>
              ) : (
                <>
                  {expiredDrivers.map((d, idx) => (
                    <div key={`exp-${idx}`} className="p-3 bg-brand-danger/5 border border-brand-danger/15 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-txt-primary">{d.name}</h4>
                        <span className="text-[10px] text-brand-danger font-mono font-bold uppercase">Expired CDL License</span>
                      </div>
                      <span className="text-xs font-bold text-brand-danger">{d.licenseNumber}</span>
                    </div>
                  ))}
                  {nearExpiryDrivers.map((d, idx) => (
                    <div key={`near-${idx}`} className="p-3 bg-brand-warning/5 border border-brand-warning/15 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-txt-primary">{d.name}</h4>
                        <span className="text-[10px] text-brand-warning font-semibold">CDL Expires soon</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-txt-primary">
                        {new Date(d.licenseExpiryDate).toISOString().split('T')[0]}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Widget 2: Driver Safety Rankings */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Driver Safety & compliance scores
            </h3>

            <div className="space-y-4">
              {topSafeDrivers.length > 0 ? (
                topSafeDrivers.map((d, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-txt-primary">{d.name}</span>
                      <span className="text-brand-success font-bold">{d.safetyScore}% Safety Score</span>
                    </div>
                    <div className="w-full bg-surface/50 rounded-full h-1.5">
                      <div 
                        className="bg-brand-success h-1.5 rounded-full"
                        style={{ width: `${d.safetyScore}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-txt-secondary text-xs">
                  No drivers registered in the safe-scoring ledger.
                </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    );
  }

  if (roleName === 'Financial Analyst') {
    const financialKPIs = kpis.filter(k => k.title !== 'Drivers Active' && k.title !== 'Maintenance Due');

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-full font-sans"
      >
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-bg border border-border-custom p-6 rounded-[20px] shadow-premium">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-bold text-txt-primary">{greeting.headline}</h2>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${greeting.badgeColor}`}>
                {greeting.badge}
              </span>
            </div>
            <p className="text-xs text-txt-secondary mt-1">
              {greeting.subtitle}
            </p>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialKPIs.slice(0, 4).map((kpi, idx) => {
            const IconComp = kpi.icon;
            return (
              <div key={idx} className="bg-card-bg border border-border-custom rounded-2xl p-5 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-txt-secondary tracking-wider">{kpi.title}</span>
                  <h3 className="text-xl font-bold text-txt-primary mt-1.5">{kpi.value}</h3>
                  <span className="text-[10px] text-brand-success font-semibold mt-1 block">Financial tracking</span>
                </div>
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Expense timeline / overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <div className="flex justify-between items-center border-b border-border-custom/50 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Operations Expense</h4>
                <p className="text-sm font-bold text-txt-primary mt-0.5">Fuel Consumption Summary</p>
              </div>
            </div>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelUsageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="usage" fill="#06B6D4" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-border-custom/50 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Dispatch timeline</h4>
                <p className="text-sm font-bold text-txt-primary mt-0.5">Active Dispatch Load</p>
              </div>
            </div>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorTripsFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px', color: 'var(--txt-primary)' }}
                  />
                  <Area type="monotone" dataKey="trips" stroke="#1677FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTripsFin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-full"
    >
      {/* HERO SECTION / HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-bg border border-border-custom p-6 rounded-[20px] shadow-premium">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-xl font-bold text-txt-primary">{greeting.headline}</h2>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${greeting.badgeColor} hidden sm:inline-flex items-center`}>
              {greeting.badge}
            </span>
          </div>
          <p className="text-xs text-txt-secondary mt-1">
            {greeting.subtitle}
          </p>
        </div>

        {/* Weather & Quick Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Weather Widget */}
          <div className="flex items-center gap-2 bg-surface/50 border border-border-custom rounded-xl px-3.5 py-1.5 text-xs font-semibold">
            <CloudSun className="w-4 h-4 text-brand-warning animate-pulse" />
            <div>
              <p className="text-txt-primary leading-none">Newark, NJ</p>
              <p className="text-[10px] text-txt-secondary font-mono mt-0.5">72°F — Mostly Sunny</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-2 h-10 w-40 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-all">
              <Zap className="w-4 h-4" />
              <span>Optimize Routes</span>
            </button>

            <button className="flex items-center justify-center gap-2 h-10 w-40 rounded-lg border border-border-custom bg-surface text-txt-primary font-medium hover:bg-surface/80 transition-all">
              <Play className="w-4 h-4" />
              <span>Dispatch Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card-bg border border-border-custom p-4 rounded-[20px] shadow-premium">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-bold text-txt-primary uppercase tracking-wider">Fleet Telemetry Filter</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Heavy Duty">Heavy Duty</option>
              <option value="Medium Duty">Medium Duty</option>
              <option value="Light Duty">Light Duty</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Regions</option>
              <option value="East Coast">East Coast</option>
              <option value="West Coast">West Coast</option>
              <option value="Midwest">Midwest</option>
              <option value="South">South</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, shadow: 'var(--shadow-premium-hover)' }}
              className={`bg-card-bg border-t-4 ${kpi.accent} border-x border-b border-border-custom rounded-[20px] p-4.5 shadow-premium flex flex-col justify-between transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-txt-secondary tracking-wider">{kpi.title}</span>
                <div className={`p-1.5 bg-gradient-to-tr ${kpi.color} rounded-lg text-white group-hover:scale-105 transition-transform`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-txt-primary tracking-tight leading-none">
                  {kpi.value}
                </h3>

                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-0.5">
                    {kpi.trendUp ? (
                      <TrendingUp className="w-3.5 h-3.5 text-brand-success" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-brand-danger" />
                    )}
                    <span className={`text-[10px] font-bold ${kpi.trendUp ? 'text-brand-success' : 'text-brand-danger'}`}>
                      {kpi.trend}
                    </span>
                  </div>

                  {/* Sparkline mini-visual */}
                  <div className="flex items-end gap-0.5 h-4.5">
                    {kpi.sparkline.map((pt, sIdx) => {
                      const max = Math.max(...kpi.sparkline.map(p => p.v));
                      const pct = (pt.v / max) * 100;
                      return (
                        <div
                          key={sIdx}
                          className="w-1 bg-brand-primary/40 rounded-t"
                          style={{ height: `${Math.max(20, pct)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* OPERATIONS COMMAND CENTER INTERACTIVE WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Widget 1: Today's Trip Timeline (Area Chart) */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-border-custom/50 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Active Dispatch Load</h4>
              <p className="text-sm font-bold text-txt-primary mt-0.5">Today's Trip Timeline</p>
            </div>
            <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-lg font-bold">LIVE LOAD</span>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px', color: 'var(--txt-primary)' }}
                  labelStyle={{ fontWeight: 'bold', color: 'var(--txt-secondary)' }}
                />
                <Area type="monotone" dataKey="trips" stroke="#1677FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 2: Vehicle Health Score (Pie/Donut Chart) */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-border-custom/50 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Asset Diagnostics</h4>
              <p className="text-sm font-bold text-txt-primary mt-0.5">Vehicle Health Score</p>
            </div>
            <span className="text-[10px] bg-brand-success/10 text-brand-success px-2.5 py-1 rounded-lg font-bold">98.4% UPTIME</span>
          </div>

          <div className="flex items-center justify-center h-48 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center">
              <p className="text-3xl font-extrabold text-txt-primary tracking-tight">128</p>
              <p className="text-[10px] text-txt-secondary font-semibold uppercase tracking-wider">Total Fleet</p>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 text-xs">
            {vehicleHealthData.map((d, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-txt-secondary">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className="font-bold text-txt-primary">{d.value} Vehicles</span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Fuel consumption trends (Rounded Bar Chart) */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-border-custom/50 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Operations Expense</h4>
              <p className="text-sm font-bold text-txt-primary mt-0.5">Fuel Consumption Summary</p>
            </div>
            <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-lg font-bold">AVG 7.4 MPG</span>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="usage" fill="#06B6D4" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* LOWER GRID: ALERTS, AI INSIGHTS, TIMELINE ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Operations Alerts Feed */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
          <div className="flex justify-between items-center border-b border-border-custom/50 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-danger animate-bounce" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Active Dispatch Alerts</h3>
            </div>
            <span className="text-[10px] bg-brand-danger/10 text-brand-danger px-2.5 py-0.5 rounded-full font-bold">3 High Risk</span>
          </div>

          <div className="space-y-3.5">
            {isLoading ? (
              <div className="text-center py-6 text-xs text-txt-secondary">Syncing active alerts...</div>
            ) : (
              dynamicAlerts.map((alert, idx) => (
                <div key={idx} className={`p-3 ${alert.type === 'delay' || alert.type === 'maintenance' ? 'bg-brand-danger/5 border border-brand-danger/15' : 'bg-brand-primary/5 border border-brand-primary/15'} rounded-2xl flex items-start gap-3`}>
                  {alert.type === 'delay' ? (
                    <Clock className="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
                  ) : alert.type === 'maintenance' ? (
                    <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-txt-primary">{alert.title}</h4>
                    <p className="text-[11px] text-txt-secondary mt-1">{alert.description}</p>
                    <span className="text-[9px] text-txt-muted block mt-1.5">{alert.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights & Assistant Options */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border-custom/50 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">AI Intelligent Insights</h3>
              </div>
              <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-bold">TransitOps Engine</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-7 w-7 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 text-brand-primary font-bold text-xs">1</div>
                <div>
                  <h4 className="text-xs font-bold text-txt-primary">Reroute active NY Cargo deliveries</h4>
                  <p className="text-[11px] text-txt-secondary mt-1">
                    Route optimization advises shifting Staten Island highway runs to Outerbridge Crossing to avoid 20-minute traffic bottlenecks.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-7 w-7 bg-brand-teal/10 rounded-lg flex items-center justify-center shrink-0 text-brand-teal font-bold text-xs">2</div>
                <div>
                  <h4 className="text-xs font-bold text-txt-primary">Preventive Repair Recommendation</h4>
                  <p className="text-[11px] text-txt-secondary mt-1">
                    Vehicle VH-305\'s exhaust leak risk is projected to increase by 80% if not serviced prior to its long-haul trip to Washington D.C. on Wednesday.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-7 w-7 bg-brand-success/10 rounded-lg flex items-center justify-center shrink-0 text-brand-success font-bold text-xs">3</div>
                <div>
                  <h4 className="text-xs font-bold text-txt-primary">Standby Driver Optimization</h4>
                  <p className="text-[11px] text-txt-secondary mt-1">
                    8 standby drivers are located near NYC terminals. Recommend dispatching 2 backup trips to absorb Newark port delays.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border-custom flex justify-end">
            <button className="flex items-center justify-center gap-2 h-10 px-5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-xs font-semibold transition-all cursor-pointer">
              <span>View full AI audit logs</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upcoming Deliveries timeline widget */}
        <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
          <div className="flex justify-between items-center border-b border-border-custom/50 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-success" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Upcoming Cargo Deliveries</h3>
            </div>
            <span className="text-[10px] bg-brand-success/10 text-brand-success px-2.5 py-0.5 rounded-full font-bold">On Schedule</span>
          </div>

          <div className="relative border-l-2 border-border-custom ml-3.5 space-y-5.5 py-1">
            {isLoading ? (
              <div className="text-center py-6 text-xs text-txt-secondary">Syncing cargo routes...</div>
            ) : (
              dynamicDeliveries.map((del, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[7px] top-0.5 w-3.5 h-3.5 bg-brand-success rounded-full ring-4 ring-card-bg" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-txt-primary">{del.title}</h4>
                    <span className="text-[10px] font-mono font-bold text-brand-primary">{del.time}</span>
                  </div>
                  <p className="text-[11px] text-txt-secondary mt-1">{del.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </motion.div>
  );
}
