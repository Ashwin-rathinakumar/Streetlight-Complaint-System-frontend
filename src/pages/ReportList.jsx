import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ReportList() {
  // Mode state: 'simplified' (Direct Complaints) or 'relational' (Streetlight Reports)
  const [listMode, setListMode] = useState('simplified');

  const [reports, setReports] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Layout States
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (listMode === 'relational') {
        const data = await api.getReports();
        setReports(data);
      } else {
        const data = await api.getComplaints();
        setComplaints(data);
      }
    } catch (err) {
      console.error("Error loading reports/complaints:", err);
      setError("Unable to query active issues. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [listMode]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    const formattedStatus = status ? status.toLowerCase() : '';
    switch (formattedStatus) {
      case 'submitted':
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'assigned':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'in progress':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  // Process filters for Relational Reports
  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const poleNum = report.streetlight?.pole_number?.toLowerCase() || '';
    const desc = report.description?.toLowerCase() || '';
    const category = report.issue_category?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return matchesStatus && (poleNum.includes(query) || desc.includes(query) || category.includes(query));
  });

  // Process filters for Simplified Complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Submitted' && complaint.status === 'pending') || 
      (statusFilter === 'Resolved' && complaint.status === 'resolved');
    
    const title = complaint.title?.toLowerCase() || '';
    const desc = complaint.description?.toLowerCase() || '';
    const loc = complaint.location?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return matchesStatus && (title.includes(query) || desc.includes(query) || loc.includes(query));
  });

  const getActiveList = () => (listMode === 'relational' ? filteredReports : filteredComplaints);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
      <div className="gradient-blob w-80 h-80 bg-indigo-650/5 top-1/4 left-1/3" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Civic Outage Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time municipal dashboard showing active streetlight problems and direct complaints.
          </p>
        </div>
        <Link
          to="/submit"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brandYellow text-slate-900 shadow-md shadow-brandYellow/10 hover:bg-brandYellowHover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
        >
          <span>➕ File a Complaint</span>
        </Link>
      </div>

      {/* Mode Selector Toggle */}
      <div className="flex mb-8">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setListMode('simplified'); setStatusFilter('All'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              listMode === 'simplified' ? 'bg-slate-800 text-brandYellow shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Direct Complaints
          </button>
          <button
            onClick={() => { setListMode('relational'); setStatusFilter('All'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              listMode === 'relational' ? 'bg-slate-800 text-brandYellow shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔌 Relational Reports
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={listMode === 'simplified' ? "Search by title or location..." : "Search by pole or category..."}
            className="w-full h-10 bg-slate-900/80 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:border-brandYellow outline-none pl-10 pr-4 text-sm transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(listMode === 'relational' 
              ? ['All', 'Submitted', 'In Progress', 'Resolved'] 
              : ['All', 'Pending', 'Resolved']
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter === 'Pending' ? 'Submitted' : filter)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                  (statusFilter === filter || (filter === 'Pending' && statusFilter === 'Submitted'))
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'cards' ? 'bg-slate-800 text-brandYellow' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Card View"
            >
              🎴
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-slate-800 text-brandYellow' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Table View"
            >
              📊
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-4 py-12 text-center">
          <svg className="animate-spin h-10 w-10 text-brandYellow mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-slate-400">Loading listings from municipality database...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center bg-red-500/5 max-w-xl mx-auto">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-lg font-bold text-red-400 mt-2">API Connection Offline</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : getActiveList().length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center">
          <span className="text-5xl">🌞</span>
          <h3 className="text-xl font-extrabold text-white mt-4">All Clear!</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            No active streetlight issues match your filters. All looks perfect!
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD GRID MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listMode === 'relational' ? (
            filteredReports.map((report) => (
              <div key={report.id} className="glass-panel rounded-2xl p-6 border border-slate-850 shadow-xl flex flex-col justify-between hover:scale-[1.01] hover:border-slate-800 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getStatusBadgeClass(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{formatDate(report.created_at)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">🔌 {report.issue_category}</h3>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-850 mt-3 flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Pole: {report.streetlight?.pole_number}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[14rem]">{report.streetlight?.location_description}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-350 mt-4 leading-relaxed line-clamp-3">{report.description || "No description provided."}</p>
                </div>
                <div className="border-t border-slate-850/80 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Reporter: {report.reporter_name}</span>
                  <span>ID: #{report.id}</span>
                </div>
              </div>
            ))
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="glass-panel rounded-2xl p-6 border border-slate-850 shadow-xl flex flex-col justify-between hover:scale-[1.01] hover:border-slate-800 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getStatusBadgeClass(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{formatDate(complaint.created_at)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">📋 {complaint.title}</h3>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-850 mt-3 flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Location</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[14rem]">{complaint.location}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-350 mt-4 leading-relaxed line-clamp-3">{complaint.description || "No description provided."}</p>
                </div>
                <div className="border-t border-slate-850/80 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Direct Outage Alert</span>
                  <span>ID: #{complaint.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TABLE LIST MODE */
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">{listMode === 'relational' ? "Issue Category" : "Title"}</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Reported On</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {listMode === 'relational' ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-400">#{report.id}</td>
                      <td className="py-4 px-6 font-bold text-white">🔌 {report.issue_category}</td>
                      <td className="py-4 px-6 text-slate-300">Pole {report.streetlight?.pole_number} ({report.streetlight?.location_description || "No landmarks"})</td>
                      <td className="py-4 px-6 text-slate-400">{formatDate(report.created_at)}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getStatusBadgeClass(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-400">#{complaint.id}</td>
                      <td className="py-4 px-6 font-bold text-white">📋 {complaint.title}</td>
                      <td className="py-4 px-6 text-slate-300">{complaint.location}</td>
                      <td className="py-4 px-6 text-slate-400">{formatDate(complaint.created_at)}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
