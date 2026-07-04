import { useEffect } from 'react';
import { getTripById } from '../lib/api';
import type { Trip } from '../types';

interface UseTripPollingOptions {
  tripId: number | null;
  enabled: boolean;
  intervalMs?: number;
  onTrip: (trip: Trip) => void;
}

export function useTripPolling({
  tripId,
  enabled,
  intervalMs = 4000,
  onTrip
}: UseTripPollingOptions) {
  useEffect(() => {
    if (!enabled || tripId === null) {
      return;
    }

    const tripIdentifier = tripId;
    let isMounted = true;

    async function refreshTrip() {
      try {
        const nextTrip = await getTripById(tripIdentifier);

        if (isMounted) {
          onTrip(nextTrip);
        }
      } catch {
        // El polling no debe bloquear la UI por errores transitorios.
      }
    }

    const intervalId = window.setInterval(refreshTrip, intervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, onTrip, tripId]);
}
