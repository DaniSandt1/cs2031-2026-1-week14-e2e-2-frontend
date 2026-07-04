import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { InlineMessage } from '../components/InlineMessage';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useTripPolling } from '../hooks/useTripPolling';
import { completeTrip, getTripById } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { formatDateTime } from '../lib/format';
import type { Trip } from '../types';

export function DriverTripDetailPage() {
  const { tripId } = useParams();
  const { refreshUser } = useAuth();
  const parsedTripId = Number(tripId);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadTrip() {
    if (Number.isNaN(parsedTripId)) {
      setErrorMessage('El identificador del viaje es invalido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const nextTrip = await getTripById(parsedTripId);
      setTrip(nextTrip);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTrip();
  }, [parsedTripId]);

  useTripPolling({
    tripId: trip?.id ?? null,
    enabled: trip?.status === 'IN_PROGRESS',
    onTrip: setTrip
  });

  async function handleCompleteTrip() {
    if (!trip) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedTrip = await completeTrip(trip.id);
      setTrip(updatedTrip);
      await refreshUser();
      setSuccessMessage('Viaje completado correctamente. El conductor ya volvio a estar disponible.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="muted-copy">Cargando detalle del viaje...</p>;
  }

  if (!trip) {
    return (
      <EmptyState
        description={errorMessage || 'No fue posible cargar el viaje solicitado.'}
        title="Viaje no disponible"
      />
    );
  }

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <Link className="text-link" to="/driver">
            &lt;- Volver al dashboard
          </Link>
          <h1>Detalle del viaje #{trip.id}</h1>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {errorMessage ? <InlineMessage message={errorMessage} tone="error" /> : null}
      {successMessage ? <InlineMessage message={successMessage} tone="success" /> : null}

      <div className="content-grid">
        <SectionCard eyebrow="Ruta" subtitle="Vista del conductor" title="Informacion del trayecto">
          <dl className="detail-grid">
            <div>
              <dt>Origen</dt>
              <dd>{trip.pickupAddress}</dd>
            </div>
            <div>
              <dt>Destino</dt>
              <dd>{trip.dropoffAddress}</dd>
            </div>
            <div>
              <dt>Solicitado</dt>
              <dd>{formatDateTime(trip.requestedAt)}</dd>
            </div>
            <div>
              <dt>Aceptado</dt>
              <dd>{formatDateTime(trip.acceptedAt)}</dd>
            </div>
            <div>
              <dt>Completado</dt>
              <dd>{formatDateTime(trip.completedAt)}</dd>
            </div>
          </dl>

          {trip.status === 'IN_PROGRESS' ? (
            <button className="primary-button" disabled={submitting} onClick={handleCompleteTrip} type="button">
              {submitting ? 'Completando viaje...' : 'Completar viaje'}
            </button>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Pasajero"
          subtitle="Datos obtenidos desde GET /trips/{id}."
          title="Quien viaja contigo"
        >
          <div className="person-card">
            <h3>
              {trip.passenger.firstName} {trip.passenger.lastName}
            </h3>
            <p>{trip.passenger.email}</p>
            <span>Rol: {trip.passenger.role}</span>
          </div>
        </SectionCard>
      </div>

      {trip.status === 'COMPLETED' ? (
        <SectionCard
          eyebrow="Resumen final"
          subtitle="Confirmacion visible una vez ejecutado PATCH /trips/{id}/complete."
          title="Viaje cerrado"
        >
          <div className="rating-summary">
            <strong>Estado final: COMPLETED</strong>
            <p>
              {trip.passengerRating !== null
                ? `El pasajero califico el viaje con ${trip.passengerRating} estrellas.`
                : 'El pasajero aun no ha dejado una calificacion.'}
            </p>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
