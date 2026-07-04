import type { Trip, TripStatus, User } from '../types';

const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export function formatDateTime(value: string | null) {
  if (!value) {
    return 'Sin registrar';
  }

  return dateTimeFormatter.format(new Date(value));
}

export function getRoleHome(role: User['role']) {
  return role === 'PASSENGER' ? '/passenger' : '/driver';
}

export function sortTripsByRequestedAt(trips: Trip[]) {
  return [...trips].sort(
    (left, right) =>
      new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime()
  );
}

export function translateStatus(status: TripStatus) {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'IN_PROGRESS':
      return 'En curso';
    case 'COMPLETED':
      return 'Completado';
    default:
      return status;
  }
}

export function getTripCounterpartLabel(role: User['role']) {
  return role === 'PASSENGER' ? 'Conductor' : 'Pasajero';
}
