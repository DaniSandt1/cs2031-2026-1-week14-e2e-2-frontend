import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHome } from '../lib/format';
import type { Role } from '../types';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { loading, token, user } = useAuth();

  if (loading) {
    return <LoadingScreen message="Cargando sesion..." />;
  }

  if (!token || !user) {
    return <Navigate replace to="/auth" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate replace to={getRoleHome(user.role)} />;
  }

  return <Outlet />;
}
