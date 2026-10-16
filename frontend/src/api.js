const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  // Auth API
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Products API
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/products?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    create: async (productData) => {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      return handleResponse(res);
    },
    update: async (id, productData) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getCategories: async () => {
      const res = await fetch(`${API_BASE_URL}/products/categories`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Inventory API
  inventory: {
    getOverview: async () => {
      const res = await fetch(`${API_BASE_URL}/inventory/overview`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    adjustStock: async (adjustmentData) => {
      const res = await fetch(`${API_BASE_URL}/inventory/adjust`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adjustmentData)
      });
      return handleResponse(res);
    },
    getMovements: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/inventory/movements?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getAlerts: async () => {
      const res = await fetch(`${API_BASE_URL}/inventory/alerts`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Orders API
  orders: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/orders?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    create: async (orderData) => {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      return handleResponse(res);
    },
    updateStatus: async (id, statusData) => {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData)
      });
      return handleResponse(res);
    }
  },

  // Statistics API
  stats: {
    getDashboard: async () => {
      const res = await fetch(`${API_BASE_URL}/stats/dashboard`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};
