import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const api = {
  // ----------------------------------------------------
  // Streetlight Endpoints
  // ----------------------------------------------------
  
  // Get all streetlights
  getStreetlights: async (status) => {
    const response = await apiClient.get('/api/streetlights/', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // Get a single streetlight with its report history
  getStreetlight: async (id) => {
    const response = await apiClient.get(`/api/streetlights/${id}`);
    return response.data;
  },

  // Register a new streetlight pole
  createStreetlight: async (streetlightData) => {
    const response = await apiClient.post('/api/streetlights/', streetlightData);
    return response.data;
  },

  // Update streetlight details (latitude, longitude, description, or status)
  updateStreetlight: async (id, updateData) => {
    const response = await apiClient.put(`/api/streetlights/${id}`, updateData);
    return response.data;
  },

  // Delete a streetlight pole (cascades and deletes its reports)
  deleteStreetlight: async (id) => {
    await apiClient.delete(`/api/streetlights/${id}`);
    return true;
  },

  // ----------------------------------------------------
  // Fault Report Endpoints
  // ----------------------------------------------------
  
  // Get all reports, optionally filter by status
  getReports: async (status) => {
    const response = await apiClient.get('/api/reports/', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // Get a specific report with full details
  getReport: async (id) => {
    const response = await apiClient.get(`/api/reports/${id}`);
    return response.data;
  },

  // Submit a new fault report (automatically marks pole as "Faulty")
  createReport: async (reportData) => {
    const response = await apiClient.post('/api/reports/', reportData);
    return response.data;
  },

  // Update a report's status (Submitted, Assigned, In Progress, Resolved)
  updateReportStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/reports/${id}/status`, { status });
    return response.data;
  },

  // Delete a report
  deleteReport: async (id) => {
    await apiClient.delete(`/api/reports/${id}`);
    return true;
  },

  // ----------------------------------------------------
  // Complaint Endpoints (New simplified structure)
  // ----------------------------------------------------
  
  // Get all complaints
  getComplaints: async (status) => {
    const response = await apiClient.get('/complaints', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // Get a specific complaint
  getComplaint: async (id) => {
    const response = await apiClient.get(`/complaint/${id}`);
    return response.data;
  },

  // Submit a new complaint (title, description, location)
  createComplaint: async (complaintData) => {
    const response = await apiClient.post('/complaint', complaintData);
    return response.data;
  },

  // Update complaint status (pending, resolved)
  updateComplaintStatus: async (id, status) => {
    const response = await apiClient.put(`/complaint/${id}`, { status });
    return response.data;
  },

  // Delete a complaint
  deleteComplaint: async (id) => {
    await apiClient.delete(`/complaint/${id}`);
    return true;
  },
};

export default api;

