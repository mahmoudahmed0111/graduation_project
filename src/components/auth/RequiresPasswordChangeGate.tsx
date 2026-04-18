import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const CHANGE_PASSWORD_PATH = '/dashboard/account/change-password';

export function RequiresPasswordChangeGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const { pathname } = useLocation();

  if (!isAuthenticated || !user?.requiresPasswordChange) {
    return <>{children}</>;
  }

  if (pathname === CHANGE_PASSWORD_PATH) {
    return <>{children}</>;
  }

  return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
}
