import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const EXPENSE_TYPES = ['Maintenance', 'Toll', 'Repair', 'Insurance', 'Other'];

const TYPE_COLORS = {
  Toll: '#1677FF',
  Maintenance: '#EF4444',
  Repair: '#06B6D4',
  Insurance: '#8B5CF6',
  Other: '#94A3B8'
};

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function shortId(id) {
  if (!id) return 'N/A';
  return id.slice(-6).toUpperCase();
}

const emptyForm = {
  description: '',
  type: 'Toll',
  amount: '',
  vehicleId: '',
  tripId: '',
  date: ''
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicleRefs, setVehicleRefs] = useState([]);
  const [tripRefs, setTripRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null); // {_id, ...fields}
  const [deleteTarget, setDeleteTarget] = useState(null); // {_id, description}
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  // ─── FETCH ALL DATA ───────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [expRes, vehiclesRes, tripsRes] = await Promise.all([
        api.get('/api/expenses?limit=100'),
        api.get('/api/vehicles?limit=100'),
        api.get('/api/trips?limit=100')
      ]);

      // Expenses: data.data.expenses
      if (expRes.data?.success) {
        const raw = expRes.data.data?.expenses || [];
        setExpenses(raw);
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
          label: `${t.source} → ${t.destination} (${shortId(t._id)})`
        })));
      }
    } catch (err) {
      console.error('Error fetching expenses data:', err);
      toast.error('Failed to load expenses data.', {
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
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const byType = {};
    EXPENSE_TYPES.forEach(t => { byType[t] = 0; });
    expenses.forEach(e => {
      if (byType[e.type] !== undefined) byType[e.type] += e.amount || 0;
    });
    const highest = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    return { total, byType, highest };
  }, [expenses]);

  // ─── DYNAMIC CHART DATA (last 3 months) ──────────────────────
  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('en', { month: 'short' }),
        year: d.getFullYear(),
        monthIdx: d.getMonth()
      });
    }

    return months.map(({ month, year, monthIdx }) => {
      const row = { month };
      EXPENSE_TYPES.forEach(t => { row[t] = 0; });
      expenses.forEach(e => {
        const d = new Date(e.date);
        if (d.getFullYear() === year && d.getMonth() === monthIdx) {
          row[e.type] = (row[e.type] || 0) + (e.amount || 0);
        }
      });
      return row;
    });
  }, [expenses]);

  // ─── FILTERED EXPENSES ────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const vehicleLabel = e.vehicle?.registrationNumber || e.vehicle?.vehicleName || '';
      const tripLabel = e.trip?.source || '';
      const matchSearch =
        (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
        vehicleLabel.toLowerCase().includes(search.toLowerCase()) ||
        tripLabel.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || e.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [expenses, search, typeFilter]);

  // ─── CREATE EXPENSE ───────────────────────────────────────────
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
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        date: form.date
      };
      const res = await api.post('/api/expenses', payload);
      if (res.data?.success) {
        toast.success('Expense recorded successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        setShowAddForm(false);
        setForm(emptyForm);
        fetchAll();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create expense.';
      toast.error(msg, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── OPEN EDIT MODAL ──────────────────────────────────────────
  const openEdit = (exp) => {
    setEditExpense(exp);
    setEditForm({
      description: exp.description || '',
      type: exp.type || 'Toll',
      amount: exp.amount?.toString() || '',
      vehicleId: exp.vehicle?._id || exp.vehicle || '',
      tripId: exp.trip?._id || exp.trip || '',
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : ''
    });
  };

  // ─── UPDATE EXPENSE ───────────────────────────────────────────
  const handleUpdate = async (ev) => {
    ev.preventDefault();
    if (!editExpense) return;
    setSubmitting(true);
    try {
      const payload = {
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        date: editForm.date
      };
      if (editForm.vehicleId) payload.vehicle = editForm.vehicleId;
      if (editForm.tripId) payload.trip = editForm.tripId;

      const res = await api.put(`/api/expenses/${editExpense._id}`, payload);
      if (res.data?.success) {
        toast.success('Expense updated successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        setEditExpense(null);
        fetchAll();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update expense.';
      toast.error(msg, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── DELETE EXPENSE ───────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/api/expenses/${deleteTarget._id}`);
      if (res.data?.success) {
        toast.success('Expense deleted successfully!', {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
        setDeleteTarget(null);
        fetchAll();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete expense.';
      toast.error(msg, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── FORM FIELD COMPONENT ─────────────────────────────────────
  const FormFields = ({ values, onChange, isEdit = false }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Expense Description / Title*
        </label>
        <input
          type="text"
          required
          value={values.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="e.g. EZPass Toll Invoice"
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Expense Type
        </label>
        <select
          value={values.type}
          onChange={e => onChange('type', e.target.value)}
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
        >
          {EXPENSE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Amount (₹)*
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={values.amount}
          onChange={e => onChange('amount', e.target.value)}
          placeholder="e.g. 42.50"
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Expense Date*
        </label>
        <input
          type="date"
          required
          value={values.date}
          onChange={e => onChange('date', e.target.value)}
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
          Select Vehicle{!isEdit && '*'}
        </label>
        <select
          value={values.vehicleId}
          onChange={e => onChange('vehicleId', e.target.value)}
          required={!isEdit}
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
          Select Trip{!isEdit && '*'}
        </label>
        <select
          value={values.tripId}
          onChange={e => onChange('tripId', e.target.value)}
          required={!isEdit}
          className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
        >
          <option value="">-- Select Trip --</option>
          {tripRefs.map(t => (
            <option key={t._id} value={t._id}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-full font-sans">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Expense Management Console</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Audit toll expenditures, service invoices, fuel receipts, and operational expense logs.
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
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
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
                    <CreditCard className="w-5 h-5 text-brand-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">Add Expense Invoice</h3>
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
                      File Expense
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHART */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Operational Cost by Category (Last 3 Months)
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val, name) => [`₹${val.toLocaleString('en-IN')}`, name]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  {EXPENSE_TYPES.map(t => (
                    <Bar key={t} dataKey={t} stackId="a" fill={TYPE_COLORS[t]} radius={t === 'Other' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EXPENSE TABLE */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-custom/50 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">
                Expense Records Ledger
                <span className="ml-2 text-brand-primary font-mono">({filtered.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-3 py-1.5 bg-surface border border-border-custom/80 rounded-xl text-xs text-txt-primary focus:outline-none focus:border-brand-primary w-36"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="pl-7 pr-3 py-1.5 bg-surface border border-border-custom/80 text-txt-primary rounded-xl text-xs focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-txt-muted text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading expenses from database...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-txt-muted">
                <CreditCard className="w-8 h-8 opacity-30" />
                <p className="text-xs">No expenses found. Record your first expense!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50">
                      <th className="pb-3">ID</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Trip</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/50">
                    {filtered.map((exp) => (
                      <tr key={exp._id} className="hover:bg-surface/30 transition-colors group">
                        <td className="py-3 font-mono text-[10px] text-txt-muted">
                          #{shortId(exp._id)}
                        </td>
                        <td className="py-3 font-semibold text-txt-primary max-w-[160px] truncate" title={exp.description}>
                          {exp.description || '—'}
                        </td>
                        <td className="py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: `${TYPE_COLORS[exp.type]}15`,
                              color: TYPE_COLORS[exp.type]
                            }}
                          >
                            {exp.type}
                          </span>
                        </td>
                        <td className="py-3 text-txt-secondary font-mono">{formatDate(exp.date)}</td>
                        <td className="py-3 font-mono text-brand-primary font-semibold text-[10px]">
                          {exp.vehicle?.registrationNumber || shortId(exp.vehicle) || '—'}
                        </td>
                        <td className="py-3 font-mono text-txt-secondary text-[10px]">
                          {exp.trip ? `${exp.trip.source || ''}→${exp.trip.destination || ''} #${shortId(exp.trip._id || exp.trip)}` : '—'}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-txt-primary">
                          ₹{(exp.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(exp)}
                              className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(exp)}
                              className="p-1.5 rounded-lg bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* STATS CARD */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Operational Cost Summary
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-brand-primary" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Total Expenses</span>
                    <span className="text-base font-bold text-txt-primary">
                      ₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-surface border border-border-custom/50 text-txt-secondary font-bold px-2 py-0.5 rounded">
                  {expenses.length} records
                </span>
              </div>

              {/* Per-type breakdown */}
              <div className="space-y-2">
                {EXPENSE_TYPES.map(type => (
                  <div key={type} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: TYPE_COLORS[type] }}
                      />
                      <span className="text-txt-secondary font-medium">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-txt-primary">
                        ₹{(stats.byType[type] || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      {stats.total > 0 && (
                        <span className="text-[9px] text-txt-muted font-mono w-8 text-right">
                          {((stats.byType[type] / stats.total) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {stats.highest && stats.highest[1] > 0 && (
                <div className="p-3 bg-brand-warning/5 border border-brand-warning/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-brand-warning" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-txt-muted block">Highest Category</span>
                      <span className="text-xs font-bold text-txt-primary">
                        {stats.highest[0]} — ₹{stats.highest[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-2">
              {expenses.slice(0, 6).length === 0 ? (
                <p className="text-xs text-txt-muted text-center py-4">No recent transactions.</p>
              ) : (
                expenses.slice(0, 6).map(exp => (
                  <div key={exp._id} className="flex items-center justify-between py-2 border-b border-border-custom/30 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: TYPE_COLORS[exp.type] }}
                      />
                      <div>
                        <p className="text-[11px] font-semibold text-txt-primary truncate max-w-[120px]">
                          {exp.description || exp.type}
                        </p>
                        <p className="text-[9px] text-txt-muted">{formatDate(exp.date)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-txt-primary">
                      ₹{(exp.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setEditExpense(null)}
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">Edit Expense</h3>
                </div>
                <button onClick={() => setEditExpense(null)} className="text-txt-muted hover:text-txt-primary cursor-pointer">
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
                    onClick={() => setEditExpense(null)}
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
              <h3 className="text-sm font-bold text-txt-primary mb-1">Delete Expense?</h3>
              <p className="text-xs text-txt-secondary mb-5">
                <span className="font-semibold text-txt-primary">{deleteTarget.description || 'This expense'}</span>
                {' '}will be permanently removed from the database.
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
