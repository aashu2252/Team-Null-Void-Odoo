import React, { useState, useEffect } from 'react';
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
import api from '../services/api';

export default function Reports() {
  const [reports, setReports] = useState([
    { id: 'REP-001', name: 'Fleet Fuel Performance Audit', type: 'CSV Export', scope: 'Full Fleet', date: 'Jul 12, 2026', size: 'Calculating...', status: 'Ready', key: 'fuel-logs' },
    { id: 'REP-002', name: 'Personnel & Driver Safety Compliance Roster', type: 'CSV Export', scope: 'Personnel', date: 'Jul 10, 2026', size: 'Calculating...', status: 'Ready', key: 'drivers' },
    { id: 'REP-003', name: 'Maintenance Work Order Diagnostic Log', type: 'CSV Export', scope: 'Assets (Vehicles)', date: 'Jul 08, 2026', size: 'Calculating...', status: 'Ready', key: 'maintenance' },
    { id: 'REP-004', name: 'Expenses & Operational Cost Audit Ledger', type: 'CSV Export', scope: 'Finance', date: 'Jul 05, 2026', size: 'Calculating...', status: 'Ready', key: 'expenses' },
    { id: 'REP-005', name: 'Trips Operations Manifest Ledger', type: 'CSV Export', scope: 'Logistics', date: 'Jul 03, 2026', size: 'Calculating...', status: 'Ready', key: 'trips' },
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

  const loadReportSizes = async () => {
    try {
      const [fuelRes, driversRes, maintRes, expRes, tripsRes] = await Promise.all([
        api.get('/api/fuel-logs?limit=1000'),
        api.get('/api/drivers?limit=1000'),
        api.get('/api/maintenance?limit=1000'),
        api.get('/api/expenses?limit=1000'),
        api.get('/api/trips?limit=1000')
      ]);

      const getLength = (res, prop) => {
        const arr = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.[prop] || [];
        return arr.length;
      };

      const counts = {
        'fuel-logs': getLength(fuelRes, 'fuelLogs'),
        'drivers': getLength(driversRes, 'drivers'),
        'maintenance': getLength(maintRes, 'maintenance'),
        'expenses': getLength(expRes, 'expenses'),
        'trips': getLength(tripsRes, 'trips')
      };

      setReports(prev => prev.map(r => {
        const count = counts[r.key] || 0;
        const sizeKB = ((count * 150) / 1024).toFixed(1);
        return {
          ...r,
          size: `${sizeKB} KB (${count} rows)`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };
      }));
    } catch (err) {
      console.warn('Failed to calculate report file sizes', err);
    }
  };

  useEffect(() => {
    loadReportSizes();
  }, []);

  const compileQuickReport = () => {
    setIsCompiling(true);
    toast.success('Initiating Quick Report Compiler...', {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setTimeout(async () => {
      await loadReportSizes();
      setIsCompiling(false);
      toast.success(`Operations summary and report indices updated.`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }, 1500);
  };

  const handleDownloadReport = async (rep) => {
    toast.success(`Generating CSV for ${rep.name}...`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    try {
      let csvContent = "";
      if (rep.key === 'fuel-logs') {
        const res = await api.get('/api/fuel-logs?limit=1000');
        const logsData = Array.isArray(res.data.data) ? res.data.data : res.data.data?.fuelLogs || [];
        csvContent = "Refuel ID,Vehicle,Trip Link,Date,Liters,Cost,Location\n"
          + logsData.map(l => {
            const vReg = l.vehicle?.registrationNumber || l.vehicle || 'N/A';
            const tId = l.trip?.id || l.trip || 'N/A';
            return `"${l.id || l._id}","${vReg}","${tId}","${l.date}",${l.liters},${l.cost},"${l.location}"`;
          }).join("\n");
      } else if (rep.key === 'drivers') {
        const res = await api.get('/api/drivers?limit=1000');
        const driversData = Array.isArray(res.data.data) ? res.data.data : res.data.data?.drivers || [];
        csvContent = "Driver ID,Name,Status,Safety Score,Trips Completed,Contact Number,License Category\n"
          + driversData.map(d => `"${d.id || d._id}","${d.name}","${d.status}",${d.safetyScore},${d.trips},"${d.contactNumber}","${d.licenseCategory}"`).join("\n");
      } else if (rep.key === 'maintenance') {
        const res = await api.get('/api/maintenance?limit=1000');
        const maintData = Array.isArray(res.data.data) ? res.data.data : res.data.data?.maintenance || [];
        csvContent = "Work Order ID,Vehicle,Title,Description,Priority,Cost,Status,Start Date\n"
          + maintData.map(m => {
            const vReg = m.vehicle?.registrationNumber || m.vehicle?.vehicleName || m.vehicle || 'N/A';
            return `"${m.id || m._id}","${vReg}","${m.title}","${m.description}","${m.priority}",${m.cost},"${m.status}","${m.startDate}"`;
          }).join("\n");
      } else if (rep.key === 'expenses') {
        const res = await api.get('/api/expenses?limit=1000');
        const expData = Array.isArray(res.data.data) ? res.data.data : res.data.data?.expenses || [];
        csvContent = "Expense ID,Description,Type,Amount,Date,Vehicle,Trip,Status\n"
          + expData.map(e => {
            const vReg = e.vehicle?.registrationNumber || e.vehicle || 'N/A';
            const tId = e.trip?.id || e.trip || 'N/A';
            return `"${e.id || e._id}","${e.description}","${e.type}",${e.amount},"${e.date}","${vReg}","${tId}","${e.status}"`;
          }).join("\n");
      } else if (rep.key === 'trips') {
        const res = await api.get('/api/trips?limit=1000');
        const tripsData = Array.isArray(res.data.data) ? res.data.data : res.data.data?.trips || [];
        csvContent = "Trip ID,Source,Destination,Status,Driver,Vehicle,Start Date,End Date\n"
          + tripsData.map(t => {
            const dName = t.driver?.name || t.driver || 'N/A';
            const vReg = t.vehicle?.registrationNumber || t.vehicle || 'N/A';
            return `"${t.id || t._id}","${t.source}","${t.destination}","${t.status}","${dName}","${vReg}","${t.startDate}","${t.endDate}"`;
          }).join("\n");
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${rep.key}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${rep.name} downloaded successfully!`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    } catch (err) {
      toast.error('Failed to generate and download report.');
      console.error(err);
    }
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
                          onClick={() => handleDownloadReport(rep)}
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
