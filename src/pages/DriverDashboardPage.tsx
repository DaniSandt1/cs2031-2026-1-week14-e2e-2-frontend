import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { InlineMessage } from '../components/InlineMessage';
import { SectionCard } from '../components/SectionCard';
import { TripCard } from '../components/TripCard';
import { useAuth } from '../context/AuthContext';
import { acceptTrip, completeTrip, getDriverTrips, getPendingTrips } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { sortTripsByRequestedAt } from '../lib/format';
import type { Trip } from '../types';

export function DriverDashboardPage() {
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTripId, setProcessingTripId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const activeTrip = myTrips.find((trip) => trip.status === 'IN_PROGRESS') ?? null;
  const completedTrips = myTrips.filter((trip) => trip.status === 'COMPLETED');

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage('');

    try {
      const [driverTrips, availableTrips] = await Promise.all([
        getDriverTrips(),
        getPendingTrips(),
        refreshUser()
      ]);

      setMyTrips(sortTripsByRequestedAt(driverTrips));
      setPendingTrips(sortTripsByRequestedAt(availableTrips));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleAcceptTrip(tripId: number) {
    setProcessingTripId(tripId);
    setErrorMessage('');

    try {
      const trip = await acceptTrip(tripId);
      await refreshUser();
      navigate(`/driver/trips/${trip.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      await loadDashboard();
    } finally {
      setProcessingTripId(null);
    }
  }

  async function handleCompleteTrip(tripId: number) {
    setProcessingTripId(tripId);
    setErrorMessage('');

    try {
      const trip = await completeTrip(tripId);
      await refreshUser();
      navigate(`/driver/trips/${trip.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      await loadDashboard();
    } finally {
      setProcessingTripId(null);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page-stack">
      <header className="page-hero">
        <div>
          <p className="section-eyebrow">Vista conductor</p>
          <h1>Conduce con contexto: viajes pendientes, trayecto activo e historial real.</h1>
        </div>
        <div className="hero-badge-card">
          <span>Rating actual</span>
          <strong>{user.rating.toFixed(1)} / 5</strong>
          <small>{user.available ? 'Disponible' : 'Ocupado'}</small>
        </div>
      </header>

      {errorMessage ? <InlineMessage message={errorMessage} tone="error" /> : null}

      <SectionCard
        eyebrow="Viaje activo"
        subtitle="Este bloque resalta el viaje en IN_PROGRESS y permite cerrarlo desde el dashboard."
        title="Tu trayecto en curso"
      >
        {loading ? (
          <p className="muted-copy">Cargando estado actual...</p>
        ) : activeTrip ? (
          <TripCard
            action={
              <button
                className="primary-button"
                disabled={processingTripId === activeTrip.id}
                onClick={() => handleCompleteTrip(activeTrip.id)}
                type="button"
              >
                {processingTripId === activeTrip.id ? 'Completando...' : 'Completar viaje'}
              </button>
            }
            href={`/driver/trips/${activeTrip.id}`}
            role="DRIVER"
            trip={activeTrip}
          />
        ) : (
          <EmptyState
            description="Acepta uno de los viajes PENDING para que aparezca aqui como IN_PROGRESS."
            title="No tienes un viaje activo"
          />
        )}
      </SectionCard>

      <div className="content-grid">
        <SectionCard
          eyebrow="Pendientes"
          subtitle="Conectado a GET /trips/pending con accion PATCH /accept."
          title={`Viajes disponibles (${pendingTrips.length})`}
        >
          {loading ? (
            <p className="muted-copy">Cargando viajes pendientes...</p>
          ) : pendingTrips.length === 0 ? (
            <EmptyState
              description="Cuando un pasajero cree un viaje PENDING lo veras en esta lista."
              title="Nada por aceptar"
            />
          ) : (
            <div className="list-stack">
              {pendingTrips.map((trip) => (
                <TripCard
                  action={
                    <button
                      className="primary-button"
                      disabled={Boolean(activeTrip) || processingTripId === trip.id}
                      onClick={() => handleAcceptTrip(trip.id)}
                      type="button"
                    >
                      {processingTripId === trip.id ? 'Aceptando...' : 'Aceptar'}
                    </button>
                  }
                  href={`/driver/trips/${trip.id}`}
                  key={trip.id}
                  role="DRIVER"
                  trip={trip}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Historial"
          subtitle="Muestra los viajes terminados del conductor."
          title={`Completados (${completedTrips.length})`}
        >
          {loading ? (
            <p className="muted-copy">Cargando historial...</p>
          ) : completedTrips.length === 0 ? (
            <EmptyState
              description="Los viajes cerrados apareceran aqui automaticamente."
              title="Sin viajes completados"
            />
          ) : (
            <div className="list-stack">
              {completedTrips.map((trip) => (
                <TripCard
                  href={`/driver/trips/${trip.id}`}
                  key={trip.id}
                  role="DRIVER"
                  trip={trip}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
