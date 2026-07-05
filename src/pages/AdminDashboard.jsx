import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [streetlights, setStreetlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab controls: 'complaints' (Simplified), 'reports' (Relational), or 'assets' (Streetlight Poles)
  const [activeTab, setActiveTab] = useState('complaints');

  // Stats Counters
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalReports: 0,
    activeComplaints: 0,
    activeReports: 0,
    totalPoles: 0,
  });

  // Form states for creating a new streetlight pole
  const [showPoleForm, setShowPoleForm] = useState(false);
  const [poleFormData, setPoleFormData] = useState({
    pole_number: '',
    latitude: '',
    longitude: '',
    location_description: '',
    status: 'Functional'
  });

  // UI Toast states
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportsData, complaintsData, streetlightsData] = await Promise.all([
        api.getReports(),
        api.getComplaints(),
        api.getStreetlights(),
      ]);
      
      setReports(reportsData);
      setComplaints(complaintsData);
      setStreetlights(streetlightsData);

      // Compute statistics
      const totalReports = reportsData.length;
      const activeReports = reportsData.filter(r => r.status !== 'Resolved').length;
      
      const totalComplaints = complaintsData.length;
      const activeComplaints = complaintsData.filter(c => c.status !== 'resolved').length;
      
      const totalPoles = streetlightsData.length;

      setStats({ totalComplaints, totalReports, activeComplaints, activeReports, totalPoles });
    } catch (err) {
      console.error("Error loading admin datasets:", err);
      setError("Failed to sync backend datasets. Check database connectivity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler for updating status of a Relational Outage Report
  const handleReportStatusChange = async (reportId, newStatus) => {
    try {
      await api.updateReportStatus(reportId, newStatus);
      showToast(`Outage Report #${reportId} updated to "${newStatus}"!`, 'success');
      loadData();
    } catch (err) {
      console.error("Outage report status error:", err);
      showToast("Failed to update status. Check backend logs.", "error");
    }
  };

  // Handler for updating status of a Simplified Complaint
  const handleComplaintStatusChange = async (complaintId, newStatus) => {
    try {
      await api.updateComplaintStatus(complaintId, newStatus);
      showToast(`Complaint #${complaintId} updated to "${newStatus}"!`, 'success');
      loadData();
    } catch (err) {
      console.error("Complaint status update error:", err);
      showToast("Failed to update complaint status.", "error");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`Are you sure you want to delete Outage Report #${reportId}?`)) return;
    try {
      await api.deleteReport(reportId);
      showToast(`Outage Report #${reportId} deleted successfully.`, 'success');
      loadData();
    } catch (err) {
      console.error("Delete report error:", err);
      showToast("Failed to delete report.", "error");
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm(`Are you sure you want to delete Complaint #${complaintId}?`)) return;
    try {
      await api.deleteComplaint(complaintId);
      showToast(`Complaint #${complaintId} deleted successfully.`, 'success');
      loadData();
    } catch (err) {
      console.error("Delete complaint error:", err);
      showToast("Failed to delete complaint.", "error");
    }
  };

  const handlePoleSubmit = async (e) => {
    e.preventDefault();
    if (!poleFormData.pole_number || !poleFormData.latitude || !poleFormData.longitude) {
      showToast("Please fill all required pole metrics.", "error");
      return;
    }

    try {
      const payload = {
        pole_number: poleFormData.pole_number,
        latitude: parseFloat(poleFormData.latitude),
        longitude: parseFloat(poleFormData.longitude),
        location_description: poleFormData.location_description,
        status: poleFormData.status
      };

      await api.createStreetlight(payload);
      showToast(`Pole "${poleFormData.pole_number}" registered successfully!`, 'success');
      
      setPoleFormData({
        pole_number: '',
        latitude: '',
        longitude: '',
        location_description: '',
        status: 'Functional'
      });
      setShowPoleForm(false);
      loadData();
    } catch (err) {
      console.error("Error creating pole:", err);
      const errMsg = err.response?.data?.detail || "Registration failed. Ensure pole number is unique.";
      showToast(errMsg, "error");
    }
  };

  const handlePoleInputChange = (e) => {
    const { name, value } = e.target;
    setPoleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeletePole = async (poleId, poleNum) => {
    if (!window.confirm(`WARNING: Deleting Pole "${poleNum}" will delete all associated fault reports. Proceed?`)) return;
    try {
      await api.deleteStreetlight(poleId);
      showToast(`Streetlight pole "${poleNum}" successfully removed.`, 'success');
      loadData();
    } catch (err) {
      console.error("Delete pole error:", err);
      showToast("Failed to delete pole.", "error");
    }
  };

  const getStatusBadge = (status) => {
    const formatted = status ? status.toLowerCase() : '';
    switch (formatted) {
      case 'functional':
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'faulty':
      case 'submitted':
      case 'pending':
        return 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse';
      case 'maintenance':
      case 'assigned':
      case 'in progress':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/30' 
            : 'bg-slate-900/90 text-red-400 border-red-500/30'
        }`}>
          <span className="text-xl mr-3">{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="text-sm font-semibold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Administration Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch technicians, manage direct civic complaints, and register active streetlight assets.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700/60 hover:bg-slate-750 active:scale-[0.98] transition-all"
        >
          🔄 Sync Datasets
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatCard
          title="Direct Complaints"
          value={loading ? "..." : stats.totalComplaints}
          icon="📋"
          colorClass="text-blue-400"
          description="Direct citizen alerts"
        />
        <StatCard
          title="Active Complaints"
          value={loading ? "..." : stats.activeComplaints}
          icon="🚨"
          colorClass="text-red-400"
          description="Complaints pending fix"
        />
        <StatCard
          title="Relational Reports"
          value={loading ? "..." : stats.totalReports}
          icon="🔌"
          colorClass="text-purple-400"
          description="Detailed streetlight logs"
        />
        <StatCard
          title="Active Reports"
          value={loading ? "..." : stats.activeReports}
          icon="🔥"
          colorClass="text-amber-500"
          description="Outages in repair"
        />
        <StatCard
          title="Registered Assets"
          value={loading ? "..." : stats.totalPoles}
          icon="💡"
          colorClass="text-brandYellow"
          description="Total physical poles"
        />
      </div>

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 text-center bg-red-500/5 mb-8 max-w-xl mx-auto">
          <span className="text-2xl">⚠️</span>
          <h4 className="text-sm font-bold text-red-400 mt-1">Connection Lost</h4>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 mb-8 space-x-6">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors duration-200 relative ${
            activeTab === 'complaints' ? 'text-brandYellow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Direct Complaints ({stats.totalComplaints})
          {activeTab === 'complaints' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brandYellow" />}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors duration-200 relative ${
            activeTab === 'reports' ? 'text-brandYellow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Relational Reports ({stats.totalReports})
          {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brandYellow" />}
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors duration-200 relative ${
            activeTab === 'assets' ? 'text-brandYellow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Registered Poles ({stats.totalPoles})
          {activeTab === 'assets' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brandYellow" />}
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-brandYellow mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading administrative records...</p>
        </div>
      ) : activeTab === 'complaints' ? (
        /* TAB 1: DIRECT COMPLAINTS */
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          {complaints.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl">📜</span>
              <p className="text-sm text-slate-400 mt-2">No complaints filed yet by municipal residents.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Reported Date</th>
                    <th className="py-4 px-6 text-center">Status Dispatch</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-500">#{c.id}</td>
                      <td className="py-4 px-6 font-bold text-white">{c.title}</td>
                      <td className="py-4 px-6">{c.location}</td>
                      <td className="py-4 px-6 max-w-xs truncate">{c.description || "N/A"}</td>
                      <td className="py-4 px-6 text-slate-400">{formatDate(c.created_at)}</td>
                      
                      <td className="py-4 px-6 text-center">
                        <select
                          value={c.status}
                          onChange={(e) => handleComplaintStatusChange(c.id, e.target.value)}
                          className="bg-slate-900 text-slate-100 rounded-lg border border-slate-700/60 outline-none p-1.5 font-semibold text-xs tracking-wider cursor-pointer focus:border-brandYellow"
                        >
                          <option value="pending">Pending 📋</option>
                          <option value="resolved">Resolved ✅</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteComplaint(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/40 transition-colors font-bold"
                          title="Delete Complaint"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'reports' ? (
        /* TAB 2: RELATIONAL REPORTS */
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl">📜</span>
              <p className="text-sm text-slate-400 mt-2">No detailed reports logged.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Target Pole & Location</th>
                    <th className="py-4 px-6">Reporter</th>
                    <th className="py-4 px-6">Reported Date</th>
                    <th className="py-4 px-6 text-center">Status Dispatch</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-500">#{report.id}</td>
                      <td className="py-4 px-6 font-bold text-white">{report.issue_category}</td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-white block">Pole: {report.streetlight?.pole_number}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{report.streetlight?.location_description}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-350">
                        <div>
                          <span className="font-medium block text-slate-250">{report.reporter_name}</span>
                          <span className="text-[10px] text-slate-400 block">{report.reporter_email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{formatDate(report.created_at)}</td>
                      
                      <td className="py-4 px-6 text-center">
                        <select
                          value={report.status}
                          onChange={(e) => handleReportStatusChange(report.id, e.target.value)}
                          className="bg-slate-900 text-slate-100 rounded-lg border border-slate-700/60 outline-none p-1.5 font-semibold text-xs tracking-wider cursor-pointer focus:border-brandYellow"
                        >
                          <option value="Submitted">Submitted 📋</option>
                          <option value="Assigned">Assigned 🛠️</option>
                          <option value="In Progress">In Progress ⚙️</option>
                          <option value="Resolved">Resolved ✅</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/40 transition-colors font-bold"
                          title="Delete Report"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 3: REGISTERED POLES */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Registered Physical Asset Inventory</h3>
            <button
              onClick={() => setShowPoleForm(!showPoleForm)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brandYellow text-slate-900 shadow hover:bg-brandYellowHover transition-all flex items-center space-x-1"
            >
              <span>{showPoleForm ? "✕ Close Form" : "➕ Register New Pole"}</span>
            </button>
          </div>

          {showPoleForm && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 bg-slate-900/30 max-w-2xl">
              <h4 className="text-sm font-bold text-white mb-4">Register Streetlight Pole</h4>
              <form onSubmit={handlePoleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pole ID *</label>
                    <input
                      type="text"
                      name="pole_number"
                      value={poleFormData.pole_number}
                      onChange={handlePoleInputChange}
                      placeholder="e.g. SL-201"
                      required
                      className="w-full h-9 bg-slate-950 text-slate-100 rounded-lg border border-slate-800 px-3 outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={poleFormData.latitude}
                      onChange={handlePoleInputChange}
                      placeholder="e.g. 40.7128"
                      required
                      className="w-full h-9 bg-slate-950 text-slate-100 rounded-lg border border-slate-800 px-3 outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={poleFormData.longitude}
                      onChange={handlePoleInputChange}
                      placeholder="e.g. -74.0060"
                      required
                      className="w-full h-9 bg-slate-950 text-slate-100 rounded-lg border border-slate-800 px-3 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Location Landmark</label>
                  <input
                    type="text"
                    name="location_description"
                    value={poleFormData.location_description}
                    onChange={handlePoleInputChange}
                    placeholder="e.g. Corner of 8th St, opposite post office"
                    className="w-full h-9 bg-slate-950 text-slate-100 rounded-lg border border-slate-800 px-3 outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPoleForm(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-750 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brandYellow text-slate-900 font-bold rounded-lg text-xs hover:bg-brandYellowHover"
                  >
                    Register Asset
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {streetlights.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-3xl">🔌</span>
                <p className="text-sm text-slate-400 mt-2">No physical streetlight assets registered.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Pole Number</th>
                      <th className="py-4 px-6">Location Landmark</th>
                      <th className="py-4 px-6">Coordinates (Lat, Lng)</th>
                      <th className="py-4 px-6">Status Indicator</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs text-slate-350">
                    {streetlights.map((pole) => (
                      <tr key={pole.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-500">#{pole.id}</td>
                        <td className="py-4 px-6 font-bold text-white">{pole.pole_number}</td>
                        <td className="py-4 px-6">{pole.location_description || "N/A"}</td>
                        <td className="py-4 px-6 text-slate-400">
                          {pole.latitude.toFixed(4)}, {pole.longitude.toFixed(4)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${getStatusBadge(pole.status)}`}>
                            {pole.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDeletePole(pole.id, pole.pole_number)}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800/40 rounded transition-colors"
                            title="Delete Asset"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
