import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Plus,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState([
    { id: 'EXP-403', title: 'Toll Auto-Billing I-95', category: 'Tolls', amount: '$42.50', date: 'Jul 12, 2026', vehicle: 'VH-101', status: 'Cleared' },
    { id: 'EXP-402', title: 'Fuel Refill Pilot Station', category: 'Fuel', amount: '$385.00', date: 'Jul 12, 2026', vehicle: 'VH-101', status: 'Cleared' },
    { id: 'EXP-401', title: 'Hino Engine Repair WO-804', category: 'Maintenance', amount: '$450.00', date: 'Jul 12, 2026', vehicle: 'VH-104', status: 'Pending Approval' }
  ]);

  const expenseCategoryData = [
    { month: 'May', Fuel: 18000, Maintenance: 8500, Tolls: 3200, Other: 1500 },
    { month: 'Jun', Fuel: 21000, Maintenance: 12000, Tolls: 4100, Other: 1800 },
    { month: 'Jul', Fuel: 19400, Maintenance: 9200, Tolls: 3900, Other: 1600 }
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Fuel',
    amount: '',
    vehicle: 'VH-101'
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) {
      toast.error('Please enter all required expense details.');
      return;
    }

    const createdId = 'EXP-40' + (expenses.length + 1);
    const entry = {
      ...newExpense,
      id: createdId,
      date: 'Jul 12, 2026',
      amount: `$${parseFloat(newExpense.amount).toFixed(2)}`,
      status: 'Pending Approval'
    };

    setExpenses(prev => [entry, ...prev]);
    setShowAddForm(false);
    toast.success(`Expense ${createdId} added for approval.`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setNewExpense({
      title: '',
      category: 'Fuel',
      amount: '',
      vehicle: 'VH-101'
    });
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Expense Management Console</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Audit toll expenditures, service invoices, fuel receipts, logistics reimbursements.</p>
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">Add Expense Invoice</h3>
              </div>

              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Invoice Title / Vendor Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={newExpense.title}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. EZPass Toll Invoice"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Expense Category
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Fuel">Fuel Refill</option>
                    <option value="Maintenance">Maintenance Repair</option>
                    <option value="Tolls">Road Tolls</option>
                    <option value="Other">Corporate/Other</option>
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
                    Select Fleet Vehicle
                  </label>
                  <select
                    value={newExpense.vehicle}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vehicle: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="VH-101">VH-101 (Volvo FH16)</option>
                    <option value="VH-102">VH-102 (Peterbilt 579)</option>
                    <option value="VH-104">VH-104 (Hino 268)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-border-custom mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 cursor-pointer"
                  >
                    File Expense
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
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Fuel" stackId="a" fill="#1677FF" />
                  <Bar dataKey="Maintenance" stackId="a" fill="#EF4444" />
                  <Bar dataKey="Tolls" stackId="a" fill="#06B6D4" />
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
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                    <th className="pb-3">Expense ID</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 font-bold text-txt-primary">{exp.id}</td>
                      <td className="py-3.5 font-semibold text-txt-primary">{exp.title}</td>
                      <td className="py-3.5 text-txt-secondary">{exp.category}</td>
                      <td className="py-3.5 text-txt-secondary">{exp.date}</td>
                      <td className="py-3.5 font-mono text-brand-primary font-semibold">{exp.vehicle}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-txt-primary">{exp.amount}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          exp.status === 'Cleared' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning animate-pulse'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
