import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { InlineMessage } from '../components/InlineMessage';
import { SectionCard } from '../components/SectionCard';
import { TripCard } from '../components/TripCard';
import { useAuth } from '../context/AuthContext';
import { createTrip, getAvailableDrivers, getPassengerTrips } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { sortTripsByRequestedAt } from '../lib/format';
import type { Trip, User } from '../types';

export function PassengerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingDrivers, setRefreshingDrivers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    pickupAddress: '',
    dropoffAddress: ''
  });

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage('');

    try {
      const [myTrips, availableDrivers] = await Promise.all([
        getPassengerTrips(),
        getAvailableDrivers()
      ]);

      setTrips(sortTripsByRequestedAt(myTrips));
      setDrivers(availableDrivers);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function refreshDrivers() {
    setRefreshingDrivers(true);
    setErrorMessage('');

    try {
      const availableDrivers = await getAvailableDrivers();
      setDrivers(availableDrivers);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setRefreshingDrivers(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const trip = await createTrip(form);
      navigate(`/passenger/trips/${trip.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page-stack">
      <header className="page-hero">
        <div>
          <p className="section-eyebrow">Vista pasajero</p>
          <h1>Hola, {user.firstName}. Pide un viaje y sigue su avance en tiempo real.</h1>
        </div>
        <div className="hero-badge-card">
          <span>Viajes registrados</span>
          <strong>{trips.length}</strong>
        </div>
      </header>

      {errorMessage ? <InlineMessage message={errorMessage} tone="error" /> : null}

      <div className="content-grid">
        <SectionCard
          eyebrow="Nuevo viaje"
          subtitle="Antes de confirmar puedes revisar que conductores estan disponibles."
          title="Solicitar viaje"
        >
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Origen
              <input
                onChange={(event) =>
                  setForm((current) => ({ ...current, pickupAddress: event.target.value }))
                }
                placeholder="Av. Javier Prado 100"
                required
                type="text"
                value={form.pickupAddress}
              />
            </label>
            <label>
              Destino
              <input
                onChange={(event) =>
                  setForm((current) => ({ ...current, dropoffAddress: event.target.value }))
                }
                placeholder="Miraflores, Lima"
                required
                type="text"
                value={form.dropoffAddress}
              />
            </label>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Creando viaje...' : 'Confirmar solicitud'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          action={
            <button className="secondary-button" onClick={refreshDrivers} type="button">
              {refreshingDrivers ? 'Actualizando...' : 'Refrescar'}
            </button>
          }
          eyebrow="Conductores"
          subtitle="La lista se obtiene desde GET /drivers/available."
          title={`Disponibles ahora (${drivers.length})`}
        >
          {drivers.length === 0 ? (
            <EmptyState
              description="No hay conductores libres en este momento, pero aun puedes crear un viaje PENDING."
              title="Sin conductores disponibles"
            />
          ) : (
            <div className="list-stack">
              {drivers.map((driver) => (
                <article className="driver-tile" key={driver.id}>
                  <div>
                    <h3>
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p>{driver.email}</p>
                  </div>
                  <strong>{driver.rating.toFixed(1)} / 5</strong>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Mis viajes"
        subtitle="Lista conectada a GET /trips con badges de estado."
        title="Historial del pasajero"
      >
        {loading ? (
          <p className="muted-copy">Cargando viajes...</p>
        ) : trips.length === 0 ? (
          <EmptyState
            description="Cuando crees tu primer viaje aparecera aqui con su estado actual."
            title="Todavia no tienes viajes"
          />
        ) : (
          <div className="list-stack">
            {trips.map((trip) => (
              <TripCard
                href={`/passenger/trips/${trip.id}`}
                key={trip.id}
                role="PASSENGER"
                trip={trip}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
