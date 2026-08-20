import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// --- AUTH SERVICE ---
export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// --- BILLER SERVICE ---
export const billerService = {
  getAll: async () => {
    return await api.get('/billers');
  },

  getById: async (id) => {
    return await api.get(`/billers/${id}`);
  },

  create: async (billerData) => {
    return await api.post('/billers', billerData);
  },

  update: async (id, billerData) => {
    return await api.put(`/billers/${id}`, billerData);
  },

  delete: async (id) => {
    return await api.delete(`/billers/${id}`);
  },
};


// --- PAYMENT CHANNEL SERVICE ---
export const paymentChannelService = {
  getAll: async () => {
    return await api.get('/payment-channels');
  },
  getById: async (id) => {
    return await api.get(`/payment-channels/${id}`);
  },
  create: async (channelData) => {
    return await api.post('/payment-channels', channelData);
  },
  update: async (id, channelData) => {
    return await api.put(`/payment-channels/${id}`, channelData);
  },
  delete: async (id) => {
    return await api.delete(`/payment-channels/${id}`);
  }
};

// --- TRANSACTION SERVICE ---
export const transactionService = {
  getAll: async (params = {}) => {
    return await api.get('/transactions', { params });
  },
  getById: async (id) => {
    return await api.get(`/transactions/${id}`);
  },
};

// --- WHITELIST IP SERVICE ---
export const whitelistService = {
  getAll: async (params = {}) => {
    const response = await api.get('/whitelist', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/whitelist/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/whitelist', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/whitelist/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/whitelist/${id}`);
    return response.data;
  },
};

// --- Callback Logs Service ---
export const callbackLogService = {
  getBillerLogs: async (params = {}) => {
    const response = await api.get('/callback-logs/biller', { params });
    return response.data;
  },
  getClientLogs: async (params = {}) => {
    const response = await api.get('/callback-logs/client', { params });
    return response.data;
  },
};

// --- Digital Balance Service ---
export const balanceService = {
  getDigitalBalance: async (params = {}) => {
    const response = await api.get('/digital-balance', { params });
    return response.data;
  },
  getDigitalBalanceById: async (id) => {
    const response = await api.get(`/digital-balance/${id}`);
    return response.data;
  },
  getDigitalBalanceMitra: async (params = {}) => {
    const response = await api.get('/digital-balance-mitra', { params });
    return response.data;
  },
  getDigitalBalanceMitraById: async (id) => {
    const response = await api.get(`/digital-balance-mitra/${id}`);
    return response.data;
  },
};


export default api;