import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoginAttempt {
  identifier: string;
  attempts: number;
  lastAttemptTime: number;
  lockoutUntil?: number;
  isDeactivated: boolean;
}

interface LoginAttemptsState {
  attempts: Record<string, LoginAttempt>;
  
  recordFailedAttempt: (identifier: string) => {
    attempts: number;
    lockoutSeconds: number | null;
    isDeactivated: boolean;
  };
  
  recordSuccessAttempt: (identifier: string) => void;
  
  getAttemptInfo: (identifier: string) => {
    attempts: number;
    lockoutSeconds: number | null;
    isDeactivated: boolean;
  };
  
  resetAttempts: (identifier: string) => void;
}

export const useLoginAttemptsStore = create<LoginAttemptsState>()(
  persist(
    (set, get) => ({
      attempts: {},

      recordFailedAttempt: (identifier) => {
        const state = get();
        const current = state.attempts[identifier] || {
          identifier,
          attempts: 0,
          lastAttemptTime: 0,
          isDeactivated: false,
        };

        const newAttempts = current.attempts + 1;
        let lockoutSeconds: number | null = null;
        let isDeactivated = false;

        // 5 attempts => 15 seconds
        if (newAttempts === 5) {
          lockoutSeconds = 15;
        }
        // 10 attempts (5 more) => 25 seconds
        else if (newAttempts === 10) {
          lockoutSeconds = 25;
        }
        // 13 attempts (3 more) => 30 seconds
        else if (newAttempts === 13) {
          lockoutSeconds = 30;
        }
        // 14 attempts (1 more) => deactivate
        else if (newAttempts === 14) {
          isDeactivated = true;
        }

        const lockoutUntil = lockoutSeconds
          ? Date.now() + lockoutSeconds * 1000
          : undefined;

        set({
          attempts: {
            ...state.attempts,
            [identifier]: {
              ...current,
              attempts: newAttempts,
              lastAttemptTime: Date.now(),
              lockoutUntil,
              isDeactivated,
            },
          },
        });

        return {
          attempts: newAttempts,
          lockoutSeconds,
          isDeactivated,
        };
      },

      recordSuccessAttempt: (identifier) => {
        const state = get();
        if (state.attempts[identifier]) {
          set({
            attempts: {
              ...state.attempts,
              [identifier]: {
                ...state.attempts[identifier],
                attempts: 0,
                lastAttemptTime: Date.now(),
                lockoutUntil: undefined,
              },
            },
          });
        }
      },

      getAttemptInfo: (identifier) => {
        const state = get();
        const current = state.attempts[identifier];
        
        if (!current) {
          return { attempts: 0, lockoutSeconds: null, isDeactivated: false };
        }

        const now = Date.now();
        let lockoutSeconds: number | null = null;

        if (current.lockoutUntil && current.lockoutUntil > now) {
          lockoutSeconds = Math.ceil((current.lockoutUntil - now) / 1000);
        } else if (current.lockoutUntil && current.lockoutUntil <= now) {
          // Lockout expired, reset it
          set({
            attempts: {
              ...state.attempts,
              [identifier]: {
                ...current,
                lockoutUntil: undefined,
              },
            },
          });
        }

        return {
          attempts: current.attempts,
          lockoutSeconds,
          isDeactivated: current.isDeactivated || false,
        };
      },

      resetAttempts: (identifier) => {
        const state = get();
        const newAttempts = { ...state.attempts };
        delete newAttempts[identifier];
        set({ attempts: newAttempts });
      },
    }),
    {
      name: 'login-attempts-storage',
    }
  )
);

