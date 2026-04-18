/**
 * Phase 2 integration entry: re-export the shared Axios instance (`baseURL` → `/api/v1`).
 * @see `@/lib/http/client`
 */
export { apiClient, API_BASE_URL, axiosInstance, getApiErrorMessage } from '@/lib/http/client';
