import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.60.114.8:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized, logout the user
      const logout = useAuthStore.getState().logout;
      if (logout) {
        await logout();
      }
    }
    return Promise.reject(error);
  }
);

// All agent and auth API tasks
export const agentApi = {
  // Auth Tasks
  sendOtp: (phone: string) => api.post('/v1/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post('/v1/auth/verify-otp', { phone, otp }),
  
  // Profile & Duty Tasks
  getProfile: () => api.get('/v1/agents/profile'),
  updateStatus: (isOnline: boolean) => api.patch('/v1/agents/status', { isOnline }),
  
  // Delivery & Pickup Tasks
  getAssignments: (limit: number = 50) => api.get(`/v1/agents/assignments?limit=${limit}`),
  updateAssignmentStatus: (id: string, status: string) => api.patch(`/v1/agents/assignments/${id}/status`, { status }),
};

export default api;
