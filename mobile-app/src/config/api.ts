// API Configuration
export const API_BASE_URL =
  process.env.API_BASE_URL || 'http://localhost:3000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',

  // Workers
  WORKERS: '/workers',
  WORKER: (id: string) => `/workers/${id}`,

  // Jobs
  JOBS: '/jobs',
  JOB: (id: string) => `/jobs/${id}`,
  JOB_DOSE_SUMMARY: (id: string) => `/jobs/${id}/dose-summary`,

  // Dose Entries
  DOSE_ENTRIES: '/dose',
  DOSE_ENTRY: (id: string) => `/dose/${id}`,

  // Alerts
  ALERTS: '/alerts',
  ALERT: (id: string) => `/alerts/${id}`,
  ALERT_RESOLVE: (id: string) => `/alerts/${id}/resolve`,

  // Training
  TRAINING_RECORDS: '/training',
  TRAINING_RECORD: (id: string) => `/training/${id}`,

  // Reports
  REPORTS: '/reports',
  REPORT_DOWNLOAD: (id: string) => `/reports/${id}/download`,
} as const;

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
} as const;

// API instance for making requests
export const api = {
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  endpoints: API_ENDPOINTS,
  retryConfig: RETRY_CONFIG,

  // HTTP methods
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
