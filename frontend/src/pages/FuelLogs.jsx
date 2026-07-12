import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel,
  Plus,
  Droplet,
  Gauge,
  Truck,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function shortId(id) {
  if (!id) return 'N/A';
  if (typeof id === 'string') return id.slice(-6).toUpperCase();
  return String(id).slice(-6).toUpperCase();
}

const emptyForm = {
  vehicleId: '',
  tripId: '',
  liters: '',
  cost: '',
  date: ''
};

export default function FuelLogs() {
  const [logs, setLogs] = useState([]);
  const [vehicleRefs, setVehicleRefs] = useState([]);
  const [tripRefs, setTripRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  // ─── FETCH ALL DATA ───────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [logsRes, vehiclesRes, tripsRes] = await Promise.all([
        api.get('/api/fuel-logs?limit=100'),
        api.get('/api/vehicles?limit=100'),
        api.get('/api/trips?limit=100')
      ]);

      // FuelLogs: data.data.fuelLogs
      if (logsRes.data?.success) {
        const raw = logsRes.data.data?.fuelLogs || [];
        setLogs(raw);
      }

      // Vehicles: data.data.vehicles
      if (vehiclesRes.data?.success) {
        const vArr = vehiclesRes.data.data?.vehicles || [];
        setVehicleRefs(vArr.map(v => ({
          _id: v._id,
          label: `${v.registrationNumber} — ${v.vehicleName}`
        })));
      }

      // Trips: data.data.trips
      if (tripsRes.data?.success) {
        const tArr = tripsRes.data.data?.trips || [];
        setTripRefs(tArr.map(t => ({
          _id: t._id,
          label: `${t.source} → ${t.destination} (#${shortId(t._id)})`
        })));
      }
    } catch (err) {
      console.error('Error fetching fuel logs:', err);
      toast.error('Failed to load fuel log data.', {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── COMPUTED STATS ───────────────────────────────────────────
  const stats = useMemo(() => {
    const totalLiters = logs.reduce((s, l) => s + (l.liters || 0), 0);
    const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);
    const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

    // Vehicle with most fuel consumption
    const vehicleFuel = {};
    logs.forEach(l => {
      const key = l.vehicle?.registrationNumber || l.vehicle?._id || l.vehicle || 'Unknown';
      vehicleFuel[key] = (vehicleFuel[key] || 0) + (l.liters || 0);
    });
    const topVehicle = Object.entries(vehicleFuel).sort((a, b) => b[1] - a[1])[0];

    return { totalLiters, totalCost, avgCostPerLiter, topVehicle };
  }, [logs]);

  // ─── DYNAMIC CHART DATA (last 7 entries by date) ──────────────
  const chartData = useMemo(() => {
    const sorted = [...logs]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14);

    // Group by date
    const byDate = {};
    sorted.forEach(l => {
      const dateKey = formatDate(l.date);
      byDate[dateKey] = (byDate[dateKey] || 0) + (l.liters || 0);
    });

    return Object.entries(byDate).map(([date, value]) => ({ date, value }));
  }, [logs]);

  // ─── FILTERED LOGS ────────────────────────────────────────────
  const filtered = useMemo(() => {
    return logs.filter(l => {
      const vehicleLabel = l.vehicle?.registrationNumber || l.vehicle?.vehicleName || '';
      const tripLabel = l.trip?.source || l.trip?.destination || '';
      return (
        vehicleLabel.toLowerCase().includes(search.toLowerCase()) ||
        tripLabel.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [logs, search]);

  // ─── CREATE FUEL LOG ──────────────────────────────────────────
  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!form.vehicleId || !form.tripId) {
      toast.error('Please select a Vehicle and Trip.', {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        vehicle: form.vehicleId,
        trip: form.tripId,
        liters: parseFloat(form.liters),
        cost: parseFloat(form.cost),
        date: form.date
      };
      const res = await api.post('/api/fuel-logs', payload);
      if (res.data?.success) {
        toast.success('Fuel log recorded successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        setShowAddForm(false);
        setForm(emptyForm);
        fetchAll();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create fuel log.';
      toast.error(msg, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── OPEN EDIT MODAL ──────────────────────────────────────────
  const openEdit = (log) => {
    setEditLog(log);
    setEditForm({
      vehicleId: log.vehicle?._id || log.vehicle || '',
      tripId: log.trip?._id || log.trip || '',
      liters: log.liters?.toString() || '',
      cost: log.cost?.toString() || '',
      date: log.date ? new Date(log.date).toISOString().split('T')[0] : ''
    });
  };

  const handleEditFuelLog = (log) => {
    setEditingLog(log);
    let formattedDate = '';
    if (log.date) {
      formattedDate = new Date(log.date).toISOString().split('T')[0];
    }
    setNewFuelEntry({
      vehicleId: log.vehicle?._id || log.vehicleId || (vehicleRefs.find(v => v._id === log.vehicle || v.label.startsWith(log.vehicle))?._id) || '',
      tripId: log.trip?._id || log.tripId || (tripRefs.find(t => t._id === log.trip || t.label.startsWith(log.trip))?._id) || '',
      liters: log.liters || '',
      cost: log.cost || '',
      location: log.location || '',
      date: formattedDate
    });
    setShowAddForm(true);
  };

  const handleDeleteFuelLog = async (log) => {
    if (window.confirm(`Are you sure you want to delete refuel log ${log.id || 'this log'}?`)) {
      try {
        if (log._id) {
          const res = await api.delete(`/api/fuel-logs/${log._id}`);
          if (res.data?.success) {
            toast.success('Fuel log deleted successfully!', {
              style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
            });
            loadData();
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to delete fuel log from database. Removing locally.', err);
      }
      setLogs(prev => prev.filter(l => l.id !== log.id));
      toast.success(`Refuel Log removed locally.`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }
  };

  // ─── UPDATE FUEL LOG ──────────────────────────────────────────
  const handleUpdate = async (ev) => {
    ev.preventDefault();
    if (!editLog) return;
    setSubmitting(true);
    try {
      const payload = {
        liters: parseFloat(editForm.liters),
        cost: parseFloat(editForm.cost),
        date: editForm.date
      };
      if (editForm.vehicleId) payload.vehicle = editForm.vehicleId;
      if (editForm.tripId) payload.trip = editForm.tripId;

      const res = await api.put(`/api/fuel-logs/${editLog._id}`, payload);
      if (res.data?.success) {
        toast.success('Fuel log updated successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        setEditLog(null);
        fetchAll();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update fuel log.';
      toast.error(msg, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── DELETE FUEL LOG ──────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/api/fuel-logs/${deleteTarget._id}`);
      if (res.data?.success) {
        toast.success('Fuel log deleted successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        setDeleteTarget(null);
        fetchAll();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete fuel log.';
      toast.error(msg, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── SHARED FORM FIELDS ───────────────────────────────────────
  const FormFields = ({ values, onChange, isEdit = false }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Select Vehicle*
        </label>
        <select
          value={values.vehicleId}
          onChange={e => onChange('vehicleId', e.target.value)}
          required
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
        >
          <option value="">-- Select Vehicle --</option>
          {vehicleRefs.map(v => (
            <option key={v._id} value={v._id}>{v.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Select Trip Link*
        </label>
        <select
          value={values.tripId}
          onChange={e => onChange('tripId', e.target.value)}
          required
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
        >
          <option value="">-- Select Trip --</option>
          {tripRefs.map(t => (
            <option key={t._id} value={t._id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Liters Dispensed*
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={values.liters}
          onChange={e => onChange('liters', e.target.value)}
          placeholder="e.g. 415"
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Cost Paid (₹)*
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={values.cost}
          onChange={e => onChange('cost', e.target.value)}
          placeholder="e.g. 385.00"
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Refuel Date*
        </label>
        <input
          type="date"
          required
          value={values.date}
          onChange={e => onChange('date', e.target.value)}
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
        />
      </div>
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-full font-sans">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Fuel Intelligence Ledger</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Track liters consumption, refuel costs, and trip-linked fuel transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border-custom text-txt-secondary rounded-xl text-xs font-semibold hover:text-txt-primary transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setForm(emptyForm); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Fuel Refill</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT PANEL ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* ADD FORM */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium"
              >
                <div className="flex items-center justify-between border-b border-border-custom/50 pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-brand-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">Log Fuel Refill</h3>
                  </div>
                  <button onClick={() => setShowAddForm(false)} className="text-txt-muted hover:text-txt-primary cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreate}>
                  <FormFields
                    values={form}
                    onChange={(field, val) => setForm(prev => ({ ...prev, [field]: val }))}
                  />
                  <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border-custom">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Save Fuel Log
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHART */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Fuel Consumption Timeline (Liters)
            </h3>
            <div className="h-60 w-full">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-txt-muted">
                  No fuel data to display yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `${v}L`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val) => [`${val} L`, 'Liters']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#06B6D4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorFuel)"
                      dot={{ r: 3, fill: '#06B6D4' }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* FUEL LOG TABLE */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-custom/50 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">
                Recent Refuel Logs
                <span className="ml-2 text-brand-primary font-mono">({filtered.length})</span>
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search vehicle or trip..."
                  className="pl-7 pr-3 py-1.5 bg-surface border border-border-custom/80 rounded-xl text-xs text-txt-primary focus:outline-none focus:border-brand-primary w-44"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-txt-muted text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading fuel logs from database...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-txt-muted">
                <Fuel className="w-8 h-8 opacity-30" />
                <p className="text-xs">No fuel logs found. Record your first refuel!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50">
                      <th className="pb-3">ID</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Trip</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Liters</th>
                      <th className="pb-3 text-right">Cost</th>
                      <th className="pb-3 text-right">₹/L</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/50">
                    {filtered.map((log) => {
                      const pricePerLiter = log.liters > 0 ? (log.cost / log.liters).toFixed(2) : '—';
                      return (
                        <tr key={log._id} className="hover:bg-surface/30 transition-colors group">
                          <td className="py-3 font-mono text-[10px] text-txt-muted">
                            #{shortId(log._id)}
                          </td>
                          <td className="py-3 font-semibold text-brand-primary text-[11px]">
                            {log.vehicle?.registrationNumber || shortId(log.vehicle) || '—'}
                            {log.vehicle?.vehicleName && (
                              <span className="block text-[9px] text-txt-muted font-normal">
                                {log.vehicle.vehicleName}
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-mono text-txt-secondary text-[10px]">
                            {log.trip
                              ? `${log.trip.source || ''}→${log.trip.destination || ''}`
                              : shortId(log.trip) || '—'}
                            {log.trip?._id && (
                              <span className="block text-[9px] text-txt-muted">#{shortId(log.trip._id)}</span>
                            )}
                          </td>
                          <td className="py-3 text-txt-secondary font-mono text-[10px]">
                            {formatDate(log.date)}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-[11px]">
                            {(log.liters || 0).toLocaleString('en-IN')} L
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-txt-primary text-[11px]">
                            ₹{(log.cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 text-right font-mono text-[10px] text-brand-teal font-semibold">
                            ₹{pricePerLiter}/L
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(log)}
                                className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(log)}
                                className="p-1.5 rounded-lg bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Fuel Efficiency Metrics
            </h3>

            <div className="space-y-3">
              {/* Total Liters */}
              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-brand-teal" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Total Liters Logged</span>
                    <span className="text-base font-bold text-txt-primary">
                      {stats.totalLiters.toLocaleString('en-IN', { maximumFractionDigits: 0 })} L
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-brand-success/10 text-brand-success font-bold px-2 py-0.5 rounded">
                  {logs.length} fills
                </span>
              </div>

              {/* Total Cost */}
              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-brand-orange" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Total Fuel Spend</span>
                    <span className="text-base font-bold text-txt-primary">
                      ₹{stats.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-txt-muted bg-surface border border-border-custom/50 font-bold px-2 py-0.5 rounded font-mono">
                  ₹{stats.avgCostPerLiter.toFixed(2)}/L
                </span>
              </div>

              {/* Top Vehicle */}
              {stats.topVehicle && (
                <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-brand-primary" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-txt-muted block">Highest Consumer</span>
                      <span className="text-xs font-bold text-txt-primary truncate max-w-[100px] block">
                        {stats.topVehicle[0]}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-primary">
                    {stats.topVehicle[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })} L
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RECENT LOGS QUICK VIEW */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Recent Refuels
            </h3>
            <div className="space-y-2">
              {logs.slice(0, 6).length === 0 ? (
                <p className="text-xs text-txt-muted text-center py-4">No recent refuels logged.</p>
              ) : (
                logs.slice(0, 6).map(log => (
                  <div key={log._id} className="flex items-center justify-between py-2 border-b border-border-custom/30 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                        <Fuel className="w-3.5 h-3.5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-txt-primary">
                          {log.vehicle?.registrationNumber || shortId(log.vehicle)}
                        </p>
                        <p className="text-[9px] text-txt-muted">{formatDate(log.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-txt-primary">
                        {(log.liters || 0).toLocaleString('en-IN')} L
                      </p>
                      <p className="text-[9px] text-txt-muted font-mono">
                        ₹{(log.cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setEditLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-2xl w-full max-w-2xl"
            >
              <div className="flex items-center justify-between border-b border-border-custom/50 pb-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">Edit Fuel Log</h3>
                </div>
                <button onClick={() => setEditLog(null)} className="text-txt-muted hover:text-txt-primary cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <FormFields
                  values={editForm}
                  onChange={(field, val) => setEditForm(prev => ({ ...prev, [field]: val }))}
                  isEdit
                />
                <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border-custom">
                  <button
                    type="button"
                    onClick={() => setEditLog(null)}
                    className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary/95 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-border-custom rounded-[20px] p-6 shadow-2xl w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-brand-danger/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-brand-danger" />
              </div>
              <h3 className="text-sm font-bold text-txt-primary mb-1">Delete Fuel Log?</h3>
              <p className="text-xs text-txt-secondary mb-5">
                Fuel log for{' '}
                <span className="font-semibold text-txt-primary">
                  {deleteTarget.vehicle?.registrationNumber || shortId(deleteTarget.vehicle)}
                </span>
                {' '}on <span className="font-semibold text-txt-primary">{formatDate(deleteTarget.date)}</span>{' '}
                will be permanently removed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-brand-danger text-white rounded-xl text-xs font-semibold hover:bg-brand-danger/90 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
