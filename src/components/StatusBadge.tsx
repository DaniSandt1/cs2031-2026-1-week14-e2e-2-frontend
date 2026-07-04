import { translateStatus } from '../lib/format';
import type { TripStatus } from '../types';

export function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {translateStatus(status)}
    </span>
  );
}
