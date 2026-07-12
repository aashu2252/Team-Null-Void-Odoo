import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Truck, Route, DollarSign, Fuel,
  Wrench, RefreshCw, AlertCircle, CheckCircle2, Clock,
  Activity, BarChart2, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${Number(n || 0).toFixed(2)}`;

const fmtNum = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const TRIP_STATUS_COLORS = {
  Draft: '#94A3B8',
  Dispatched: '#1677FF',
  Completed: '#22C55E',
  Cancelled: '#EF4444',
};

const EXPENSE_TYPE_COLORS = {
  Maintenance: '#8B5CF6',
  Toll: '#06B6D4',
  Repair: '#F97316',
  Insurance: '#22C55E',
  Other: '#FBBF24',
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card-bg border border-border-custom rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-txt-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color, trend, trendUp, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg border border-border-custom rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && !loading && (
          <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${trendUp ? 'text-brand-success bg-brand-success/10' : 'text-brand-danger bg-brand-danger/10'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 bg-surface rounded-lg w-2/3" />
          <div className="h-3 bg-surface rounded w-1/2" />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-extrabold text-txt-primary tracking-tight">{value}</p>
          <p className="text-xs text-txt-muted mt-0.5">{sub}</p>
        </div>
      )}
      <p className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">{title}</p>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-brand-primary" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-txt-primary">{title}</h3>
        {sub && <p className="text-[11px] text-txt-muted">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  // ─── Fetch all data ──────────────────────────────────────────────
  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [tripsRes, vehiclesRes, fuelRes, expensesRes, maintRes] = await Promise.all([
        api.get('/api/trips?limit=500'),
        api.get('/api/vehicles?limit=500'),
        api.get('/api/fuel-logs?limit=500'),
        api.get('/api/expenses?limit=500'),
        api.get('/api/maintenance?limit=500'),
      ]);

      setTrips(tripsRes.data?.data?.trips || []);
      setVehicles(vehiclesRes.data?.data?.vehicles || []);
      setFuelLogs(fuelRes.data?.data?.fuelLogs || []);
      setExpenses(expensesRes.data?.data?.expenses || []);
      setMaintenance(maintRes.data?.data?.maintenanceLogs || []);

      if (silent) toast.success('Analytics refreshed!', { style: { background: '#182230', color: '#F8FAFC' } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load analytics data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Derived KPIs ────────────────────────────────────────────────

  const totalRevenue = useMemo(() => trips.reduce((s, t) => s + (t.revenue || 0), 0), [trips]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const totalFuelCost = useMemo(() => fuelLogs.reduce((s, f) => s + (f.cost || 0), 0), [fuelLogs]);
  const totalFuelLiters = useMemo(() => fuelLogs.reduce((s, f) => s + (f.liters || 0), 0), [fuelLogs]);
  const totalMaintCost = useMemo(() => maintenance.reduce((s, m) => s + (m.cost || 0), 0), [maintenance]);

  const completedTrips = useMemo(() => trips.filter(t => t.status === 'Completed').length, [trips]);
  const activeTrips = useMemo(() => trips.filter(t => t.status === 'Dispatched').length, [trips]);
  const availableVehicles = useMemo(() => vehicles.filter(v => v.status === 'Available').length, [vehicles]);
  const netProfit = totalRevenue - totalExpenses - totalFuelCost - totalMaintCost;

  // ─── Trip status breakdown ────────────────────────────────────────

  const tripStatusData = useMemo(() => {
    const counts = { Draft: 0, Dispatched: 0, Completed: 0, Cancelled: 0 };
    trips.forEach(t => { if (t.status in counts) counts[t.status]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: TRIP_STATUS_COLORS[name] }));
  }, [trips]);

  // ─── Vehicle status breakdown ─────────────────────────────────────

  const vehicleStatusData = useMemo(() => {
    const counts = { Available: 0, 'On Trip': 0, 'In Shop': 0, Retired: 0 };
    vehicles.forEach(v => { if (v.status in counts) counts[v.status]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name, value,
        color: { Available: '#22C55E', 'On Trip': '#1677FF', 'In Shop': '#F97316', Retired: '#94A3B8' }[name]
      }));
  }, [vehicles]);

  // ─── Monthly revenue vs expense trend ────────────────────────────

  const monthlyTrend = useMemo(() => {
    const map = {};
    const getKey = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };
    const label = (key) => {
      if (!key) return '';
      const [y, m] = key.split('-');
      return new Date(+y, +m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    trips.forEach(t => {
      const k = getKey(t.completionDate || t.createdAt);
      if (!k) return;
      if (!map[k]) map[k] = { label: label(k), revenue: 0, expenses: 0, fuel: 0 };
      map[k].revenue += t.revenue || 0;
    });
    expenses.forEach(e => {
      const k = getKey(e.date || e.createdAt);
      if (!k) return;
      if (!map[k]) map[k] = { label: label(k), revenue: 0, expenses: 0, fuel: 0 };
      map[k].expenses += e.amount || 0;
    });
    fuelLogs.forEach(f => {
      const k = getKey(f.date || f.createdAt);
      if (!k) return;
      if (!map[k]) map[k] = { label: label(k), revenue: 0, expenses: 0, fuel: 0 };
      map[k].fuel += f.cost || 0;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, v]) => ({
        month: v.label,
        Revenue: Math.round(v.revenue),
        Expenses: Math.round(v.expenses),
        Fuel: Math.round(v.fuel),
      }));
  }, [trips, expenses, fuelLogs]);

  // ─── Fuel liters per month ────────────────────────────────────────

  const fuelMonthly = useMemo(() => {
    const map = {};
    fuelLogs.forEach(f => {
      const d = new Date(f.date || f.createdAt);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const lbl = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!map[k]) map[k] = { month: lbl, Liters: 0, Cost: 0 };
      map[k].Liters += f.liters || 0;
      map[k].Cost += f.cost || 0;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, v]) => ({ ...v, Liters: Math.round(v.Liters), Cost: Math.round(v.Cost) }));
  }, [fuelLogs]);

  // ─── Expense by type ──────────────────────────────────────────────

  const expenseByType = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      if (!map[e.type]) map[e.type] = { type: e.type, total: 0, count: 0 };
      map[e.type].total += e.amount || 0;
      map[e.type].count++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses]);

  // ─── Recent trips ─────────────────────────────────────────────────

  const recentTrips = useMemo(() =>
    [...trips]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8),
    [trips]
  );

  // ─── Maintenance summary ──────────────────────────────────────────

  const activeMaint = useMemo(() => maintenance.filter(m => m.status === 'Active').length, [maintenance]);
  const completedMaint = useMemo(() => maintenance.filter(m => m.status === 'Completed').length, [maintenance]);
  const totalDistance = useMemo(() => trips.reduce((s, t) => s + (t.actualDistance || t.plannedDistance || 0), 0), [trips]);

  // ─── Error state ──────────────────────────────────────────────────

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-brand-danger" />
        <p className="text-txt-secondary text-sm">{error}</p>
        <button onClick={() => fetchAll()} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-primary" />
            System Analytics
          </h2>
          <p className="text-xs text-txt-muted mt-0.5">
            Live data across all modules — trips, vehicles, fuel, expenses &amp; maintenance
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={loading ? '—' : fmt(totalRevenue)}
          sub={`${completedTrips} completed trips`}
          icon={DollarSign}
          color="bg-gradient-to-br from-brand-primary to-blue-600"
          trend={totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% margin` : undefined}
          trendUp={netProfit >= 0}
          loading={loading}
        />
        <KpiCard
          title="Net Profit"
          value={loading ? '—' : fmt(Math.abs(netProfit))}
          sub={netProfit >= 0 ? 'Positive balance' : 'Operating at a loss'}
          icon={TrendingUp}
          color={`bg-gradient-to-br ${netProfit >= 0 ? 'from-brand-success to-green-600' : 'from-brand-danger to-red-600'}`}
          loading={loading}
        />
        <KpiCard
          title="Fleet Status"
          value={loading ? '—' : `${availableVehicles} / ${vehicles.length}`}
          sub={`${activeTrips} vehicles on active trips`}
          icon={Truck}
          color="bg-gradient-to-br from-brand-teal to-cyan-600"
          trend={vehicles.length > 0 ? `${Math.round((availableVehicles / vehicles.length) * 100)}% available` : undefined}
          trendUp={availableVehicles / (vehicles.length || 1) > 0.5}
          loading={loading}
        />
        <KpiCard
          title="Total Fuel Cost"
          value={loading ? '—' : fmt(totalFuelCost)}
          sub={`${fmtNum(Math.round(totalFuelLiters))} liters consumed`}
          icon={Fuel}
          color="bg-gradient-to-br from-brand-orange to-orange-600"
          loading={loading}
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Trips"
          value={loading ? '—' : fmtNum(trips.length)}
          sub={`${activeTrips} dispatched · ${trips.filter(t => t.status === 'Draft').length} draft`}
          icon={Route}
          color="bg-gradient-to-br from-brand-purple to-purple-700"
          loading={loading}
        />
        <KpiCard
          title="Total Distance"
          value={loading ? '—' : `${fmtNum(Math.round(totalDistance))} km`}
          sub="Actual + planned across all trips"
          icon={Activity}
          color="bg-gradient-to-br from-brand-teal to-teal-700"
          loading={loading}
        />
        <KpiCard
          title="Total Expenses"
          value={loading ? '—' : fmt(totalExpenses)}
          sub={`${expenses.length} expense entries`}
          icon={Zap}
          color="bg-gradient-to-br from-brand-warning to-yellow-600"
          loading={loading}
        />
        <KpiCard
          title="Maintenance Cost"
          value={loading ? '—' : fmt(totalMaintCost)}
          sub={`${activeMaint} active · ${completedMaint} completed`}
          icon={Wrench}
          color="bg-gradient-to-br from-slate-500 to-slate-700"
          loading={loading}
        />
      </div>

      {/* Revenue vs Expenses Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
      >
        <SectionHeader
          icon={TrendingUp}
          title="Revenue vs Operating Costs — Monthly Trend"
          sub="Live financial breakdown: revenue, operational expenses & fuel costs"
        />
        {loading ? (
          <div className="h-64 bg-surface rounded-xl animate-pulse" />
        ) : monthlyTrend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-txt-muted text-sm">No trip/expense data to display</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1677FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-custom)" strokeOpacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Revenue" stroke="#1677FF" strokeWidth={2} fill="url(#gradRevenue)" dot={false} />
              <Area type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#gradExpenses)" dot={false} />
              <Area type="monotone" dataKey="Fuel" stroke="#F97316" strokeWidth={2} fill="url(#gradFuel)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Mid Row: Pie charts + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Trip Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
        >
          <SectionHeader icon={Route} title="Trip Status Breakdown" sub={`${trips.length} total trips`} />
          {loading ? (
            <div className="h-48 bg-surface rounded-xl animate-pulse" />
          ) : tripStatusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-txt-muted text-sm">No trips yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={tripStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {tripStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {tripStatusData.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-txt-secondary truncate">{s.name}</span>
                    <span className="text-[11px] font-bold text-txt-primary ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Vehicle Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
        >
          <SectionHeader icon={Truck} title="Vehicle Status" sub={`${vehicles.length} vehicles registered`} />
          {loading ? (
            <div className="h-48 bg-surface rounded-xl animate-pulse" />
          ) : vehicleStatusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-txt-muted text-sm">No vehicles yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={vehicleStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {vehicleStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {vehicleStatusData.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-txt-secondary truncate">{s.name}</span>
                    <span className="text-[11px] font-bold text-txt-primary ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Expense By Type */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
        >
          <SectionHeader icon={DollarSign} title="Expenses by Category" sub={`${expenses.length} expense records`} />
          {loading ? (
            <div className="h-48 bg-surface rounded-xl animate-pulse" />
          ) : expenseByType.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-txt-muted text-sm">No expenses yet</div>
          ) : (
            <div className="space-y-3 mt-2">
              {expenseByType.map(e => {
                const maxTotal = expenseByType[0]?.total || 1;
                const pct = Math.round((e.total / maxTotal) * 100);
                const clr = EXPENSE_TYPE_COLORS[e.type] || '#94A3B8';
                return (
                  <div key={e.type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-txt-secondary flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: clr }} />
                        {e.type}
                        <span className="text-txt-muted font-normal">({e.count})</span>
                      </span>
                      <span className="text-xs font-bold text-txt-primary">{fmt(e.total)}</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: clr }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Fuel Consumption Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
      >
        <SectionHeader
          icon={Fuel}
          title="Fuel Consumption — Monthly"
          sub={`${fmtNum(Math.round(totalFuelLiters))} total liters · ${fmt(totalFuelCost)} total cost`}
        />
        {loading ? (
          <div className="h-52 bg-surface rounded-xl animate-pulse" />
        ) : fuelMonthly.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-txt-muted text-sm">No fuel log data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fuelMonthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-custom)" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="Liters" fill="#06B6D4" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar yAxisId="right" dataKey="Cost" fill="#F97316" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Recent Trips Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
      >
        <SectionHeader
          icon={Route}
          title="Recent Trips"
          sub="Latest 8 trip records sorted by creation date"
        />
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="py-10 text-center text-txt-muted text-sm">No trips recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-custom">
                  {['Route', 'Vehicle', 'Driver', 'Status', 'Revenue', 'Fuel Used', 'Distance', 'Date'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-txt-muted first:pl-0 last:pr-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, idx) => {
                  const statusColors = {
                    Completed: 'text-brand-success bg-brand-success/10',
                    Dispatched: 'text-brand-primary bg-brand-primary/10',
                    Draft: 'text-txt-muted bg-surface',
                    Cancelled: 'text-brand-danger bg-brand-danger/10',
                  };
                  return (
                    <motion.tr
                      key={trip._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-border-custom/50 hover:bg-surface/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 pl-0 font-semibold text-txt-primary max-w-[140px]">
                        <div className="truncate" title={`${trip.source} → ${trip.destination}`}>
                          {trip.source} <span className="text-txt-muted mx-1">→</span> {trip.destination}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-txt-secondary truncate max-w-[100px]">
                        {trip.vehicle?.registrationNumber || trip.vehicle?.vehicleName || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-txt-secondary truncate max-w-[100px]">
                        {trip.driver?.name || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[trip.status] || 'text-txt-muted bg-surface'}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-brand-success">
                        {trip.revenue > 0 ? fmt(trip.revenue) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-txt-secondary">
                        {trip.fuelConsumed > 0 ? `${trip.fuelConsumed}L` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-txt-secondary">
                        {(trip.actualDistance || trip.plannedDistance) > 0
                          ? `${trip.actualDistance || trip.plannedDistance} km`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 pr-0 text-txt-muted">
                        {fmtDate(trip.dispatchDate || trip.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Maintenance Overview */}
      {!loading && maintenance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card-bg border border-border-custom rounded-2xl p-6 shadow-sm"
        >
          <SectionHeader
            icon={Wrench}
            title="Maintenance Overview"
            sub={`${maintenance.length} records · ${fmt(totalMaintCost)} total cost`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {maintenance.slice(0, 6).map((m, idx) => (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * idx }}
                className="flex items-start gap-3 p-3 bg-surface rounded-xl"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.status === 'Active' ? 'bg-brand-orange/15' : 'bg-brand-success/15'}`}>
                  {m.status === 'Active'
                    ? <Clock className="w-4 h-4 text-brand-orange" />
                    : <CheckCircle2 className="w-4 h-4 text-brand-success" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-txt-primary truncate">{m.title}</p>
                  <p className="text-[11px] text-txt-muted mt-0.5">
                    {m.vehicle?.registrationNumber || m.vehicle?.vehicleName || 'Vehicle'}
                    {m.cost > 0 && <span className="ml-2 font-semibold text-brand-orange">{fmt(m.cost)}</span>}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${m.status === 'Active' ? 'text-brand-orange bg-brand-orange/10' : 'text-brand-success bg-brand-success/10'}`}>
                  {m.status}
                </span>
              </motion.div>
            ))}
          </div>
          {maintenance.length > 6 && (
            <p className="text-[11px] text-txt-muted text-center mt-3">+{maintenance.length - 6} more maintenance records</p>
          )}
        </motion.div>
      )}

      {/* Summary Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Avg Trip Revenue', value: trips.length > 0 ? fmt(totalRevenue / trips.length) : '—' },
          { label: 'Avg Fuel / Trip', value: fuelLogs.length > 0 ? `${(totalFuelLiters / fuelLogs.length).toFixed(1)}L` : '—' },
          { label: 'Cost per km', value: totalDistance > 0 ? `$${((totalExpenses + totalFuelCost) / totalDistance).toFixed(2)}` : '—' },
          { label: 'Revenue per km', value: totalDistance > 0 ? `$${(totalRevenue / totalDistance).toFixed(2)}` : '—' },
        ].map((s, i) => (
          <div key={i} className="bg-card-bg border border-border-custom rounded-xl p-4 text-center shadow-sm">
            <p className="text-lg font-extrabold text-txt-primary">{loading ? '—' : s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-txt-muted mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

    </div>
  );
}
