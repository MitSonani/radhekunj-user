'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Button, LoadingState, Toast } from "@/components/common";
import { ordersService, paymentsService } from "@/services/api";
import { formatPrice } from "@/lib/product";
import { formatMobile } from "@/lib/address";
import { APP_ROUTES } from "@/constants";
import type { OrderResponse } from "@/types/orders";
import { ApiError } from "@/types/api";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Payment Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning/10 text-warning border border-warning/20",
  CONFIRMED: "bg-primary/10 text-primary border border-primary/20",
  SHIPPED: "bg-info/10 text-info border border-info/20",
  DELIVERED: "bg-success/10 text-success border border-success/20",
  CANCELLED: "bg-danger/10 text-danger border border-danger/20",
};


const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  NOT_BOOKED: "Processing",
  BOOKED: "Shipment Booked",
  PICKED_UP: "Picked Up by Courier",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const SHIPMENT_STATUS_BADGE_CLASSES: Record<string, string> = {
  NOT_BOOKED: "bg-bg-soft text-text-muted border border-border-soft",
  BOOKED: "bg-info/10 text-info border border-info/20",
  PICKED_UP: "bg-info/10 text-info border border-info/20",
  IN_TRANSIT: "bg-primary/10 text-primary border border-primary/20",
  OUT_FOR_DELIVERY: "bg-warning/10 text-warning border border-warning/20",
  DELIVERED: "bg-success/10 text-success border border-success/20",
  CANCELLED: "bg-danger/10 text-danger border border-danger/20",
};

const PAYMENT_STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border border-warning/20",
  AUTHORIZED: "bg-info/10 text-info border border-info/20",
  PAID: "bg-success/10 text-success border border-success/20",
  FAILED: "bg-danger/10 text-danger border border-danger/20",
  CANCELLED: "bg-danger/10 text-danger border border-danger/20",
  REFUNDED: "bg-bg-soft text-text-secondary border border-border-soft",
};

function formatOrderDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

/**
 * Dynamically loads the Razorpay checkout script if not already present.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface OrderDetailContentProps {
  id: string;
}

export function OrderDetailContent({ id }: OrderDetailContentProps) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    let isMounted = true;
    ordersService
      .getOrderById(id)
      .then((res) => {
        if (isMounted) {
          setOrder(res.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : "Failed to load order details.";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setIsRetryingPayment(true);
      const res = await paymentsService.createRazorpayOrder(order.id);
      const razorpayPayload = res.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !(window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) {
        throw new Error("Unable to load Razorpay payment SDK.");
      }

      const RazorpayCtor = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;

      const options: RazorpayOptions = {
        key: razorpayPayload.keyId,
        amount: razorpayPayload.amount,
        currency: razorpayPayload.currency,
        name: "Cotton Clique",
        description: `Order #${order.orderNumber}`,
        order_id: razorpayPayload.razorpayOrderId,
        prefill: {
          name: order.shippingAddress.fullName,
          contact: order.shippingAddress.mobileNumber,
        },
        theme: {
          color: "#C5A059",
        },
        handler: async (response) => {
          try {
            setIsRetryingPayment(true);
            const verifyRes = await paymentsService.verifyRazorpayPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setOrder((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "CONFIRMED",
                      paymentStatus: "PAID",
                    }
                  : null
              );
              setToastMessage({ message: "Payment verified successfully! Your order is confirmed.", type: "success" });
            }
          } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Payment verification failed.";
            setToastMessage({ message: msg, type: "error" });
          } finally {
            setIsRetryingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsRetryingPayment(false);
            setToastMessage({ message: "Payment was not completed.", type: "info" });
          },
        },
      };

      const rzp = new RazorpayCtor(options);
      rzp.open();
    } catch (err) {
      setIsRetryingPayment(false);
      const msg = err instanceof ApiError ? err.message : "Failed to initiate payment retry.";
      setToastMessage({ message: msg, type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState message="Loading order details…" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-bg-subtle min-h-screen py-16">
        <PageContainer>
          <div className="max-w-md mx-auto text-center border border-border-base bg-surface p-8">
            <h1 className="font-serif text-2xl font-normal text-text-base mb-2">Order Not Found</h1>
            <p className="text-xs text-text-secondary mb-6">{error || "Unable to find the requested order."}</p>
            <Link href={APP_ROUTES.ORDERS}>
              <Button variant="primary" size="sm">
                Back to Orders
              </Button>
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="bg-bg-subtle min-h-screen py-10 sm:py-16">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href={APP_ROUTES.ORDERS}
            className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to My Orders
          </Link>
        </div>

        {/* Order Header */}
        <div className="border border-border-base bg-surface p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-6">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-text-muted block mb-1">
                Order Reference
              </span>
              <h1 className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-text-base">
                #{order.orderNumber}
              </h1>
              <p className="text-[11px] text-text-muted mt-1">
                Placed on {formatOrderDate(order.createdAt)}
              </p>
            </div>

            <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
              <span
                className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  ORDER_STATUS_BADGE_CLASSES[order.status] || "bg-bg-soft text-text-secondary"
                }`}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
              <span className="text-xs font-semibold text-text-base">
                Total: {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* 2-Column Info Grid: Shipping Address & Summary Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Shipping Address Snapshot */}
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-base mb-3">
                Delivery Address (Snapshot)
              </h2>
              <div className="bg-bg-soft p-4 border border-border-soft space-y-1 text-xs">
                <p className="font-semibold text-text-base">
                  {order.shippingAddress.fullName}
                </p>
                <p className="font-mono text-[11px] text-text-muted">
                  {formatMobile(order.shippingAddress.countryCode, order.shippingAddress.mobileNumber)}
                </p>
                <p className="text-text-secondary leading-relaxed pt-1">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                </p>
                <p className="text-text-secondary">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-text-muted">
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Payment & Order Summary */}
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-base mb-3">
                Payment & Price Breakdown
              </h2>
              <div className="bg-bg-soft p-4 border border-border-soft space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-text-secondary pb-1 border-b border-border-soft/60">
                  <span className="uppercase tracking-[0.1em] text-[10px]">Payment Method</span>
                  <span className="font-semibold text-text-base uppercase tracking-wider text-[11px]">
                    {order.paymentMethod === "RAZORPAY" ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-text-secondary pb-2 border-b border-border-soft/60">
                  <span className="uppercase tracking-[0.1em] text-[10px]">Payment Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      PAYMENT_STATUS_BADGE_CLASSES[order.paymentStatus ?? "PENDING"] || "bg-bg-soft text-text-muted"
                    }`}
                  >
                    {order.paymentStatus ?? "PENDING"}
                  </span>
                </div>

                <div className="flex justify-between text-text-secondary pt-1">
                  <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-text-base">{formatPrice(order.subtotal)}</span>
                </div>

                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="flex items-center gap-1.5">
                      <span>Discount</span>
                    </span>
                    <span className="font-semibold">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-secondary">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-text-base">
                    {parseFloat(order.shippingFee) > 0 ? formatPrice(order.shippingFee) : "Free"}
                  </span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-text-base">
                    {parseFloat(order.taxAmount) > 0 ? formatPrice(order.taxAmount) : "Included"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-border-soft font-semibold text-sm text-text-base">
                  <span className="uppercase tracking-wider text-[11px]">Final Total</span>
                  <span className="font-serif text-lg">{formatPrice(order.totalAmount)}</span>
                </div>

                {order.status === "PENDING_PAYMENT" && order.paymentStatus !== "PAID" && (
                  <div className="pt-3 border-t border-border-soft">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                      onClick={handleRetryPayment}
                      isLoading={isRetryingPayment}
                    >
                      Complete Payment Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

                {/* Shipment & Delivery Tracking Section */}
        <div className="border border-border-base bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-4 mb-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-text-base">
                Shipment & Delivery Tracking
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Dispatch and courier tracking status for this order
              </p>
            </div>
            {order.shipment ? (
              <span
                className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  SHIPMENT_STATUS_BADGE_CLASSES[order.shipment.status] || "bg-bg-soft text-text-muted"
                }`}
              >
                {SHIPMENT_STATUS_LABELS[order.shipment.status] || order.shipment.status}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-bg-soft text-text-muted border border-border-soft">
                {order.status === "CONFIRMED" ? "Preparing for Dispatch" : "Shipment Not Booked"}
              </span>
            )}
          </div>

          {order.shipment ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-bg-soft p-4 border border-border-soft text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted block">Courier Partner</span>
                <span className="font-semibold text-text-base mt-0.5 block">{order.shipment.courierName || "Standard Courier"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted block">Tracking / AWB Number</span>
                <span className="font-mono font-medium text-text-base mt-0.5 block">{order.shipment.trackingNumber || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted block">Current Status</span>
                <span className="font-medium text-text-base mt-0.5 block">{SHIPMENT_STATUS_LABELS[order.shipment.status] || order.shipment.status}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted block">Live Tracking</span>
                {order.shipment.trackingUrl ? (
                  <a
                    href={order.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    Track Package &rarr;
                  </a>
                ) : (
                  <span className="text-text-muted mt-0.5 block">Direct link unavailable</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-bg-soft p-4 border border-border-soft text-xs text-text-muted">
              {order.status === "DELIVERED"
                ? "This order has been delivered."
                : order.status === "CANCELLED"
                ? "This order was cancelled."
                : "Your order is confirmed and being prepared. Tracking details will appear here once dispatched with our courier partner."}
            </div>
          )}
        </div>

        {/* Ordered Items List */}
        <div className="border border-border-base bg-surface p-6 sm:p-8 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-text-base mb-6 border-b border-border-soft pb-4">
            Ordered Items ({order.items.length})
          </h2>

          <div className="divide-y divide-border-soft">
            {order.items.map((item) => (
              <div key={item.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Item Icon */}
                  <div className="h-14 w-12 flex-shrink-0 bg-bg-soft border border-border-soft flex items-center justify-center">
                    <svg className="h-6 w-6 text-text-muted stroke-[1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                  </div>

                  {/* Historical Snapshot Details */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wider text-text-base">
                      {item.productName}
                    </p>
                    {item.attributes && item.attributes.length > 0 && (
                      <p className="text-xs text-text-secondary">
                        {item.attributes.map((a) => `${a.name ? `${a.name}: ` : ""}${a.value}`).join(" / ")}
                      </p>
                    )}
                    <p className="font-mono text-[10px] text-text-muted">
                      SKU: {item.sku}
                    </p>
                  </div>
                </div>

                {/* Price, Quantity & Line Total */}
                <div className="flex sm:flex-col sm:items-end justify-between items-center text-xs">
                  <span className="text-text-muted">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </span>
                  <span className="font-semibold text-sm text-text-base mt-0.5">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default OrderDetailContent;
