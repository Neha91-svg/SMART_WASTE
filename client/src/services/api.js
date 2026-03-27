import axios from 'axios';

/**
 * API Service — Centralized API calls to the backend server
 * Uses Vite proxy (/api → http://localhost:5000)
 */

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// ============================================================
// WASTE REPORTS
// ============================================================

/** Submit a new waste report */
export const reportWaste = (data) => api.post('/report-waste', data);

/** Get all waste reports */
export const getWasteData = () => api.get('/waste-data');

/** Get waste statistics */
export const getWasteStats = () => api.get('/waste-stats');

/** Update a waste report status */
export const updateWasteStatus = (id, status) => api.patch(`/waste-data/${id}`, { status });

// ============================================================
// PICKUP REQUESTS
// ============================================================

/** Submit a new pickup request */
export const requestPickup = (data) => api.post('/request-pickup', data);

/** Get all pickup requests */
export const getPickupRequests = () => api.get('/pickup-requests');

/** Update a pickup request status */
export const updatePickupStatus = (id, status) => api.patch(`/pickup-requests/${id}`, { status });

// ============================================================
// E-WASTE CENTERS
// ============================================================

/** Get all e-waste centers, sorted by distance if coordinates provided */
export const getEWasteCenters = (lat, lng) => {
  const params = lat && lng ? { lat, lng } : {};
  return api.get('/ewaste-centers', { params });
};

// ============================================================
// ROUTE OPTIMIZATION
// ============================================================

/** Optimize route for waste collection */
export const optimizeRoute = (truckStart, locations) =>
  api.post('/optimize-route', { truckStart, locations });

// ============================================================
// HEALTH CHECK
// ============================================================
export const healthCheck = () => api.get('/health');

export default api;
