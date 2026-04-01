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
export const updatePickupStatus = (id, status, assignedVendor) => api.patch(`/pickup-requests/${id}`, { status, assignedVendor });

/** Submit a bid for a bulk request */
export const submitBid = (id, vendorName, amount) => api.post(`/pickup-requests/${id}/bid`, { vendorName, amount });

/** Accept a vendor bid */
export const acceptBid = (id, bidId) => api.post(`/pickup-requests/${id}/accept-bid`, { bidId });

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

// ============================================================
// AI CHATBOT
// ============================================================

/** Send a message (and optional image) to the AI chatbot */
export const sendChatMessage = (message, imageBase64) =>
  api.post('/chat', { message, imageBase64 });

// ============================================================
// ML PREDICTIONS
// ============================================================

/** Get garbage intensity predictions for given time */
export const getPredictions = (targetHour, targetDay) =>
  api.post('/predict-heatmap', { target_hour: targetHour, target_day: targetDay });

/** Check if ML service is running */
export const getMLHealth = () => api.get('/ml-health');

// ============================================================
// CRM — Admin Customer & Vendor Management
// ============================================================

/** Get all CRM customers */
export const getCRMCustomers = (params) => api.get('/crm/customers', { params });

/** Get single customer by ID */
export const getCRMCustomer = (id) => api.get(`/crm/customers/${id}`);

/** Update customer status/notes */
export const updateCRMCustomer = (id, data) => api.patch(`/crm/customers/${id}`, data);

/** Get all CRM vendors */
export const getCRMVendors = (params) => api.get('/crm/vendors', { params });

/** Get single vendor by ID */
export const getCRMVendor = (id) => api.get(`/crm/vendors/${id}`);

/** Update vendor status/notes */
export const updateCRMVendor = (id, data) => api.patch(`/crm/vendors/${id}`, data);

/** Get aggregated CRM stats */
export const getCRMStats = () => api.get('/crm/stats');

// ============================================================
// SATELLITE PREDICTION — Geospatial AI
// ============================================================

/** Run satellite waste prediction pipeline for a given bounding box */
export const getSatellitePrediction = (params) =>
  api.post('/satellite-predict', params);

/** Check satellite engine health (GEE connection status) */
export const getSatelliteHealth = () => api.get('/satellite-health');

export default api;
