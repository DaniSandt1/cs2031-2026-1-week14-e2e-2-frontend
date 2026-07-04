import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHome } from '../lib/format';
import { LoadingScreen } from './LoadingScreen';

export function GuestRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen message="Validando sesion..." />;
  }

  if (user) {
    return <Navigate replace to={getRoleHome(user.role)} />;
  }

  return <>{children}</>;
}
