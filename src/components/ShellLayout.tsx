import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHome } from '../lib/format';

export function ShellLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const homePath = getRoleHome(user.role);

  function handleLogout() {
    logout();
    navigate('/auth', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-kicker">CS2031 / Week 14</p>
          <h1>Ride Control</h1>
          <p>
            Gestiona sesiones, viajes y calificaciones desde una sola interfaz conectada al
            backend del laboratorio.
          </p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to={homePath}>Dashboard</NavLink>
          <NavLink to="/history">Historial</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="profile-label">Sesion activa</p>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <span>{user.email}</span>
          <span className="role-pill">{user.role}</span>
          <button className="secondary-button" onClick={handleLogout} type="button">
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
