/**
 * Order types matching the Backend Order API contract exactly.
 * Source of truth: backend/src/modules/orders/types.ts
 */

import type { PaymentMethod, PaymentStatus, PaymentResponse, RazorpayOrderPayload } from "./payments";

export { PaymentMethod, PaymentStatus };


export type ShipmentStatus =
  | "NOT_BOOKED"
  | "BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface CustomerShipmentResponse {
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderAddressSnapshot {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  attributes: Array<{ name: string; value: string }>;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  shippingAddress: OrderAddressSnapshot;
  items: OrderItemResponse[];
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus | null;
  payments?: PaymentResponse[];
  razorpay?: RazorpayOrderPayload;
  shipment?: CustomerShipmentResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderApiResponse {
  success: boolean;
  message?: string;
  data: OrderResponse;
}

export interface OrderListApiResponse {
  success: boolean;
  message?: string;
  data: OrderResponse[];
  pagination?: OrderPagination;
}

export interface PlaceOrderPayload {
  shippingAddressId: string;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}
