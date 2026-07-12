import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Fuel,
  TrendingUp,
  Award,
  Download,
  Plus,
  Gauge,
  CheckCircle,
  FileText,
  Calendar,
  Truck,
  Droplet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function FuelLogs() {
  const [logs, setLogs] = useState([
    { id: 'FL-203', vehicle: 'VH-101', trip: 'TRK-204', date: '2026-07-12', driver: 'Marcus Vance', liters: 415, cost: 385.00, lpk: '12.0 L/100km', location: 'Pilot Station #109, PA' },
    { id: 'FL-202', vehicle: 'VH-105', trip: 'TRK-109', date: '2026-07-11', driver: 'Carlos Ruiz', liters: 320, cost: 310.25, lpk: '11.4 L/100km', location: 'Love Gas Depot, NJ' },
    { id: 'FL-201', vehicle: 'VH-102', trip: 'TRK-302', date: '2026-07-09', driver: 'Sarah Jenkins', gallons: 450, cost: 444.00, lpk: '13.5 L/100km', location: 'Speedway Interstate, MD' }
  ]);

  const fuelConsumptionHistory = [
    { date: 'Jul 06', value: 3200 },
    { date: 'Jul 07', value: 3450 },
    { date: 'Jul 08', value: 4100 },
    { date: 'Jul 09', value: 3700 },
    { date: 'Jul 10', value: 3950 },
    { date: 'Jul 11', value: 4900 },
    { date: 'Jul 12', value: 4680 }
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleRefs, setVehicleRefs] = useState([]);
  const [tripRefs, setTripRefs] = useState([]);
  const [newFuelEntry, setNewFuelEntry] = useState({
    vehicleId: '',
    tripId: '',
    liters: '',
    cost: '',
    location: '',
    date: ''
  });

  // Load fuel logs and dropdown refs from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [logsRes, vehiclesRes, tripsRes] = await Promise.all([
          api.get('/api/fuel-logs'),
          api.get('/api/vehicles'),
          api.get('/api/trips')
        ]);

        if (logsRes.data?.success && logsRes.data.data.length > 0) {
          const mapped = logsRes.data.data.map(l => ({
            ...l,
            id: l.id || l._id,
            vehicle: l.vehicle?.registrationNumber || l.vehicle || 'N/A',
            trip: l.trip?.id || l.trip || 'N/A',
            driver: l.driver || 'N/A',
            lpk: l.lpk || 'N/A'
          }));
          setLogs(mapped);
        }

        if (vehiclesRes.data?.success) {
          setVehicleRefs(vehiclesRes.data.data.map(v => ({
            _id: v._id,
            label: `${v.registrationNumber} — ${v.vehicleName}`
          })));
        }

        if (tripsRes.data?.success) {
          setTripRefs(tripsRes.data.data.map(t => ({
            _id: t._id,
            label: `${t.id || t._id.slice(-6)} (${t.source} → ${t.destination})`
          })));
        }
      } catch (err) {
        console.warn('Backend offline — retaining local fuel log registry.');
      }
    };
    loadData();
  }, []);

  const handleAddFuelLog = async (e) => {
    e.preventDefault();
    if (!newFuelEntry.liters || !newFuelEntry.cost || !newFuelEntry.location || !newFuelEntry.date) {
      toast.error('Please enter all required refuel fields.');
      return;
    }

    const payload = {
      vehicle: newFuelEntry.vehicleId || undefined,
      trip: newFuelEntry.tripId || undefined,
      liters: parseFloat(newFuelEntry.liters),
      cost: parseFloat(newFuelEntry.cost),
      date: newFuelEntry.date,
      location: newFuelEntry.location
    };

    try {
      const res = await api.post('/api/fuel-logs', payload);
      if (res.data?.success) {
        const saved = res.data.data;
        const entry = {
          ...saved,
          id: saved.id || saved._id,
          vehicle: vehicleRefs.find(v => v._id === newFuelEntry.vehicleId)?.label || newFuelEntry.vehicleId || 'N/A',
          trip: tripRefs.find(t => t._id === newFuelEntry.tripId)?.label || newFuelEntry.tripId || 'N/A',
          driver: 'System',
          lpk: 'Calculating...'
        };
        setLogs(prev => [entry, ...prev]);
        toast.success(`Refuel log saved to database!`, {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
      }
    } catch (err) {
      console.warn('Backend write failed — saving fuel log locally.', err);
      const createdId = 'FL-20' + (logs.length + 1);
      const entry = {
        ...newFuelEntry,
        id: createdId,
        liters: parseFloat(newFuelEntry.liters),
        cost: parseFloat(newFuelEntry.cost),
        vehicle: vehicleRefs.find(v => v._id === newFuelEntry.vehicleId)?.label || newFuelEntry.vehicleId || 'N/A',
        trip: tripRefs.find(t => t._id === newFuelEntry.tripId)?.label || newFuelEntry.tripId || 'N/A',
        driver: 'David Miller',
        lpk: '12.4 L/100km'
      };
      setLogs(prev => [entry, ...prev]);
      toast.success(`Refuel Log ${createdId} logged locally (offline mode)!`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }

    setShowAddForm(false);
    setNewFuelEntry({
      vehicleId: '',
      tripId: '',
      liters: '',
      cost: '',
      location: '',
      date: ''
    });
  };

  return (
    <div className="space-y-6 max-w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Fuel Intelligence Ledger</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Track liters consumption, refuel costs, trip links, and regional fuel stations.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Fuel Refill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CHART & ENTRIES */}
        <div className="lg:col-span-8 space-y-6">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium"
            >
              <div className="flex items-center gap-2 border-b border-border-custom/50 pb-2.5 mb-4">
                <Fuel className="w-5 h-5 text-brand-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-primary">Log Fuel Refill</h3>
              </div>

              <form onSubmit={handleAddFuelLog} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Select Vehicle
                  </label>
                  <select
                    value={newFuelEntry.vehicleId}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, vehicleId: e.target.value }))}
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
                        <option value="">VH-105 (Isuzu NPR)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Select Trip Link
                  </label>
                  <select
                    value={newFuelEntry.tripId}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, tripId: e.target.value }))}
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

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Liters Dispensed*
                  </label>
                  <input
                    type="number"
                    required
                    value={newFuelEntry.liters}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, liters: e.target.value }))}
                    placeholder="e.g. 415"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Cost Paid ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newFuelEntry.cost}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, cost: e.target.value }))}
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
                    value={newFuelEntry.date}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Gas Station Vendor*
                  </label>
                  <input
                    type="text"
                    required
                    value={newFuelEntry.location}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Pilot Station #109, PA"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-border-custom mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4.5 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 cursor-pointer"
                  >
                    Save Fuel Log
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Fuel Consumption Timeline (Liters)
            </h3>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelConsumptionHistory}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-custom)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFuel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Recent Refuel Logs (Liters)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                    <th className="pb-3">Refuel ID</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Trip Link</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Driver</th>
                    <th className="pb-3 text-right">Liters</th>
                    <th className="pb-3 text-right">Cost</th>
                    <th className="pb-3 text-right">Efficiency</th>
                    <th className="pb-3 pl-4">Location Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 font-bold text-txt-primary">{log.id}</td>
                      <td className="py-3.5 font-semibold text-brand-primary">{log.vehicle}</td>
                      <td className="py-3.5 font-mono text-txt-secondary">{log.trip}</td>
                      <td className="py-3.5 text-txt-secondary font-mono">{log.date}</td>
                      <td className="py-3.5 font-medium text-txt-primary">{log.driver}</td>
                      <td className="py-3.5 text-right font-mono font-bold">{log.liters || log.gallons} L</td>
                      <td className="py-3.5 text-right font-mono font-bold text-txt-primary">${log.cost.toLocaleString()}</td>
                      <td className="py-3.5 text-right font-semibold text-brand-teal">{log.lpk}</td>
                      <td className="py-3.5 pl-4 text-txt-secondary">{log.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: METRICS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Fuel Efficiency Metrics
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-brand-teal" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Avg L/100km performance</span>
                    <span className="text-base font-bold text-txt-primary">12.0 L/100km</span>
                  </div>
                </div>
                <span className="text-[10px] bg-brand-success/10 text-brand-success font-bold px-2 py-0.5 rounded">OPTIMAL</span>
              </div>

              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-brand-orange" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Total Spend (Month)</span>
                    <span className="text-base font-bold text-txt-primary">$41,280.00</span>
                  </div>
                </div>
                <span className="text-[10px] text-brand-danger bg-brand-danger/10 font-bold px-2 py-0.5 rounded">-1.2%</span>
              </div>

              <div className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-brand-primary" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Most Efficient Fleet</span>
                    <span className="text-xs font-bold text-txt-primary">VH-105 (Refrigerated)</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-brand-primary">11.4 L/100km</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
