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
  getAll: async (params = {}) => {
    return await api.get('/billers', { params });
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
  getAll: async (params = {}) => {
    return await api.get('/payment-channels', { params });
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
  },
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
    return await api.get('/whitelist', { params });
  },
  getById: async (id) => {
    return await api.get(`/whitelist/${id}`);
  },
  create: async (data) => {
    return await api.post('/whitelist', data);
  },
  update: async (id, data) => {
    return await api.put(`/whitelist/${id}`, data);
  },
  delete: async (id) => {
    return await api.delete(`/whitelist/${id}`);
  },
};

// --- CALLBACK LOGS SERVICE ---
export const callbackLogService = {
  getBillerLogs: async (params = {}) => {
    return await api.get('/callback-logs/biller', { params });
  },
  getClientLogs: async (params = {}) => {
    return await api.get('/callback-logs/client', { params });
  },
  getLogById: async (id) => {
    return await api.get(`/callback-logs/biller/${id}`);
  },
  getClientLogById: async (id) => {
    return await api.get(`/callback-logs/client/${id}`);
  },
};

// --- DIGITAL BALANCE SERVICE ---
export const balanceService = {
  getDigitalBalance: async (params = {}) => {
    return await api.get('/digital-balance', { params });
  },
  getDigitalBalanceById: async (id) => {
    return await api.get(`/digital-balance/${id}`);
  },
  getDigitalBalanceMitra: async (params = {}) => {
    return await api.get('/digital-balance-mitra', { params });
  },
  getDigitalBalanceMitraById: async (id) => {
    return await api.get(`/digital-balance-mitra/${id}`);
  },
};

export default api;