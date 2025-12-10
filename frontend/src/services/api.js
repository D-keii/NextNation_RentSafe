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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Properties API
export const propertiesAPI = {
  // Get all properties for a landlord
  getLandlordProperties: async (landlordIc) => {
    return apiRequest(`/properties?landlordIc=${landlordIc}`);
  },

  // Get a single property
  getProperty: async (propertyId) => {
    return apiRequest(`/properties/${propertyId}`);
  },

  // Delete a property
  deleteProperty: async (propertyId) => {
    return apiRequest(`/properties/${propertyId}`, { method: 'DELETE' });
  },
};

// Applications API
export const applicationsAPI = {
  // Get all applications for a landlord
  getLandlordApplications: async (landlordIc) => {
    return apiRequest(`/applications?landlordIc=${landlordIc}`);
  },

  // Get pending applications
  getPendingApplications: async (landlordIc) => {
    return apiRequest(`/applications?landlordIc=${landlordIc}&status=pending`);
  },

  // Get a single application
  getApplication: async (applicationId) => {
    return apiRequest(`/applications/${applicationId}`);
  },
};

// Contracts API
export const contractsAPI = {
  // Get all contracts for a landlord
  getLandlordContracts: async (landlordIc) => {
    return apiRequest(`/contracts?landlordIc=${landlordIc}`);
  },

  // Get active contracts
  getActiveContracts: async (landlordIc) => {
    return apiRequest(`/contracts?landlordIc=${landlordIc}&status=active`);
  },

  // Get pending contracts
  getPendingContracts: async (landlordIc) => {
    return apiRequest(`/contracts?landlordIc=${landlordIc}&status=pending`);
  },

  // Get a single contract
  getContract: async (contractId) => {
    return apiRequest(`/contracts/${contractId}`);
  },
};

// Escrow API
export const escrowAPI = {
  // Get all escrows for a landlord
  getLandlordEscrows: async (landlordIc) => {
    return apiRequest(`/escrows?landlordIc=${landlordIc}`);
  },

  // Get secured escrows
  getSecuredEscrows: async (landlordIc) => {
    return apiRequest(`/escrows?landlordIc=${landlordIc}&status=secured`);
  },
};

// Export helper functions
export { getUserInfo, getAuthToken };

