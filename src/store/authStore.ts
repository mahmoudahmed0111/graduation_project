import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser, IStudent, LoginStepOneCredentials, LoginStepTwoCredentials } from '@/types';
import { authApi } from '@/lib/api';

const PENDING_LOGIN_EMAIL_KEY = 'pendingLoginEmail';

interface AuthState {
  user: (IUser | IStudent) | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** Step 1: submit email + nationalID + password → 2FA sent (no token yet) */
  loginStepOne: (credentials: LoginStepOneCredentials) => Promise<void>;
  /** Step 2: submit email + OTP → sets user & token */
  loginStepTwo: (credentials: LoginStepTwoCredentials) => Promise<void>;
  logout: () => void;
  /** Clear user/token state only (no API call). Use when refresh fails to avoid 401/429 on logout. */
  clearSession: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: IUser | IStudent) => void;
  setAccessToken: (token: string) => void;
  setAuthenticated: (authenticated: boolean) => void;
  getPendingLoginEmail: () => string | null;
  clearPendingLoginEmail: () => void;
}

// In-memory token storage (not persisted)
let inMemoryToken: string | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      loginStepOne: async (credentials: LoginStepOneCredentials) => {
        await authApi.loginStepOne(credentials);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(PENDING_LOGIN_EMAIL_KEY, credentials.email);
        }
      },

      loginStepTwo: async (credentials: LoginStepTwoCredentials) => {
        const response = await authApi.loginStepTwo(credentials);
        inMemoryToken = response.accessToken;
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
        });
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(PENDING_LOGIN_EMAIL_KEY);
        }
      },

      logout: () => {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(PENDING_LOGIN_EMAIL_KEY);
        }
        inMemoryToken = null;
        authApi.logout().catch(() => {}); // best-effort; do not throw if already unauthenticated
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      clearSession: () => {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(PENDING_LOGIN_EMAIL_KEY);
        }
        inMemoryToken = null;
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          inMemoryToken = response.accessToken;
          set({
            accessToken: response.accessToken,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      setUser: (user: IUser | IStudent) => {
        set({ user });
      },

      setAccessToken: (token: string) => {
        inMemoryToken = token;
        set({ accessToken: token });
      },

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
      },

      getPendingLoginEmail: () => {
        if (typeof sessionStorage === 'undefined') return null;
        return sessionStorage.getItem(PENDING_LOGIN_EMAIL_KEY);
      },

      clearPendingLoginEmail: () => {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(PENDING_LOGIN_EMAIL_KEY);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Note: accessToken is NOT persisted - it's stored in memory only
      }),
    }
  )
);

// Get token from memory (for API calls)
export function getAccessToken(): string | null {
  return inMemoryToken;
}

