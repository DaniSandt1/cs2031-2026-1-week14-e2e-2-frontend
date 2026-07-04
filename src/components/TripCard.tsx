import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, getTripCounterpartLabel } from '../lib/format';
import type { Role, Trip } from '../types';
import { StatusBadge } from './StatusBadge';

interface TripCardProps {
  trip: Trip;
  role: Role;
  href: string;
  action?: ReactNode;
}

export function TripCard({ trip, role, href, action }: TripCardProps) {
  const counterpart = role === 'PASSENGER' ? trip.driver : trip.passenger;

  return (
    <article className="trip-card">
      <div className="trip-card-top">
        <div>
          <StatusBadge status={trip.status} />
          <h3>
            {trip.pickupAddress} <span className="trip-arrow">-&gt;</span> {trip.dropoffAddress}
          </h3>
        </div>
        <div className="trip-card-actions">
          {action}
          <Link className="ghost-button" to={href}>
            Ver detalle
          </Link>
        </div>
      </div>
      <dl className="trip-meta-grid">
        <div>
          <dt>Solicitado</dt>
          <dd>{formatDateTime(trip.requestedAt)}</dd>
        </div>
        <div>
          <dt>{getTripCounterpartLabel(role)}</dt>
          <dd>
            {counterpart
              ? `${counterpart.firstName} ${counterpart.lastName}`
              : role === 'PASSENGER'
                ? 'Buscando conductor...'
                : 'Sin conductor asignado'}
          </dd>
        </div>
      </dl>
    </article>
  );
}
