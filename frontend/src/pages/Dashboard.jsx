import React from 'react';

export default function Dashboard() {
  const kpiCards = [
    { title: 'Active Vehicles', value: '112', change: '80% active rate', color: 'border-cyan-500/30 text-cyan-400' },
    { title: 'Available Vehicles', value: '28', change: 'Ready for dispatch', color: 'border-emerald-500/30 text-emerald-400' },
    { title: 'Vehicles in Maintenance', value: '10', change: '4 scheduled service', color: 'border-red-500/30 text-red-400' },
    { title: 'Active Trips', value: '84', change: 'Currently in progress', color: 'border-blue-500/30 text-blue-400' },
    { title: 'Pending Trips', value: '19', change: 'Awaiting departure', color: 'border-amber-500/30 text-amber-400' },
    { title: 'Drivers On Duty', value: '92', change: '6 on reserve standby', color: 'border-purple-500/30 text-purple-400' },
    { title: 'Fleet Utilization', value: '87.5%', change: '+1.2% this week', color: 'border-indigo-500/30 text-indigo-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-slate-400">Live operational dashboard metrics and analytical summaries.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-slate-900 border ${kpi.color} rounded-2xl p-5 shadow-md flex flex-col justify-between`}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
            <div className="mt-2.5">
              <p className="text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-[220px] flex flex-col">
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase border-b border-slate-850 pb-2">
            Vehicle Status Chart
          </h2>
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-xl mt-4">
            <span className="text-xs text-slate-500 font-mono">Chart Placeholder</span>
          </div>
        </div>

        {/* Trip Status Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-[220px] flex flex-col">
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase border-b border-slate-850 pb-2">
            Trip Status Chart
          </h2>
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-xl mt-4">
            <span className="text-xs text-slate-500 font-mono">Chart Placeholder</span>
          </div>
        </div>

        {/* Recent Activities Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-[220px] flex flex-col">
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase border-b border-slate-850 pb-2">
            Recent Activities
          </h2>
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-xl mt-4">
            <span className="text-xs text-slate-500 font-mono">Log Feed Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
