import { useDeferredValue, useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { InlineMessage } from '../components/InlineMessage';
import { SectionCard } from '../components/SectionCard';
import { TripCard } from '../components/TripCard';
import { useAuth } from '../context/AuthContext';
import { getDriverTrips, getPassengerTrips } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { sortTripsByRequestedAt } from '../lib/format';
import type { Trip, TripStatus } from '../types';

type FilterValue = 'ALL' | TripStatus;

export function HistoryPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const deferredFilter = useDeferredValue(filter);

  useEffect(() => {
    async function loadHistory() {
      if (!user) {
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const nextTrips =
          user.role === 'PASSENGER' ? await getPassengerTrips() : await getDriverTrips();
        setTrips(sortTripsByRequestedAt(nextTrips));
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, [user]);

  if (!user) {
    return null;
  }

  const filteredTrips =
    deferredFilter === 'ALL'
      ? trips
      : trips.filter((trip) => trip.status === deferredFilter);

  return (
    <div className="page-stack">
      <header className="page-hero">
        <div>
          <p className="section-eyebrow">Historial global</p>
          <h1>Filtra tus viajes por estado y revisa el detalle cuando lo necesites.</h1>
        </div>
        <div className="hero-badge-card">
          <span>Total visible</span>
          <strong>{filteredTrips.length}</strong>
        </div>
      </header>

      {errorMessage ? <InlineMessage message={errorMessage} tone="error" /> : null}

      <SectionCard
        eyebrow="Filtro"
        subtitle="Se alimenta desde GET /trips o GET /trips/my segun tu rol."
        title="Explorar viajes"
      >
        <label className="filter-label">
          Estado
          <select onChange={(event) => setFilter(event.target.value as FilterValue)} value={filter}>
            <option value="ALL">Todos</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </label>

        {loading ? (
          <p className="muted-copy">Cargando historial...</p>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            description="Cambia el filtro o genera nuevas acciones desde tu dashboard."
            title="No hay viajes para este estado"
          />
        ) : (
          <div className="list-stack">
            {filteredTrips.map((trip) => (
              <TripCard
                href={`/${user.role === 'PASSENGER' ? 'passenger' : 'driver'}/trips/${trip.id}`}
                key={trip.id}
                role={user.role}
                trip={trip}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
