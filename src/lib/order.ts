import type { OrderStatus } from '@/types/orders';

/**
 * Human-readable labels for backend OrderStatus enum.
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Payment Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/**
 * Visual styling classes for OrderStatus badges following luxury palette.
 */
export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
  CONFIRMED: 'bg-primary/10 text-primary border border-primary/20',
  SHIPPED: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
  DELIVERED: 'bg-emerald-600/10 text-emerald-700 border border-emerald-600/20',
  CANCELLED: 'bg-danger/10 text-danger border border-danger/20',
};

/**
 * Formats ISO date string to readable format e.g. "22 Sep 2026, 04:30 PM".
 */
export function formatOrderDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return String(dateString);

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateString);
  }
}
