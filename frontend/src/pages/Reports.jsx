import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  Plus,
  X,
  FileSpreadsheet,
  Settings,
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Reports() {
  const [reports, setReports] = useState([
    { id: 'REP-001', name: 'Q2 Fleet Fuel Performance Audit', type: 'PDF Report', scope: 'Full Fleet', date: 'Jul 12, 2026', size: '2.4 MB', status: 'Completed' },
    { id: 'REP-002', name: 'FMCRA Driver Hours of Service Compliance', type: 'Spreadsheet', scope: 'Personnel', date: 'Jul 10, 2026', size: '4.8 MB', status: 'Completed' },
    { id: 'REP-003', name: 'Maintenance Work Order Diagnostic Log', type: 'PDF Report', scope: 'Assets (Vehicles)', date: 'Jul 08, 2026', size: '1.2 MB', status: 'Completed' }
  ]);

  const [scheduledTemplates, setScheduledTemplates] = useState([
    { id: 'SCH-101', name: 'Weekly Fuel Efficiency Analytics', frequency: 'Every Monday', format: 'Excel', recipient: 'finance-ops@transitops.com' },
    { id: 'SCH-102', name: 'Monthly Driver CDL Safety Compliance Check', frequency: '1st of Month', format: 'PDF', recipient: 'compliance-leads@transitops.com' }
  ]);

  const [isCompiling, setIsCompiling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'Every Monday',
    format: 'PDF',
    recipient: ''
  });

  const compileQuickReport = () => {
    setIsCompiling(true);
    toast.success('Initiating Quick Report Compiler...', {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setTimeout(() => {
      const createdId = 'REP-00' + (reports.length + 1);
      const newRep = {
        id: createdId,
        name: 'Operations Summary (Auto-Compiled)',
        type: 'PDF Report',
        scope: 'All active divisions',
        date: 'Jul 12, 2026',
        size: '1.8 MB',
        status: 'Completed'
      };

      setReports(prev => [newRep, ...prev]);
      setIsCompiling(false);
      toast.success(`Report ${createdId} compiled and ready for download.`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }, 1500);
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    if (!newSchedule.name || !newSchedule.recipient) {
      toast.error('Please enter all required scheduling parameters.');
      return;
    }

    const createdId = 'SCH-10' + (scheduledTemplates.length + 1);
    setScheduledTemplates(prev => [
      ...prev,
      {
        id: createdId,
        ...newSchedule
      }
    ]);

    setShowScheduleModal(false);
    toast.success(`Scheduled Template ${newSchedule.name} created successfully!`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setNewSchedule({
      name: '',
      frequency: 'Every Monday',
      format: 'PDF',
      recipient: ''
    });
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Analytics & Reports Compiler</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Generate compliance sheets, fleet efficiency spreadsheets, operations summaries.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border-custom text-txt-primary rounded-xl text-xs font-semibold hover:bg-surface/80 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule automated runs</span>
          </button>

          <button
            onClick={compileQuickReport}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isCompiling ? (
              <span className="flex items-center gap-1.5 animate-pulse">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Compiling...</span>
              </span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Compile operations report</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COMPILATION HISTORY LIST */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Compiled Document History
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                    <th className="pb-3">Report ID</th>
                    <th className="pb-3">Report Name</th>
                    <th className="pb-3">Format</th>
                    <th className="pb-3">Scope Boundary</th>
                    <th className="pb-3">Date compiled</th>
                    <th className="pb-3 text-right">Size</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 font-bold text-txt-primary">{rep.id}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                          <span className="font-semibold text-txt-primary leading-tight">{rep.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-txt-secondary font-mono">{rep.type}</td>
                      <td className="py-3.5 text-txt-secondary">{rep.scope}</td>
                      <td className="py-3.5 text-txt-secondary">{rep.date}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-txt-primary">{rep.size}</td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => toast.success(`Downloading ${rep.name}...`)}
                          className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SCHEDULED RUNS LIST */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Active Automated Schedules
            </h3>

            <div className="space-y-4">
              {scheduledTemplates.map((sch) => (
                <div key={sch.id} className="p-3.5 bg-surface/40 dark:bg-card-elevated border border-border-custom/50 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-txt-primary leading-tight">{sch.name}</h4>
                      <p className="text-[9px] text-txt-muted mt-0.5 font-mono">{sch.id} • {sch.format}</p>
                    </div>
                    <span className="text-[9px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-border-custom/50">
                    <span className="text-txt-secondary font-medium">Cron: {sch.frequency}</span>
                    <span className="text-brand-primary hover:underline truncate max-w-[150px]" title={sch.recipient}>
                      {sch.recipient}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg border border-border-custom rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-4 bg-surface/50 border-b border-border-custom flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-txt-primary">Create Report Automation</h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Report Task Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Weekly Fuel efficiency spreadsheet"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Cron Frequency
                    </label>
                    <select
                      value={newSchedule.frequency}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Every Monday">Every Monday</option>
                      <option value="1st of Month">1st of Month</option>
                      <option value="Daily 11:00 PM">Daily 11:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Export Format
                    </label>
                    <select
                      value={newSchedule.format}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, format: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="PDF">PDF Report</option>
                      <option value="Excel">Excel Sheet</option>
                      <option value="CSV">Flat CSV</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Corporate Recipient Email*
                  </label>
                  <input
                    type="email"
                    required
                    value={newSchedule.recipient}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="finance-ops@transitops.com"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="pt-3 border-t border-border-custom flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition-all cursor-pointer"
                  >
                    Save Automations
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
