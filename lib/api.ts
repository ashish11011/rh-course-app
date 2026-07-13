import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/authSlice';
import { Platform } from 'react-native';

// Replace with your actual backend URL when ready
let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

if (Platform.OS === 'android' && API_BASE_URL.includes('localhost')) {
  // Android emulator needs 10.0.2.2 to access host's localhost
  API_BASE_URL = API_BASE_URL.replace('localhost', '192.168.1.2');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
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
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from api
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
