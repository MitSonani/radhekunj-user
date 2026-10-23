import { apiClient } from './apiClient';
import type {
  OrderApiResponse,
  OrderListApiResponse,
  PlaceOrderPayload,
  GetOrdersParams,
} from '@/types/orders';

/**
 * Service for the authenticated Order & Checkout API.
 * All endpoints require a valid JWT (sent automatically by apiClient via localStorage).
 *
 * Routes (all under /orders):
 *   POST   /orders/checkout  → place an order atomically from current cart
 *   GET    /orders           → get paginated order history for authenticated user
 *   GET    /orders/:id       → get specific order details by ID
 */
export const ordersService = {
  placeOrder: (payload: PlaceOrderPayload) =>
    apiClient.post<OrderApiResponse>('/orders/checkout', payload),

  getOrders: (params?: GetOrdersParams) =>
    apiClient.get<OrderListApiResponse>('/orders', {
      params: params as Record<string, string | number | boolean>,
    }),

  getOrderById: (id: string) =>
    apiClient.get<OrderApiResponse>(`/orders/${id}`),
};
