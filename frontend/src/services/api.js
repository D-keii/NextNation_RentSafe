// API service for backend calls
const API_BASE_URL = 'http://localhost:8889/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || null;
};

// Helper function to get user info from localStorage
const getUserInfo = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) return null;
  return response.json();
};

// Landlord composite dashboard
export const landlordAPI = {
  getDashboard: async (landlordIc) => apiRequest(`/users/${landlordIc}/landlord-dashboard`),
  getTenantHistory: async (landlordIc) => apiRequest(`/landlord/${landlordIc}/tenant-history`),
};

export const tenantAPI = {
  getRentalHistory: async (tenantIc) => apiRequest(`/users/${tenantIc}/rental-history`),
};

// Properties API
export const propertiesAPI = {
  getAll: async () => apiRequest('/properties/all'),
  getProperty: async (propertyId) => apiRequest(`/properties/${propertyId}`),
  createProperty: async (payload) =>
    apiRequest('/properties/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProperty: async (propertyId, payload) =>
    apiRequest(`/properties/${propertyId}/update`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProperty: async (propertyId) =>
    apiRequest(`/properties/${propertyId}/delete`, {
      method: 'DELETE',
    }),
};

// Applications API
export const applicationsAPI = {
  getPropertyApplications: async (propertyId) => apiRequest(`/properties/${propertyId}/applications`),
  getApplication: async (applicationId) => apiRequest(`/applications/${applicationId}`),
  approve: async (applicationId) =>
    apiRequest(`/applications/${applicationId}/approve`, {
      method: 'POST',
    }),
  reject: async (applicationId) =>
    apiRequest(`/applications/${applicationId}/reject`, {
      method: 'POST',
    }),
};

// Contracts API
export const contractsAPI = {
  getContract: async (contractId) => apiRequest(`/contracts/${contractId}`),
  uploadPhotos: async (contractId) =>
    apiRequest(`/contracts/${contractId}/upload-photos`, {
      method: 'POST',
    }),
  signAsLandlord: async (contractId) =>
    apiRequest(`/contracts/${contractId}/landlord/sign`, {
      method: 'POST',
    }),
};

// Escrow API
export const escrowAPI = {
  getByContract: async (contractId) => apiRequest(`/escrow/${contractId}`),
  approveRelease: async (escrowId) =>
    apiRequest(`/escrow/${escrowId}/approve-release`, {
      method: 'POST',
    }),
  rejectRelease: async (escrowId) =>
    apiRequest(`/escrow/${escrowId}/reject-release`, {
      method: 'POST',
    }),
  requestRelease: async (escrowId) =>
    apiRequest(`/escrow/${escrowId}/request-release`, {
      method: 'POST',
    }),
};

// Export helper functions
export { getUserInfo, getAuthToken };

