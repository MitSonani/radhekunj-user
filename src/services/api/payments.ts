import { apiClient } from "./apiClient";
import type {
  PaymentApiResponse,
  PaymentListApiResponse,
  CreateRazorpayOrderApiResponse,
  VerifyRazorpayPaymentPayload,
} from "@/types/payments";

/**
 * Service for payment interactions.
 * Endpoints:
 *   POST /payments/razorpay/order   → Generate Razorpay order for an existing order (e.g. for retrying payment)
 *   POST /payments/razorpay/verify  → Cryptographically verify Razorpay payment HMAC SHA-256 signature
 *   GET  /payments/order/:orderId   → Get all payment attempts and statuses for an order
 */
export const paymentsService = {
  createRazorpayOrder: (orderId: string) =>
    apiClient.post<CreateRazorpayOrderApiResponse>("/payments/razorpay/order", { orderId }),

  verifyRazorpayPayment: (payload: VerifyRazorpayPaymentPayload) =>
    apiClient.post<PaymentApiResponse>("/payments/razorpay/verify", payload),

  getPaymentsForOrder: (orderId: string) =>
    apiClient.get<PaymentListApiResponse>(`/payments/order/${orderId}`),
};
