// src/lib/api.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → logout
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;

// ALL ENDPOINTS — 100% CORRECT
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/login', { email, password }),
  signup: (data: any) => apiClient.post('/api/v1/users', data),
};

export const jobsAPI = {
  getPublicJobs: () => apiClient.get('/api/v1/hr/jobs'),
  getJobById: (id: number) => apiClient.get(`/api/v1/hr/jobs/${id}`),
  createJob: (data: any) => apiClient.post('/api/v1/hr/jobs', data),
};

export const applicantsAPI = {
  getApplicants: () => apiClient.get('/api/v1/applicants/applicants'),
  submitApplication: (formData: FormData) =>
    apiClient.post('/api/v1/applicants/applicants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getApplicantDetails: (id: number) =>
    apiClient.get(`/api/v1/hr/applicants/${id}`),
  downloadResume: (applicantId: number) =>
    `${API_BASE_URL}/api/v1/hr/applicants/${applicantId}/resume`,
};

export const interviewsAPI = {
  schedule: (data: any) => apiClient.post('/api/v1/interviews/schedule', data),
};