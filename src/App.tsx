import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute } from './components/GuestRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ShellLayout } from './components/ShellLayout';
import { useAuth } from './context/AuthContext';
import { getRoleHome } from './lib/format';
import { AuthPage } from './pages/AuthPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { DriverTripDetailPage } from './pages/DriverTripDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { PassengerDashboardPage } from './pages/PassengerDashboardPage';
import { PassengerTripDetailPage } from './pages/PassengerTripDetailPage';

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate replace to="/auth" />;
  }

  return <Navigate replace to={getRoleHome(user.role)} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
          path="/auth"
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<ShellLayout />}>
            <Route element={<HomeRedirect />} path="/" />
            <Route element={<HistoryPage />} path="/history" />

            <Route element={<ProtectedRoute roles={['PASSENGER']} />}>
              <Route element={<PassengerDashboardPage />} path="/passenger" />
              <Route element={<PassengerTripDetailPage />} path="/passenger/trips/:tripId" />
            </Route>

            <Route element={<ProtectedRoute roles={['DRIVER']} />}>
              <Route element={<DriverDashboardPage />} path="/driver" />
              <Route element={<DriverTripDetailPage />} path="/driver/trips/:tripId" />
            </Route>
          </Route>
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
