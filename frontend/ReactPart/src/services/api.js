import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').trim() || 'http://localhost:8000';

const api = axios.create({
    baseURL: `${apiBaseUrl}/api`,
});

// ============================================
// STATION ENDPOINTS
// ============================================

// Get all stations with coordinates
export const getStations = () => api.get('/stations');

// Get detailed station data (includes new fields)
export const getStationsDetailed = () => api.get('/stations/detailed');

// Get realtime stats from ChargingEvents (avg wait time, charging time, etc.)
export const getRealtimeStats = () => api.get('/stations/realtime');

// Analyze nearby stations for removal recommendation
export const analyzeStationRemoval = (stationId) =>
    api.get(`/stations/analyze-removal/${encodeURIComponent(stationId)}`);

// Analyze a pinned location for optimal station placement
export const analyzePinnedLocation = (lat, lon) =>
    api.post('/stations/analyze-location', { lat, lon });


// ============================================
// SIMULATION ENDPOINTS
// ============================================

// Run simulation with optional tweaks
export const runSimulation = (tweaks = []) => api.post('/simulate', { tweaks });

// ============================================
// SCENARIO ENDPOINTS
// ============================================

// Get list of all scenarios
export const getScenarios = () => api.get('/scenarios');

// Load a specific scenario
export const loadScenario = (name) => api.get(`/scenarios/${name}`);

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Get network-wide analytics
export const getNetworkAnalytics = () => api.get('/analytics/network');

// Get analytics for a specific station
export const getStationAnalytics = (stationId) =>
    api.get(`/analytics/${encodeURIComponent(stationId)}`);

// ============================================
// REPLENISHMENT POLICY ENDPOINTS
// ============================================

// Get network replenishment summary
export const getNetworkReplenishment = () => api.get('/replenishment/network');

// Get replenishment schedule for a station
export const getStationReplenishment = (stationId) =>
    api.get(`/replenishment/${encodeURIComponent(stationId)}`);

// Get optimal stock levels for a station
export const getOptimalStock = (stationId) =>
    api.get(`/replenishment/${encodeURIComponent(stationId)}/optimal-stock`);

// ============================================
// RECOMMENDATION ENDPOINTS
// ============================================

// Get all recommendations (network + critical stations)
export const getAllRecommendations = () => api.get('/recommendations/all');

// Get city-level recommendations
export const getCityRecommendations = () => api.get('/recommendations/city');

// Get recommendations for a specific station
export const getStationRecommendations = (stationId) =>
    api.get(`/recommendations/${encodeURIComponent(stationId)}`);

// ============================================
// CITY CONFIGURATION ENDPOINTS
// ============================================

// Get city configuration
export const getCityConfig = () => api.get('/city-config');

// Get zones
export const getZones = () => api.get('/city-config/zones');

export default api;