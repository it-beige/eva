import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import authApi from '../services/authApi';
import PageLoading from '../components/feedback/PageLoading';
import {
  getAccessToken,
  getCurrentUser,
  persistCurrentUser,
  persistSession,
  clearSession,
} from './session';

type AuthGuardProps = {
  children: ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const token = getAccessToken();
  const currentUser = getCurrentUser();

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      // In local development, bootstrap the demo account so we can inspect
      // the platform pages without being blocked by auth plumbing.
      if (!token && import.meta.env.DEV) {
        try {
          const result = await authApi.login({
            employeeId: 'admin001',
            password: 'admin123',
          });
          if (!cancelled) {
            persistSession(result.accessToken, result.user);
          }
        } catch {
          clearSession();
        } finally {
          if (!cancelled) {
            setIsChecking(false);
          }
        }
        return;
      }

      if (!token) {
        if (!cancelled) {
          setIsChecking(false);
        }
        return;
      }

      if (currentUser) {
        if (!cancelled) {
          setIsChecking(false);
        }
        return;
      }

      try {
        const user = await authApi.me();
        if (!cancelled) {
          persistCurrentUser(user);
        }
      } catch {
        clearSession();
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [currentUser, token]);

  if (isChecking) {
    return <PageLoading />;
  }

  if (!getAccessToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
