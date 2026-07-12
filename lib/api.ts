import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/authSlice';

// Replace with your actual backend URL when ready
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

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
