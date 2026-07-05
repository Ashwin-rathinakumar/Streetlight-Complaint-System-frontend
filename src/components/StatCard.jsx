import React from 'react';

export default function StatCard({ title, value, icon, colorClass = "text-amber-500", description }) {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-slate-700/80 transition-all duration-300 shadow-xl">
      {/* Background Gradient Detail */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-700/10 to-slate-900/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/40 text-xl font-bold flex items-center justify-center border border-slate-850/50 shadow-inner ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
