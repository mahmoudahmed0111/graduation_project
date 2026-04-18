import axios, { AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { useToastStore } from '@/store/toastStore';

const AZURE_API_BASE = 'https://smart-university-api-hzbmh3eph8g5aucq.eastus-01.azurewebsites.net';

/** Base path `/api/v1` — dev uses localhost or Vite proxy per env. */
export const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_USE_PRODUCTION_API === 'true'
    ? '/api/v1'
    : 'http://localhost:5000/api/v1'
  : import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_URL || AZURE_API_BASE}/api/v1`;

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Skip global toast + redirect side effects for this request. */
    skipGlobalErrorHandler?: boolean;
    _retry?: boolean;
  }
}

const isAuthRequest = (url: string) =>
  /\/auth\/(login|login\/verify|refresh|logout|forgotPassword|resetPassword|verify-password)/.test(url || '');

function globalErrorToast(status: number, message?: string) {
  const toast = useToastStore.getState();
  switch (status) {
    case 403:
      toast.error(message || 'You do not have permission to perform this action.');
      break;
    case 429:
      toast.error(message || 'Too many attempts. Please try again later.');
      break;
    case 404:
      toast.warning(message || 'Resource not found or not available.');
      break;
    case 500:
    case 502:
    case 503:
      toast.error(message || 'Server error. Please try again later.');
      break;
    default:
      if (status >= 400) {
        toast.error(message || 'Request failed.');
      }
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { getAccessToken } = await import('@/store/authStore');
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url ?? '';

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isAuthRequest(requestUrl)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post<{ accessToken: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().setAccessToken(response.data.accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().clearSession();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          useToastStore.getState().info('Session expired. Please sign in again.');
          window.location.assign('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    const status = error.response?.status as number | undefined;
    const skip = originalRequest?.skipGlobalErrorHandler === true;
    if (!skip && status && !isAuthRequest(requestUrl)) {
      const data = error.response?.data as { message?: string } | undefined;
      const msg = data?.message && typeof data.message === 'string' ? data.message : undefined;
      if (status === 403 || status === 404 || status === 429 || status >= 500) {
        globalErrorToast(status, msg);
      }
    }

    return Promise.reject(error);
  }
);

/** @deprecated Prefer `apiClient` — alias for incremental migration */
export const axiosInstance = apiClient;

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message && typeof data.message === 'string') return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
