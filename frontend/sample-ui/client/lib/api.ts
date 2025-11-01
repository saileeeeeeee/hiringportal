import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/login', { email, password }),
  signup: (data: any) => apiClient.post('/api/v1/users', data),
};

export const jobsAPI = {
  getPublicJobs: () => apiClient.get('/api/v1/hr/jobs'),
  getJobById: (id: number) => apiClient.get(`/api/v1/hr/jobs/${id}`),
  createJob: (data: any) => apiClient.post('/api/v1/hr/jobs', data),
  updateJob: (id: number, data: any) => apiClient.put(`/api/v1/hr/jobs/${id}`, data),
  deleteJob: (id: number) => apiClient.delete(`/api/v1/hr/jobs/${id}`),
};

export const applicantsAPI = {
  getApplicants: (params?: any) => apiClient.get('/api/v1/applicants', { params }),
  submitApplication: (data: FormData) =>
    apiClient.post('/api/v1/applicants', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getApplicantDetails: (id: number) => apiClient.get(`/api/v1/applicants/${id}`),
  updateApplicantStatus: (id: number, data: any) =>
    apiClient.put(`/api/v1/applicants/${id}`, data),
};

export const interviewsAPI = {
  scheduleInterview: (data: any) => apiClient.post('/api/v1/interviews/schedule', data),
  getSchedules: (params?: any) => apiClient.get('/api/v1/interviews/schedules', { params }),
  updateSchedule: (id: number, data: any) =>
    apiClient.put(`/api/v1/interviews/schedules/${id}`, data),
  deleteSchedule: (id: number) => apiClient.delete(`/api/v1/interviews/schedules/${id}`),
};

export const usersAPI = {
  getUsers: (params?: any) => apiClient.get('/api/v1/users', { params }),
  getUserById: (id: number) => apiClient.get(`/api/v1/users/${id}`),
};
