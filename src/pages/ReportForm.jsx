import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ReportForm() {
  const navigate = useNavigate();

  // Mode state: 'relational' (Streetlight Pole Outage) or 'simplified' (Direct Complaint)
  const [formMode, setFormMode] = useState('simplified');

  // State for streetlights loaded from backend (for relational mode)
  const [streetlights, setStreetlights] = useState([]);
  const [loadingPoles, setLoadingPoles] = useState(true);

  // Form input states for relational mode
  const [relationalData, setRelationalData] = useState({
    streetlight_id: '',
    issue_category: 'Completely Out',
    description: '',
    reporter_name: '',
    reporter_email: '',
  });

  // Form input states for simplified mode
  const [simplifiedData, setSimplifiedData] = useState({
    title: '',
    location: '',
    description: '',
  });

  // Simulated image upload states
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState('');

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch poles on component load (needed for relational mode)
  useEffect(() => {
    async function fetchPoles() {
      try {
        const data = await api.getStreetlights();
        setStreetlights(data);
        if (data.length > 0) {
          setRelationalData((prev) => ({ ...prev, streetlight_id: data[0].id.toString() }));
        }
      } catch (error) {
        console.error("Error fetching streetlight poles:", error);
      } finally {
        setLoadingPoles(false);
      }
    }
    fetchPoles();
  }, []);

  const handleQuickSeed = async () => {
    try {
      setLoadingPoles(true);
      const newPole = await api.createStreetlight({
        pole_number: `SL-${Math.floor(100 + Math.random() * 900)}`,
        latitude: 40.7128,
        longitude: -74.0060,
        location_description: "Generated from Frontend (Main Road Crossing)",
        status: "Functional"
      });
      setStreetlights((prev) => [...prev, newPole]);
      setRelationalData((prev) => ({ ...prev, streetlight_id: newPole.id.toString() }));
      showToast("Registered a new streetlight pole successfully! You can now submit your report.", "success");
    } catch (err) {
      console.error("Error creating mock pole:", err);
      showToast("Backend connection offline. Make sure the backend is running.", "error");
    } finally {
      setLoadingPoles(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  const handleRelationalChange = (e) => {
    const { name, value } = e.target;
    setRelationalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimplifiedChange = (e) => {
    const { name, value } = e.target;
    setSimplifiedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      showToast(`Image "${file.name}" uploaded successfully.`, 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formMode === 'relational') {
        if (!relationalData.streetlight_id) {
          showToast("Please select a valid streetlight pole.", "error");
          setSubmitting(false);
          return;
        }
        const payload = {
          ...relationalData,
          streetlight_id: parseInt(relationalData.streetlight_id, 10),
        };
        await api.createReport(payload);
      } else {
        // Simplified Mode
        await api.createComplaint(simplifiedData);
      }

      showToast("Complaint submitted successfully! Navigating to listings...", "success");
      
      // Reset forms
      setRelationalData({
        streetlight_id: streetlights[0]?.id.toString() || '',
        issue_category: 'Completely Out',
        description: '',
        reporter_name: '',
        reporter_email: '',
      });
      setSimplifiedData({
        title: '',
        location: '',
        description: '',
      });
      setImagePreview(null);
      setImageName('');
      
      setTimeout(() => {
        navigate('/list');
      }, 1500);

    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg = error.response?.data?.detail || "Connection failed. Ensure the FastAPI backend is running.";
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
      {/* Background Glow */}
      <div className="gradient-blob w-72 h-72 bg-brandYellow/5 -top-10 -right-10" />

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
      <div className="text-center mb-8 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Submit Streetlight Fault
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Notice a dark spot or broken pole? Use either option below to alert our civic maintenance team.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFormMode('simplified')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              formMode === 'simplified'
                ? 'bg-brandYellow text-slate-900 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Simple Direct Complaint
          </button>
          <button
            type="button"
            onClick={() => setFormMode('relational')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              formMode === 'relational'
                ? 'bg-brandYellow text-slate-900 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔌 Relational Pole Report
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {formMode === 'simplified' ? (
            /* SIMPLIFIED DIRECT COMPLAINT FORM */
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Complaint Title <span className="text-brandYellow">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={simplifiedData.title}
                  onChange={handleSimplifiedChange}
                  required
                  placeholder="e.g. Flickering streetlight near central park entrance"
                  className="w-full h-12 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow px-4 outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Location Details <span className="text-brandYellow">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={simplifiedData.location}
                  onChange={handleSimplifiedChange}
                  required
                  placeholder="e.g. 104 Park Avenue, adjacent to the post office"
                  className="w-full h-12 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow px-4 outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Detailed Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={simplifiedData.description}
                  onChange={handleSimplifiedChange}
                  placeholder="Describe the issue, time noticed, or other landmarks..."
                  className="w-full bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow p-4 outline-none transition-all duration-200"
                />
              </div>
            </div>
          ) : (
            /* RELATIONAL OUTAGE REPORT FORM */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Streetlight Selection */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="streetlight_id" className="block text-sm font-semibold tracking-wide text-slate-200">
                    Select Streetlight Pole & Location <span className="text-brandYellow">*</span>
                  </label>
                  {streetlights.length === 0 && !loadingPoles && (
                    <button
                      type="button"
                      onClick={handleQuickSeed}
                      className="text-xs text-brandYellow hover:underline bg-brandYellow/5 px-2.5 py-1 rounded-md border border-brandYellow/20 hover:bg-brandYellow/10 transition-all"
                    >
                      ➕ Register a Mock Pole
                    </button>
                  )}
                </div>
                
                {loadingPoles ? (
                  <div className="w-full h-12 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center px-4 animate-pulse">
                    <span className="text-slate-400 text-sm">Querying active municipality poles...</span>
                  </div>
                ) : streetlights.length === 0 ? (
                  <div className="w-full p-4 bg-slate-800/20 rounded-xl border border-dashed border-slate-700/80 text-center">
                    <p className="text-slate-300 text-sm mb-2">No active streetlight poles registered.</p>
                    <button
                      type="button"
                      onClick={handleQuickSeed}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-brandYellow text-slate-900 hover:bg-brandYellowHover transition-all"
                    >
                      Quick-Seed Test Streetlight Pole
                    </button>
                  </div>
                ) : (
                  <select
                    id="streetlight_id"
                    name="streetlight_id"
                    value={relationalData.streetlight_id}
                    onChange={handleRelationalChange}
                    required
                    className="w-full h-12 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow px-4 outline-none transition-all duration-200 cursor-pointer"
                  >
                    {streetlights.map((light) => (
                      <option key={light.id} value={light.id}>
                        {light.pole_number} — {light.location_description || "No landmarks"} ({light.latitude}, {light.longitude})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Issue Category */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="issue_category" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Outage Nature / Fault Category <span className="text-brandYellow">*</span>
                </label>
                <select
                  id="issue_category"
                  name="issue_category"
                  value={relationalData.issue_category}
                  onChange={handleRelationalChange}
                  required
                  className="w-full h-12 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow px-4 outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="Completely Out">Completely Out (Blackout)</option>
                  <option value="Flickering">Flickering / Dim Light</option>
                  <option value="Physical Damage">Physical Damage / Fallen Pole</option>
                  <option value="Other">Other / Broken Cover</option>
                </select>
              </div>

              {/* Reporter Name */}
              <div className="space-y-2">
                <label htmlFor="reporter_name" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Your Full Name <span className="text-brandYellow">*</span>
                </label>
                <input
                  type="text"
                  id="reporter_name"
                  name="reporter_name"
                  value={relationalData.reporter_name}
                  onChange={handleRelationalChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full h-12 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow px-4 outline-none transition-all duration-200"
                />
              </div>

              {/* Reporter Email */}
              <div className="space-y-2">
                <label htmlFor="reporter_email" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Your Email Address <span className="text-brandYellow">*</span>
                </label>
                <input
                  type="email"
                  id="reporter_email"
                  name="reporter_email"
                  value={relationalData.reporter_email}
                  onChange={handleRelationalChange}
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full h-12 bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow px-4 outline-none transition-all duration-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="relational_description" className="block text-sm font-semibold tracking-wide text-slate-200">
                  Outage Description / Additional Notes
                </label>
                <textarea
                  id="relational_description"
                  name="description"
                  rows="4"
                  value={relationalData.description}
                  onChange={handleRelationalChange}
                  placeholder="Specify helpful details..."
                  className="w-full bg-slate-900 text-slate-100 rounded-xl border border-slate-700/60 focus:border-brandYellow focus:ring-1 focus:ring-brandYellow p-4 outline-none transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Image Upload Option (Universal) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-slate-200">
              Upload Outage Image <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-700/60 border-dashed rounded-xl bg-slate-900/40 hover:bg-slate-900/70 transition-colors cursor-pointer relative">
              <input
                type="file"
                id="image_upload"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 text-center pointer-events-none">
                <span className="text-3xl">📷</span>
                <div className="flex text-sm text-slate-300">
                  <p className="pl-1"><span className="text-brandYellow hover:underline font-medium">Click to upload</span> or drag and drop</p>
                </div>
                <p className="text-xs text-slate-400">PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4 flex items-center space-x-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <img src={imagePreview} alt="Outage preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700 shadow" />
                <div>
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-xs">{imageName}</p>
                  <p className="text-[10px] text-green-400 font-medium">✅ Image processed for preview</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageName('');
                  }}
                  className="ml-auto p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end space-x-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-white hover:bg-slate-750 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl text-sm font-bold bg-brandYellow text-slate-900 shadow-md shadow-brandYellow/10 hover:bg-brandYellowHover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Complaint</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
