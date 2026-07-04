import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { InlineMessage } from '../components/InlineMessage';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useTripPolling } from '../hooks/useTripPolling';
import { getTripById, rateTrip } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { formatDateTime } from '../lib/format';
import type { Trip } from '../types';

export function PassengerTripDetailPage() {
  const { tripId } = useParams();
  const parsedTripId = Number(tripId);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [ratingForm, setRatingForm] = useState({
    rating: '5',
    comment: ''
  });

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
    enabled: trip?.status === 'PENDING' || trip?.status === 'IN_PROGRESS',
    onTrip: setTrip
  });

  async function handleRateTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trip) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedTrip = await rateTrip(trip.id, {
        rating: Number(ratingForm.rating),
        comment: ratingForm.comment.trim() || undefined
      });

      setTrip(updatedTrip);
      setSuccessMessage('Gracias. La calificacion se guardo y el rating del conductor se actualizo.');
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
          <Link className="text-link" to="/passenger">
            &lt;- Volver al dashboard
          </Link>
          <h1>Detalle del viaje #{trip.id}</h1>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {errorMessage ? <InlineMessage message={errorMessage} tone="error" /> : null}
      {successMessage ? <InlineMessage message={successMessage} tone="success" /> : null}

      <div className="content-grid">
        <SectionCard
          eyebrow="Ruta"
          subtitle={
            trip.status === 'PENDING' || trip.status === 'IN_PROGRESS'
              ? 'Esta vista se actualiza automaticamente cada 4 segundos.'
              : 'Resumen final del trayecto.'
          }
          title="Estado del viaje"
        >
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
        </SectionCard>

        <SectionCard
          eyebrow="Conductor"
          subtitle={
            trip.driver
              ? 'Informacion del conductor asignado por el backend.'
              : 'Todavia no se ha asignado un conductor.'
          }
          title={trip.driver ? 'Tu conductor' : 'Buscando conductor...'}
        >
          {trip.driver ? (
            <div className="person-card">
              <h3>
                {trip.driver.firstName} {trip.driver.lastName}
              </h3>
              <p>{trip.driver.email}</p>
              <strong>{trip.driver.rating.toFixed(1)} / 5</strong>
            </div>
          ) : (
            <EmptyState
              description="Sigue esta pantalla mientras el viaje este PENDING o IN_PROGRESS para ver cuando se asigne."
              title="Aun no hay conductor"
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Calificacion"
        subtitle="Solo aparece cuando el viaje fue completado y aun no ha sido calificado."
        title="Cierre del viaje"
      >
        {trip.passengerRating !== null ? (
          <div className="rating-summary">
            <strong>{trip.passengerRating} / 5 estrellas</strong>
            <p>{trip.ratingComment || 'Sin comentario adicional.'}</p>
          </div>
        ) : trip.status === 'COMPLETED' ? (
          <form className="stack-form" onSubmit={handleRateTrip}>
            <label>
              Estrellas
              <select
                onChange={(event) =>
                  setRatingForm((current) => ({ ...current, rating: event.target.value }))
                }
                value={ratingForm.rating}
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </label>
            <label>
              Comentario opcional
              <textarea
                onChange={(event) =>
                  setRatingForm((current) => ({ ...current, comment: event.target.value }))
                }
                placeholder="Cuenta brevemente como te fue."
                rows={4}
                value={ratingForm.comment}
              />
            </label>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Guardando...' : 'Enviar calificacion'}
            </button>
          </form>
        ) : (
          <EmptyState
            description="La calificacion se habilitara cuando el conductor marque el viaje como COMPLETED."
            title="Esperando cierre del viaje"
          />
        )}
      </SectionCard>
    </div>
  );
}
