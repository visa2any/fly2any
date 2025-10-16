'use client';

interface Props {
  type: 'seats' | 'rooms' | 'viewers' | 'bookings';
  count: number;
  variant?: 'default' | 'urgent';
}

export function ScarcityIndicator({ type, count, variant = 'default' }: Props) {
  const messages = {
    seats: `Only ${count} seats left at this price!`,
    rooms: `Only ${count} rooms remaining`,
    viewers: `${count} people viewing this now`,
    bookings: `${count} bookings in the last 24 hours`,
  };

  const icons = {
    seats: '💺',
    rooms: '🏨',
    viewers: '👁️',
    bookings: '✓',
  };

  const colors = {
    default: 'bg-primary-50 text-primary-700 border-primary-200',
    urgent: 'bg-error/10 text-error border-error/30',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${colors[variant]} animate-pulse`}>
      <span>{icons[type]}</span>
      <span>{messages[type]}</span>
    </div>
  );
}
