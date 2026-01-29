import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser, IStudent, LoginCredentials } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: (IUser | IStudent) | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: IUser | IStudent) => void;
  setAccessToken: (token: string) => void;
  setAuthenticated: (authenticated: boolean) => void;
}

// In-memory token storage (not persisted)
let inMemoryToken: string | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        const response = await authApi.login(credentials);
        inMemoryToken = response.accessToken;
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        inMemoryToken = null;
        authApi.logout();
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

