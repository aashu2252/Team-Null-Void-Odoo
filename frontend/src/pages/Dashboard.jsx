import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
  const timelineData = [
    { hour: '06:00', trips: 12 },
    { hour: '08:00', trips: 28 },
    { hour: '10:00', trips: 45 },
    { hour: '12:00', trips: 52 },
    { hour: '14:00', trips: 48 },
    { hour: '16:00', trips: 36 },
    { hour: '18:00', trips: 22 },
    { hour: '20:00', trips: 14 },
  ];

  const fuelUsageData = [
    { day: 'Mon', usage: 1100 },
    { day: 'Tue', usage: 1240 },
    { day: 'Wed', usage: 980 },
    { day: 'Thu', usage: 1050 },
    { day: 'Fri', usage: 1300 },
    { day: 'Sat', usage: 600 },
    { day: 'Sun', usage: 450 },
  ];

  const vehicleHealthData = [
    { name: 'Optimal (Health 90%+)', value: 82, color: '#22C55E' },
    { name: 'Monitor (Health 70%-90%)', value: 12, color: '#F97316' },
    { name: 'Immediate Service', value: 6, color: '#EF4444' },
  ];

  const kpis = [
    {
      title: 'Fleet Available',
      value: '112 / 128',
      trend: '+4.2%',
      trendUp: true,
      sparkline: [{ v: 98 }, { v: 102 }, { v: 105 }, { v: 112 }],
      color: 'from-brand-teal to-cyan-500',
      accent: 'border-t-brand-teal',
      icon: Truck
    },
    {
      title: 'Trips Scheduled Today',
      value: '84',
      trend: '+12%',
      trendUp: true,
      sparkline: [{ v: 60 }, { v: 72 }, { v: 80 }, { v: 84 }],
      color: 'from-brand-primary to-blue-500',
      accent: 'border-t-brand-primary',
      icon: Compass
    },
    {
      title: 'Drivers Active',
      value: '92',
      trend: '+2.5%',
      trendUp: true,
      sparkline: [{ v: 88 }, { v: 90 }, { v: 91 }, { v: 92 }],
      color: 'from-brand-success to-emerald-500',
      accent: 'border-t-brand-success',
      icon: Users
    },
    {
      title: 'Pending Deliveries',
      value: '19',
      trend: '-8%',
      trendUp: false,
      sparkline: [{ v: 30 }, { v: 25 }, { v: 21 }, { v: 19 }],
      color: 'from-brand-orange to-amber-500',
      accent: 'border-t-brand-orange',
      icon: Clock
    },
    {
      title: 'Fuel Usage Today',
      value: '1,240 Gal',
      trend: '-3.1%',
      trendUp: false,
      sparkline: [{ v: 1400 }, { v: 1350 }, { v: 1300 }, { v: 1240 }],
      color: 'from-brand-purple to-indigo-500',
      accent: 'border-t-brand-purple',
      icon: Fuel
    },
    {
      title: 'Maintenance Due',
      value: '10',
      trend: 'Scheduled',
      trendUp: true,
      sparkline: [{ v: 6 }, { v: 8 }, { v: 9 }, { v: 10 }],
      color: 'from-brand-danger to-rose-500',
      accent: 'border-t-brand-danger',
      icon: Wrench
    }
  ];

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
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all active:scale-95 cursor-pointer">
              <Zap className="w-3.5 h-3.5" />
              <span>Optimize Routes</span>
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border-custom text-txt-primary rounded-xl text-xs font-semibold hover:bg-surface/80 transition-all active:scale-95 cursor-pointer">
              <Play className="w-3.5 h-3.5" />
              <span>Dispatch Trip</span>
            </button>
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
                    <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1677FF" stopOpacity={0}/>
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
            <div className="p-3 bg-brand-danger/5 border border-brand-danger/15 rounded-2xl flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-txt-primary">TRK-109 Delayed (Port congestion)</h4>
                <p className="text-[11px] text-txt-secondary mt-1">Location: Interstate 95 North near Newark Exit. ETA delayed by 45 minutes.</p>
                <span className="text-[9px] text-txt-muted block mt-1.5">Updated 5 minutes ago</span>
              </div>
            </div>

            <div className="p-3 bg-brand-warning/5 border border-brand-warning/15 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-txt-primary">VH-305 Diagnostic Fault Alert</h4>
                <p className="text-[11px] text-txt-secondary mt-1">Severe fuel injector exhaust warning on engine startup telemetry.</p>
                <span className="text-[9px] text-txt-muted block mt-1.5">Updated 14 minutes ago</span>
              </div>
            </div>

            <div className="p-3 bg-brand-warning/5 border border-brand-warning/15 rounded-2xl flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-txt-primary">TRK-302 Dispatch loading standby</h4>
                <p className="text-[11px] text-txt-secondary mt-1">Cargo warehouse clearance delay. Awaiting final freight release signature.</p>
                <span className="text-[9px] text-txt-muted block mt-1.5">Updated 30 minutes ago</span>
              </div>
            </div>
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer">
              <span>View full AI audit logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
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
            <div className="relative pl-6">
              <div className="absolute -left-[7px] top-0.5 w-3.5 h-3.5 bg-brand-success rounded-full ring-4 ring-card-bg" />
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-txt-primary">TRK-204 — Newark Hub</h4>
                <span className="text-[10px] font-mono font-bold text-brand-primary">12:45 PM</span>
              </div>
              <p className="text-[11px] text-txt-secondary mt-1">Volvo FH series delivering temperature-sensitive medical supplies.</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[7px] top-0.5 w-3.5 h-3.5 bg-brand-primary rounded-full ring-4 ring-card-bg" />
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-txt-primary">TRK-114 — Philadelphia Terminal</h4>
                <span className="text-[10px] font-mono font-bold text-brand-primary">2:15 PM</span>
              </div>
              <p className="text-[11px] text-txt-secondary mt-1">Freightliner shipping electronic retail goods. On time route status.</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[7px] top-0.5 w-3.5 h-3.5 bg-brand-success rounded-full ring-4 ring-card-bg" />
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-txt-primary">TRK-088 — Baltimore Logistics Port</h4>
                <span className="text-[10px] font-mono font-bold text-brand-primary">4:30 PM</span>
              </div>
              <p className="text-[11px] text-txt-secondary mt-1">Heavy-duty flatbed delivery of raw manufacturing metals.</p>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
