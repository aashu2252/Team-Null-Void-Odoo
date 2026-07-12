import React, { useState } from 'react';
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

export default function FuelLogs() {
  const [logs, setLogs] = useState([
    { id: 'FL-203', vehicle: 'VH-101', date: 'Jul 12, 2026', driver: 'Marcus Vance', gallons: 110, cost: '$385.00', mpg: '7.8 MPG', location: 'Pilot Station #109, PA' },
    { id: 'FL-202', vehicle: 'VH-105', date: 'Jul 11, 2026', driver: 'Carlos Ruiz', gallons: 85, cost: '$310.25', mpg: '8.4 MPG', location: 'Love Gas Depot, NJ' },
    { id: 'FL-201', vehicle: 'VH-102', date: 'Jul 09, 2026', driver: 'Sarah Jenkins', gallons: 120, cost: '$444.00', mpg: '6.9 MPG', location: 'Speedway Interstate, MD' }
  ]);

  const fuelConsumptionHistory = [
    { date: 'Jul 06', value: 850 },
    { date: 'Jul 07', value: 920 },
    { date: 'Jul 08', value: 1100 },
    { date: 'Jul 09', value: 980 },
    { date: 'Jul 10', value: 1050 },
    { date: 'Jul 11', value: 1300 },
    { date: 'Jul 12', value: 1240 }
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFuelEntry, setNewFuelEntry] = useState({
    vehicle: 'VH-101',
    driver: 'Marcus Vance',
    gallons: '',
    cost: '',
    location: ''
  });

  const handleAddFuelLog = (e) => {
    e.preventDefault();
    if (!newFuelEntry.gallons || !newFuelEntry.cost || !newFuelEntry.location) {
      toast.error('Please enter all required refuel fields.');
      return;
    }

    const createdId = 'FL-20' + (logs.length + 1);
    const entry = {
      ...newFuelEntry,
      id: createdId,
      date: 'Jul 12, 2026',
      gallons: parseInt(newFuelEntry.gallons),
      cost: `$${parseFloat(newFuelEntry.cost).toFixed(2)}`,
      mpg: '7.5 MPG' // Mock default
    };

    setLogs(prev => [entry, ...prev]);
    setShowAddForm(false);
    toast.success(`Refuel Log ${createdId} logged in registry!`, {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });

    setNewFuelEntry({
      vehicle: 'VH-101',
      driver: 'Marcus Vance',
      gallons: '',
      cost: '',
      location: ''
    });
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Fuel Intelligence Ledger</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Track gallon consumption, average MPG performance metrics, local fuel stations.</p>
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
                    Select Vehicle ID
                  </label>
                  <select
                    value={newFuelEntry.vehicle}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, vehicle: e.target.value }))}
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="VH-101">VH-101 (Volvo FH16)</option>
                    <option value="VH-102">VH-102 (Peterbilt 579)</option>
                    <option value="VH-105">VH-105 (Isuzu NPR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Gallons Dispensed*
                  </label>
                  <input
                    type="number"
                    required
                    value={newFuelEntry.gallons}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, gallons: e.target.value }))}
                    placeholder="e.g. 110"
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

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Refill Station & Location*
                  </label>
                  <input
                    type="text"
                    required
                    value={newFuelEntry.location}
                    onChange={(e) => setNewFuelEntry(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Pilot Station #109, Pennsylvania Route 84"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="flex items-end justify-end gap-2 mt-4 sm:mt-0">
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
                    Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary border-b border-border-custom/50 pb-2.5 mb-4">
              Fuel Consumption Timeline (Gallons)
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
              Recent Refuel Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-txt-muted text-[10px] uppercase font-bold tracking-wider border-b border-border-custom/50 pb-2">
                    <th className="pb-3">Refuel ID</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Driver</th>
                    <th className="pb-3 text-right">Gallons</th>
                    <th className="pb-3 text-right">Cost</th>
                    <th className="pb-3 text-right">Fuel Efficiency</th>
                    <th className="pb-3 pl-4">Location Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 font-bold text-txt-primary">{log.id}</td>
                      <td className="py-3.5 font-semibold text-brand-primary">{log.vehicle}</td>
                      <td className="py-3.5 text-txt-secondary">{log.date}</td>
                      <td className="py-3.5 font-medium text-txt-primary">{log.driver}</td>
                      <td className="py-3.5 text-right font-mono font-bold">{log.gallons} Gal</td>
                      <td className="py-3.5 text-right font-mono font-bold text-txt-primary">{log.cost}</td>
                      <td className="py-3.5 text-right font-semibold text-brand-teal">{log.mpg}</td>
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
                    <span className="text-[9px] uppercase font-bold text-txt-muted block">Avg mpg performance</span>
                    <span className="text-base font-bold text-txt-primary">7.4 MPG</span>
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
                <span className="text-[10px] font-mono font-bold text-brand-primary">8.4 MPG</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
