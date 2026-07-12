import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Maintenance() {
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    { id: 'WO-804', vehicle: 'VH-104 (Hino 268)', type: 'Repair', reason: 'Exhaust Leak Repair', priority: 'High', date: 'Jul 12, 2026', cost: '$450.00', status: 'In Progress' },
    { id: 'WO-803', vehicle: 'VH-106 (Freightliner)', type: 'Overhaul', reason: 'Full Engine Tuneup', priority: 'Urgent', date: 'Jul 10, 2026', cost: '$1,850.00', status: 'Pending' },
    { id: 'WO-802', vehicle: 'VH-101 (Volvo FH16)', type: 'Routine', reason: 'Oil & Filter Replacement', priority: 'Medium', date: 'Jul 08, 2026', cost: '$120.00', status: 'Completed' },
    { id: 'WO-801', vehicle: 'VH-102 (Peterbilt 579)', type: 'Inspection', reason: 'Safety CDL Brake Test', priority: 'Low', date: 'Jul 05, 2026', cost: '$75.00', status: 'Completed' }
  ]);

  const [documentChecks, setDocumentChecks] = useState([
    { id: 'doc-1', title: 'Fitness Certificate (FMCRA)', status: 'Approved', expiry: 'Jan 15, 2027', icon: ShieldCheck, color: 'text-brand-success' },
    { id: 'doc-2', title: 'Air Pollution Under Control (APUC)', status: 'Approved', expiry: 'Nov 09, 2026', icon: ShieldCheck, color: 'text-brand-success' },
    { id: 'doc-3', title: 'National Transit Liability Insurance', status: 'Warning', expiry: 'Jul 28, 2026', icon: AlertTriangle, color: 'text-brand-warning' },
    { id: 'doc-4', title: 'State Permit Permits (NJ/NY)', status: 'Approved', expiry: 'Mar 30, 2027', icon: ShieldCheck, color: 'text-brand-success' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkOrder, setNewWorkOrder] = useState({
    vehicle: 'VH-101 (Volvo FH16)',
    type: 'Routine',
    reason: '',
    priority: 'Medium',
    cost: '',
    status: 'Pending'
  });

  const handleCreateWorkOrder = (e) => {
    e.preventDefault();
    if (!newWorkOrder.reason || !newWorkOrder.cost) {
      toast.error('Please enter all required fields.');
      return;
    }

    const createdId = 'WO-80' + (maintenanceLogs.length + 1);
    const order = {
      ...newWorkOrder,
      id: createdId,
      date: 'Jul 12, 2026',
      cost: `$${parseFloat(newWorkOrder.cost).toFixed(2)}`
    };

    setMaintenanceLogs(prev => [order, ...prev]);
    setShowAddModal(false);
    toast.success(`Work Order ${createdId} created!`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setNewWorkOrder({
      vehicle: 'VH-101 (Volvo FH16)',
      type: 'Routine',
      reason: '',
      priority: 'Medium',
      cost: '',
      status: 'Pending'
    });
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Urgent':
        return <span className="text-[10px] font-bold text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded">URGENT</span>;
      case 'High':
        return <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">HIGH</span>;
      case 'Medium':
        return <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">MEDIUM</span>;
      case 'Low':
      default:
        return <span className="text-[10px] font-bold text-txt-secondary bg-surface px-2 py-0.5 rounded">LOW</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 animate-spin" />
            <span>In Progress</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Asset Diagnostics & Maintenance</h2>
          <p className="text-xs text-txt-secondary mt-0.5">FMCRA compliance checkups, service orders registry, air fitness certificates.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Work Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE WORK ORDERS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <div className="flex justify-between items-center border-b border-border-custom/50 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Active Service Register</h3>
              <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-lg font-bold">2 Active Repairs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Service Action</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Scheduled Date</th>
                    <th className="pb-3 text-right">Cost</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50">
                  {maintenanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 font-bold text-txt-primary">{log.id}</td>
                      <td className="py-3.5 font-semibold text-brand-primary">{log.vehicle}</td>
                      <td className="py-3.5">
                        <div>
                          <p className="font-semibold text-txt-primary">{log.reason}</p>
                          <p className="text-[10px] text-txt-secondary font-mono mt-0.5">{log.type}</p>
                        </div>
                      </td>
                      <td className="py-3.5">{getPriorityBadge(log.priority)}</td>
                      <td className="py-3.5 text-txt-secondary">{log.date}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-txt-primary">{log.cost}</td>
                      <td className="py-3.5 text-center flex justify-center mt-2.5">{getStatusBadge(log.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMPLIANCE CHECKLIST */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Corporate Compliance Documents
            </h3>

            <div className="space-y-4">
              {documentChecks.map((doc) => {
                const IconComp = doc.icon;
                return (
                  <div key={doc.id} className="p-3 bg-surface/40 dark:bg-card-elevated border border-border-custom/50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-card-bg border border-border-custom/80 flex items-center justify-center">
                        <IconComp className={`w-4 h-4 ${doc.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-txt-primary">{doc.title}</h4>
                        <span className="text-[9px] text-txt-muted mt-0.5 block">Exp: {doc.expiry}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === 'Approved' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning animate-pulse'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-brand-warning/5 border border-brand-warning/15 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[10px] leading-relaxed text-txt-secondary">
                <strong>Attention:</strong> National Liability Transit insurance renewal is pending division lead validation. Renew in 16 days to avoid logistics penalties.
              </p>
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg border border-border-custom rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-4 bg-surface/50 border-b border-border-custom flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-txt-primary">Create Repair Work Order</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkOrder} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Select Vehicle
                  </label>
                  <select
                    value={newWorkOrder.vehicle}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, vehicle: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="VH-104 (Hino 268)">VH-104 (Hino 268)</option>
                    <option value="VH-101 (Volvo FH16)">VH-101 (Volvo FH16)</option>
                    <option value="VH-102 (Peterbilt 579)">VH-102 (Peterbilt 579)</option>
                    <option value="VH-106 (Freightliner)">VH-106 (Freightliner)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Maintenance Type
                    </label>
                    <select
                      value={newWorkOrder.type}
                      onChange={(e) => setNewWorkOrder(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Routine">Routine Care</option>
                      <option value="Repair">Emergency Repair</option>
                      <option value="Inspection">Safety Test</option>
                      <option value="Overhaul">Engine Overhaul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Urgency Priority
                    </label>
                    <select
                      value={newWorkOrder.priority}
                      onChange={(e) => setNewWorkOrder(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Repair Reason Description*
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorkOrder.reason}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g. Clean carbon filters and inspect valve leaks"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Projected Repair Cost ($)*
                  </label>
                  <input
                    type="number"
                    required
                    value={newWorkOrder.cost}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="e.g. 150"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="pt-3 border-t border-border-custom flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition-all cursor-pointer"
                  >
                    Publish Work Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
