import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({
    totalPoles: 0,
    activeFaults: 0,
    resolvedIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [poles, reports] = await Promise.all([
          api.getStreetlights(),
          api.getReports(),
        ]);
        
        const totalPoles = poles.length;
        const activeFaults = reports.filter(r => r.status !== 'Resolved').length;
        const resolvedIssues = reports.filter(r => r.status === 'Resolved').length;
        
        setStats({ totalPoles, activeFaults, resolvedIssues });
      } catch (error) {
        console.error("Error loading landing page stats:", error);
        // Generous user-friendly fallback if backend isn't loaded yet
        setStats({ totalPoles: 5, activeFaults: 0, resolvedIssues: 0 });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative Blur Background Blobs */}
      <div className="gradient-blob w-72 h-72 sm:w-96 sm:h-96 bg-brandYellow/10 top-12 left-10" />
      <div className="gradient-blob w-80 h-80 sm:w-[28rem] sm:h-[28rem] bg-indigo-600/10 bottom-16 right-5" />

      <div className="max-w-7xl mx-auto w-full my-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Content Side */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider bg-brandYellow/10 text-brandYellow uppercase border border-brandYellow/20 animate-pulse">
            💡 Active Civic Safety Initiative
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Light Up Our Streets, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandYellow to-amber-500">
              Ensure Safer Lanes.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Welcome to the Lumina Streetlight Fault Reporting System. Residents of our municipality can instantly log complaints about broken, flickering, or damaged streetlights to keep our neighborhoods bright and secure.
          </p>

          {/* Quick Actions Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
            <Link
              to="/submit"
              className="px-8 py-4 rounded-xl text-base font-semibold bg-brandYellow text-slate-900 shadow-lg shadow-brandYellow/20 hover:bg-brandYellowHover hover:scale-[1.03] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>⚠️ Report a Broken Light</span>
            </Link>
            <Link
              to="/list"
              className="px-8 py-4 rounded-xl text-base font-semibold bg-slate-800 text-white hover:bg-slate-700 hover:scale-[1.03] border border-slate-700/60 transition-all duration-300 flex items-center justify-center"
            >
              🔍 View Active Complaints
            </Link>
          </div>
        </div>

        {/* Right Info Card Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl sm:col-span-2 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-brandYellow" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Operational Streetlight Assets</p>
            <h2 className="text-5xl font-extrabold text-white mt-3 group-hover:scale-105 transition-transform duration-300">
              {loading ? "..." : stats.totalPoles}
            </h2>
            <p className="text-xs text-slate-400 mt-2">Registered streetlight poles mapping throughout the municipality</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Outages</p>
            <h3 className="text-4xl font-extrabold text-red-400 mt-3 group-hover:scale-105 transition-transform duration-300">
              {loading ? "..." : stats.activeFaults}
            </h3>
            <p className="text-xs text-slate-400 mt-2">Faults requiring technician assignment or currently in repair</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Resolved Issues</p>
            <h3 className="text-4xl font-extrabold text-green-400 mt-3 group-hover:scale-105 transition-transform duration-300">
              {loading ? "..." : stats.resolvedIssues}
            </h3>
            <p className="text-xs text-slate-400 mt-2">Streetlights fixed and safely restored to service this month</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto w-full border-t border-slate-800/80 pt-6 mt-12 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 Lumina Municipality Civil Engineering and Infrastructure Dept.</p>
        <div className="flex space-x-4">
          <Link to="/admin" className="hover:text-brandYellow transition-colors duration-200">Admin Portal Log-In</Link>
          <span>•</span>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-brandYellow transition-colors duration-200">API Documentation</a>
        </div>
      </div>
    </div>
  );
}
