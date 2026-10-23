/**
 * Payment types matching Backend API contracts exactly.
 * Source of truth: backend/src/modules/payments/types.ts
 */

export type PaymentMethod = "COD" | "RAZORPAY";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaymentResponse {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: string;
  currency: string;
  provider: string | null;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderPayload {
  keyId: string;
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

export interface VerifyRazorpayPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentListApiResponse {
  success: boolean;
  message?: string;
  data: PaymentResponse[];
}

export interface PaymentApiResponse {
  success: boolean;
  message?: string;
  data: PaymentResponse;
}

export interface CreateRazorpayOrderApiResponse {
  success: boolean;
  message?: string;
  data: RazorpayOrderPayload;
}
