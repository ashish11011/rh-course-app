import axios, { InternalAxiosRequestConfig } from 'axios';
import { logout, setCredentials } from '@/store/authSlice';
import { API_BASE_URL } from '@/const/config';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const AUTH_REFRESH_TIMEOUT_MS = 10000;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  success: boolean;
  tokens?: {
    IdToken?: string;
    RefreshToken?: string;
  };
  username?: string;
};

let refreshTokenPromise: Promise<string | null> | null = null;

function getJwtPayload(token?: string | null): Record<string, unknown> | null {
  if (!token) return null;

  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );

    return JSON.parse(globalThis.atob(paddedPayload));
  } catch {
    return null;
  }
}

function getUsernameFromToken(token?: string | null) {
  const payload = getJwtPayload(token);
  const username = payload?.['cognito:username'] || payload?.email;

  return typeof username === 'string' && username.trim() ? username.trim() : null;
}

function shouldSkipTokenRefresh(url?: string) {
  if (!url) return false;

  return [
    '/api/auth/mobile/login',
    '/api/auth/mobile/signup',
    '/api/auth/mobile/confirm',
    '/api/auth/mobile/forgot-password',
    '/api/auth/mobile/reset-password',
    '/api/auth/mobile/resend-code',
    '/api/auth/mobile/refresh',
  ].some((path) => url.includes(path));
}

async function clearAuthStorage() {
  if (Platform.OS === 'web') return;

  await SecureStore.deleteItemAsync('userToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('authUsername');
}

async function getStoredAuthUsername(currentToken?: string | null) {
  if (Platform.OS === 'web') return null;

  const storedUsername = await SecureStore.getItemAsync('authUsername');
  if (storedUsername) return storedUsername;

  const storedToken = currentToken || (await SecureStore.getItemAsync('userToken'));
  const tokenUsername = getUsernameFromToken(storedToken);

  if (tokenUsername) {
    await SecureStore.setItemAsync('authUsername', tokenUsername);
  }

  return tokenUsername;
}

async function refreshAccessToken() {
  if (Platform.OS === 'web') return null;

  const { store } = require('@/store');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  const currentToken = store.getState().auth.token || (await SecureStore.getItemAsync('userToken'));
  const username = await getStoredAuthUsername(currentToken);

  if (!refreshToken || !username) {
    return null;
  }

  try {
    const response = await axios.post<RefreshResponse>(
      `${API_BASE_URL}/api/auth/mobile/refresh`,
      {
        refreshToken,
        username,
      },
      { timeout: AUTH_REFRESH_TIMEOUT_MS }
    );

    const newToken = response.data.tokens?.IdToken;
    if (!response.data.success || !newToken) {
      return null;
    }

    await SecureStore.setItemAsync('userToken', newToken);
    await SecureStore.setItemAsync('authUsername', response.data.username || username);

    const newRefreshToken = response.data.tokens?.RefreshToken;
    if (newRefreshToken) {
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);
    }

    store.dispatch(setCredentials({ token: newToken }));

    return newToken;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to refresh auth token', error);
    }
    return null;
  }
}

async function refreshAccessTokenOnce() {
  if (!refreshTokenPromise) {
    refreshTokenPromise = refreshAccessToken().finally(() => {
      refreshTokenPromise = null;
    });
  }

  return refreshTokenPromise;
}

api.interceptors.request.use(
  (config) => {
    const { store } = require('@/store');
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
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipTokenRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessTokenOnce();
      if (newToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        } as RetriableRequestConfig['headers'];

        return api(originalRequest);
      }
    }

    if (error.response && error.response.status === 401) {
      const { store } = require('@/store');
      await clearAuthStorage();
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export default api;
