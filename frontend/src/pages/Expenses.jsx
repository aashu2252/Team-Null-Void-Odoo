import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([
    { id: 'EXP-403', description: 'Toll Auto-Billing I-95', type: 'Toll', amount: 42.50, date: '2026-07-12', vehicle: 'VH-101', trip: 'TRK-204', status: 'Cleared' },
    { id: 'EXP-402', description: 'Fuel Refill Pilot Station', type: 'Other', amount: 385.00, date: '2026-07-12', vehicle: 'VH-101', trip: 'TRK-204', status: 'Cleared' },
    { id: 'EXP-401', description: 'Hino Engine Repair WO-804', type: 'Repair', amount: 450.00, date: '2026-07-12', vehicle: 'VH-104', trip: 'TRK-302', status: 'Pending Approval' }
  ]);

  const expenseCategoryData = [
    { month: 'May', Toll: 3200, Maintenance: 8500, Repair: 4200, Insurance: 3000, Other: 1500 },
    { month: 'Jun', Toll: 4100, Maintenance: 12000, Repair: 5400, Insurance: 3000, Other: 1800 },
    { month: 'Jul', Toll: 3900, Maintenance: 9200, Repair: 4900, Insurance: 3000, Other: 1600 }
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleRefs, setVehicleRefs] = useState([]);
  const [tripRefs, setTripRefs] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    type: 'Toll',
    amount: '',
    vehicleId: '',
    tripId: '',
    date: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expRes, vehiclesRes, tripsRes] = await Promise.all([
        api.get('/api/expenses?limit=100'),
        api.get('/api/vehicles?limit=100'),
        api.get('/api/trips?limit=100')
      ]);

      if (expRes.data?.success) {
        const expensesData = Array.isArray(expRes.data.data)
          ? expRes.data.data
          : expRes.data.data?.expenses || [];
        const mapped = expensesData.map(e => ({
          ...e,
          id: e.id || e._id,
          vehicle: e.vehicle?.registrationNumber || e.vehicle || 'N/A',
          trip: e.trip?.id || e.trip || 'N/A',
          type: e.type || e.category || 'Other',
          status: e.status || 'Pending Approval'
        }));
        setExpenses(mapped);
      }

      if (vehiclesRes.data?.success) {
        const vehiclesData = Array.isArray(vehiclesRes.data.data)
          ? vehiclesRes.data.data
          : vehiclesRes.data.data?.vehicles || [];
        setVehicleRefs(vehiclesData.map(v => ({
          _id: v._id,
          label: `${v.registrationNumber} — ${v.vehicleName}`
        })));
      }

      if (tripsRes.data?.success) {
        const tripsData = Array.isArray(tripsRes.data.data)
          ? tripsRes.data.data
          : tripsRes.data.data?.trips || [];
        setTripRefs(tripsData.map(t => ({
          _id: t._id,
          label: `${t.id || t._id.slice(-6)} (${t.source} → ${t.destination})`
        })));
      }
    } catch (err) {
      console.warn('Backend offline — retaining local expense ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) {
      toast.error('Please enter all required expense details.');
      return;
    }

    const payload = {
      vehicle: newExpense.vehicleId || undefined,
      trip: newExpense.tripId || undefined,
      type: newExpense.type,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date
    };

    try {
      if (editingExpense) {
        const res = await api.put(`/api/expenses/${editingExpense._id}`, payload);
        if (res.data?.success) {
          toast.success('Expense updated successfully!', {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          loadData();
        }
      } else {
        const res = await api.post('/api/expenses', payload);
        if (res.data?.success) {
          toast.success('Expense saved to database!', {
            style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
          });
          loadData();
        }
      }
    } catch (err) {
      console.warn('Backend write failed — updating locally.', err);
      if (editingExpense) {
        setExpenses(prev => prev.map(e => e.id === editingExpense.id ? {
          ...e,
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          vehicle: vehicleRefs.find(v => v._id === newExpense.vehicleId)?.label || newExpense.vehicleId || 'N/A',
          trip: tripRefs.find(t => t._id === newExpense.tripId)?.label || newExpense.tripId || 'N/A',
        } : e));
        toast.success(`Expense updated locally (offline mode).`, {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
      } else {
        const createdId = 'EXP-40' + (expenses.length + 1);
        const entry = {
          ...newExpense,
          id: createdId,
          amount: parseFloat(newExpense.amount),
          vehicle: vehicleRefs.find(v => v._id === newExpense.vehicleId)?.label || newExpense.vehicleId || 'N/A',
          trip: tripRefs.find(t => t._id === newExpense.tripId)?.label || newExpense.tripId || 'N/A',
          status: 'Pending Approval'
        };
        setExpenses(prev => [entry, ...prev]);
        toast.success(`Expense ${createdId} added locally (offline mode).`, {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
      }
    }

    setShowAddForm(false);
    setEditingExpense(null);
    setNewExpense({
      description: '',
      type: 'Toll',
      amount: '',
      vehicleId: '',
      tripId: '',
      date: ''
    });
  };

  const handleEditExpense = (exp) => {
    setEditingExpense(exp);
    let formattedDate = '';
    if (exp.date) {
      formattedDate = new Date(exp.date).toISOString().split('T')[0];
    }
    setNewExpense({
      description: exp.description || '',
      type: exp.type || 'Toll',
      amount: exp.amount || '',
      vehicleId: exp.vehicle?._id || exp.vehicleId || (vehicleRefs.find(v => v._id === exp.vehicle || v.label.startsWith(exp.vehicle))?._id) || '',
      tripId: exp.trip?._id || exp.tripId || (tripRefs.find(t => t._id === exp.trip || t.label.startsWith(exp.trip))?._id) || '',
      date: formattedDate
    });
    setShowAddForm(true);
  };

  const handleDeleteExpense = async (exp) => {
    if (window.confirm(`Are you sure you want to delete expense ${exp.id || 'this expense'}?`)) {
      try {
        if (exp._id) {
          const res = await api.delete(`/api/expenses/${exp._id}`);
          if (res.data?.success) {
            toast.success('Expense deleted successfully!', {
              style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
            });
            loadData();
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to delete expense from database. Removing locally.', err);
      }
      setExpenses(prev => prev.filter(e => e.id !== exp.id));
      toast.success(`Expense removed locally.`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Expense Management Console</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Audit toll expenditures, service invoices, fuel receipts, and Mongoose expense logs.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium"
            >
              <div className="flex items-center gap-2 border-b border-border-custom/50 pb-2.5 mb-4">
                <CreditCard className="w-5 h-5 text-brand-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">
                  {editingExpense ? 'Edit Expense Invoice' : 'Add Expense Invoice'}
                </h3>
              </div>

              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Expense Description / Title*
                  </label>
                  <input
                    type="text"
                    required
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. EZPass Toll Invoice"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Expense Type
                  </label>
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Toll">Toll Road</option>
                    <option value="Maintenance">Maintenance Service</option>
                    <option value="Repair">Emergency Repair</option>
                    <option value="Insurance">Asset Insurance</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Amount Paid ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
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
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Select Vehicle
                  </label>
                  <select
                    value={newExpense.vehicleId}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicleRefs.length > 0 ? (
                      vehicleRefs.map(v => (
                        <option key={v._id} value={v._id}>{v.label}</option>
                      ))
                    ) : (
                      <>
                        <option value="">VH-101 (Volvo FH16)</option>
                        <option value="">VH-102 (Peterbilt 579)</option>
                        <option value="">VH-104 (Hino 268)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Select Linked Trip
                  </label>
                  <select
                    value={newExpense.tripId}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, tripId: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">-- Select Trip --</option>
                    {tripRefs.length > 0 ? (
                      tripRefs.map(t => (
                        <option key={t._id} value={t._id}>{t.label}</option>
                      ))
                    ) : (
                      <>
                        <option value="">TRK-204</option>
                        <option value="">TRK-109</option>
                        <option value="">TRK-302</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-border-custom mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingExpense(null);
                      setNewExpense({
                        description: '',
                        type: 'Toll',
                        amount: '',
                        vehicleId: '',
                        tripId: '',
                        date: ''
                      });
                    }}
                    className="px-4.5 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 cursor-pointer"
                  >
                    {editingExpense ? 'Update Expense' : 'File Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Historical Operational Cost by Category
            </h3>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} wrapperClassName="capitalize" />
                  <Bar dataKey="Toll" stackId="a" fill="#1677FF" />
                  <Bar dataKey="Maintenance" stackId="a" fill="#EF4444" />
                  <Bar dataKey="Repair" stackId="a" fill="#06B6D4" />
                  <Bar dataKey="Insurance" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="Other" stackId="a" fill="#94A3B8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Expense Records Ledger
            </h3>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-8 text-center text-txt-secondary">Loading expenses...</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                      <th className="pb-3">Expense ID</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Trip Link</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/50">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-surface/30 transition-colors">
                        <td className="py-3.5 font-bold text-txt-primary">{exp.id}</td>
                        <td className="py-3.5 font-semibold text-txt-primary">{exp.description}</td>
                        <td className="py-3.5 text-txt-secondary">{exp.type}</td>
                        <td className="py-3.5 text-txt-secondary font-mono">
                          {exp.date ? new Date(exp.date).toISOString().split('T')[0] : 'N/A'}
                        </td>
                        <td className="py-3.5 font-mono text-brand-primary font-semibold">{exp.vehicle}</td>
                        <td className="py-3.5 font-mono text-txt-secondary">{exp.trip}</td>
                        <td className="py-3.5 text-right font-mono font-bold text-txt-primary">${exp.amount ? exp.amount.toLocaleString() : '0'}</td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exp.status === 'Cleared' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditExpense(exp)}
                              className="p-1 hover:bg-surface rounded text-brand-primary transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp)}
                              className="p-1 hover:bg-surface rounded text-brand-danger transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Operational Cost Summary
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-brand-primary" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Total Spend (Month)</span>
                    <span className="text-base font-bold text-txt-primary">$34,100.00</span>
                  </div>
                </div>
                <span className="text-[10px] bg-brand-success/10 text-brand-success font-bold px-2 py-0.5 rounded">+4.8%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
