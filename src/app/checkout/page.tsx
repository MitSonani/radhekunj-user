'use client';

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout";
import { Button, LoadingState, Toast } from "@/components/common";
import { AddressForm } from "@/components/address";
import { useCart } from "@/contexts/CartContext";
import { useAddresses } from "@/hooks/useAddresses";
import { ordersService, paymentsService } from "@/services/api";
import { formatPrice } from "@/lib/product";
import { formatMobile, EMPTY_ADDRESS_FORM } from "@/lib/address";
import { APP_ROUTES } from "@/constants";
import { ApiError } from "@/types/api";
import type { CreateAddressPayload, AddressFormValues } from "@/types/address";
import type { OrderResponse, PaymentMethod } from "@/types/orders";
import type { UserProfile } from "@/services/api";

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
  on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

function getCachedUserInitialAddress(): Partial<AddressFormValues> {
  if (typeof window === "undefined") return EMPTY_ADDRESS_FORM;
  try {
    const cached = localStorage.getItem("user_profile");
    if (!cached) return EMPTY_ADDRESS_FORM;
    const profile = JSON.parse(cached) as UserProfile;
    return { ...EMPTY_ADDRESS_FORM, fullName: profile.name ?? "" };
  } catch {
    return EMPTY_ADDRESS_FORM;
  }
}

/**
 * Dynamically loads the Razorpay checkout script if not already present on window.
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: isCartLoading, cartError, refreshCart } = useCart();
  const {
    addresses,
    isLoading: isAddressesLoading,
    createAddress,
  } = useAddresses();

  // Local state for address selection override
  const [selectedAddressIdOverride, setSelectedAddressIdOverride] = useState<string | null>(null);

  // COD Eligibility state
  const [codEligibility, setCodEligibility] = useState<{
    isEligible: boolean;
    reason?: string;
    maxOrderValue?: number;
  }>({ isEligible: true });

  // Derive effective selected address (override or default address)
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const selectedAddressId = selectedAddressIdOverride ?? defaultAddress?.id ?? null;
  const setSelectedAddressId = setSelectedAddressIdOverride;

  // Selected payment method: default to COD
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("COD");

  // Local state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Inline address creation state
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Placed order success state
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);

  // Stable idempotency key per checkout session
  const idempotencyKeyRef = useRef<string>("");

  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  // Pre-load Razorpay script in the background
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
      router.replace(`/login?redirect=${encodeURIComponent(APP_ROUTES.CHECKOUT)}`);
    }
  }, [router]);

  // Selected address object for postal code check
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? defaultAddress;

  // Re-check COD eligibility whenever total amount or address changes
  useEffect(() => {
    if (!cart) return;
    const totalAmount = cart.finalSubtotal || cart.subtotal;
    const postalCode = selectedAddress?.postalCode;

    ordersService
      .checkCodEligibility({ amount: totalAmount, postalCode })
      .then((res) => {
        if (res.data) {
          setCodEligibility(res.data);
          if (!res.data.isEligible && selectedPaymentMethod === "COD") {
            setSelectedPaymentMethod("RAZORPAY");
          }
        }
      })
      .catch(() => {
        // preserve current eligibility on network hiccup
      });
  }, [cart, selectedAddress?.postalCode, selectedPaymentMethod]);

  // Redirect to cart if empty
  useEffect(() => {
    if (!isCartLoading && !placedOrder) {
      if (!cart || cart.items.length === 0) {
        router.replace(APP_ROUTES.CART);
      }
    }
  }, [cart, isCartLoading, placedOrder, router]);

  // Handle inline address addition
  const handleSaveNewAddress = async (payload: CreateAddressPayload) => {
    try {
      setIsAddingAddress(true);
      const newAddress = await createAddress(payload);
      setSelectedAddressId(newAddress.id);
      setShowAddAddressForm(false);
      setToastMessage({ message: "Address added and selected.", type: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save address.";
      setToastMessage({ message: msg, type: "error" });
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Handle Order Placement with COD or Razorpay
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setToastMessage({ message: "Please select or add a delivery address.", type: "error" });
      return;
    }

    if (!cart || cart.items.length === 0) {
      setToastMessage({ message: "Your bag is empty.", type: "error" });
      return;
    }

    // Check for unavailable lines
    const unavailableItems = cart.items.filter((item) => !item.variant.isAvailable);
    if (unavailableItems.length > 0) {
      setToastMessage({
        message: "Some items in your bag are out of stock. Please return to your bag to update.",
        type: "error",
      });
      return;
    }

    try {
      setIsPlacingOrder(true);
      setOrderError(null);

      // 1. Create order on backend (authoritative)
      const res = await ordersService.placeOrder({
        shippingAddressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        idempotencyKey: idempotencyKeyRef.current || undefined,
      });

      const order = res.data;

      // 2A. Cash On Delivery (COD) Flow
      if (selectedPaymentMethod === "COD") {
        setPlacedOrder(order);
        await refreshCart();
        setToastMessage({ message: "Order placed successfully!", type: "success" });
        return;
      }

      // 2B. Razorpay Online Flow
      if (selectedPaymentMethod === "RAZORPAY") {
        const razorpayPayload = order.razorpay;
        if (!razorpayPayload) {
          throw new Error("Razorpay transaction payload not returned from backend.");
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !(window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) {
          throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
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
              setIsPlacingOrder(true);
              const verifyRes = await paymentsService.verifyRazorpayPayment({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await refreshCart();
                setPlacedOrder({
                  ...order,
                  status: "CONFIRMED",
                  paymentStatus: "PAID",
                });
                setToastMessage({ message: "Payment verified successfully! Your order is confirmed.", type: "success" });
              }
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : "Payment verification failed. Please contact support.";
              setOrderError(msg);
              setToastMessage({ message: msg, type: "error" });
            } finally {
              setIsPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false);
              setOrderError("Payment window was dismissed. You can retry placing the order or switch to Cash on Delivery.");
              setToastMessage({ message: "Payment was not completed.", type: "info" });
            },
          },
        };

        const rzp = new RazorpayCtor(options);
        rzp.on("payment.failed", (response) => {
          setIsPlacingOrder(false);
          const reason = response.error?.description || "Payment failed at gateway";
          setOrderError(reason);
          setToastMessage({ message: reason, type: "error" });
        });

        rzp.open();
      }
    } catch (err) {
      setIsPlacingOrder(false);
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An error occurred while placing your order. Please try again.";
      setOrderError(message);
      setToastMessage({ message, type: "error" });
    }
  };

  // Loading View
  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState message="Preparing checkout…" />
      </div>
    );
  }

  // Placed Order Success View
  if (placedOrder) {
    return (
      <div className="bg-bg-subtle min-h-screen py-16">
        <PageContainer>
          <div className="mx-auto max-w-2xl border border-border-base bg-surface p-8 sm:p-12 text-center shadow-sm">
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary block mb-2">
              Thank You For Your Order
            </span>
            <h1 className="font-serif text-3xl font-normal tracking-wide text-text-base mb-2">
              Order Confirmed
            </h1>
            <p className="font-mono text-sm font-semibold tracking-wider text-text-secondary mb-8">
              Order #{placedOrder.orderNumber}
            </p>

            <div className="border-t border-b border-border-soft py-6 my-6 text-left space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-[0.1em] text-text-muted">Payment Method</span>
                <span className="font-semibold text-text-base uppercase tracking-wider">
                  {placedOrder.paymentMethod === "RAZORPAY" ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-[0.1em] text-text-muted">Payment Status</span>
                <span className={`font-semibold uppercase tracking-wider px-2 py-0.5 text-[10px] ${
                  placedOrder.paymentStatus === "PAID"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}>
                  {placedOrder.paymentStatus ?? "PENDING"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-[0.1em] text-text-muted">Total Amount</span>
                <span className="font-serif text-base font-semibold text-text-base">
                  {formatPrice(placedOrder.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-start text-xs pt-2 border-t border-border-soft">
                <span className="uppercase tracking-[0.1em] text-text-muted">Deliver To</span>
                <span className="text-right text-text-base">
                  <span className="font-semibold block">{placedOrder.shippingAddress.fullName}</span>
                  <span className="text-text-muted block text-[11px]">
                    {placedOrder.shippingAddress.addressLine1}, {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.postalCode}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href={APP_ROUTES.ORDERS}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  View My Orders
                </Button>
              </Link>
              <Link href={APP_ROUTES.PRODUCTS}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const hasUnavailableItems = cart.items.some((i) => !i.variant.isAvailable);

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
        {/* Breadcrumb / Step Indicator */}
        <div className="mb-8">
          <nav aria-label="Checkout Breadcrumb" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            <Link href={APP_ROUTES.CART} className="hover:text-primary transition-colors">
              Bag
            </Link>
            <span>/</span>
            <span className="text-text-base">Checkout</span>
          </nav>
          <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-normal tracking-wide text-text-base">
            Secure Checkout
          </h1>
        </div>

        {/* Global Error Banner */}
        {(orderError || cartError) && (
          <div className="mb-8 border border-danger/30 bg-danger/5 p-4 text-xs text-danger">
            <p className="font-semibold uppercase tracking-wider mb-1">Notice</p>
            <p>{orderError || cartError}</p>
          </div>
        )}

        {/* Stock Alert Banner */}
        {hasUnavailableItems && (
          <div className="mb-8 border border-warning/30 bg-warning/5 p-4 text-xs text-warning">
            <p className="font-semibold uppercase tracking-wider mb-1">Items Out of Stock</p>
            <p>
              Some items in your bag have become unavailable. Please return to your{" "}
              <Link href={APP_ROUTES.CART} className="underline font-bold">
                shopping bag
              </Link>{" "}
              to update your items before continuing.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left 2 Columns: Address & Payment Selection */}
          <div className="lg:col-span-2 space-y-12">
            {/* SECTION 1: DELIVERY ADDRESS */}
            <section aria-labelledby="shipping-address-heading">
              <div className="flex items-center justify-between border-b border-border-soft pb-4 mb-6">
                <h2 id="shipping-address-heading" className="text-xs font-semibold uppercase tracking-[0.24em] text-text-base">
                  1. Delivery Address
                </h2>
                {!showAddAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(true)}
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* Inline Address Form */}
              {showAddAddressForm ? (
                <div className="border border-border-soft bg-surface p-6 mb-6">
                  <div className="flex items-center justify-between mb-4 border-b border-border-soft pb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-base">
                      New Shipping Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAddressForm(false)}
                      className="text-xs text-text-muted hover:text-text-base"
                    >
                      Cancel
                    </button>
                  </div>
                  <AddressForm
                    initialValues={getCachedUserInitialAddress()}
                    onSubmit={handleSaveNewAddress}
                    onCancel={() => setShowAddAddressForm(false)}
                    isSubmitting={isAddingAddress}
                    submitLabel="Deliver to this Address"
                  />
                </div>
              ) : null}

              {/* Existing Address List */}
              {addresses.length === 0 && !showAddAddressForm ? (
                <div className="border border-dashed border-border-base p-8 text-center bg-surface">
                  <p className="text-xs text-text-secondary mb-4">
                    No shipping addresses found on your account.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAddressForm(true)}
                  >
                    Add Address to Proceed
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer border p-4 transition-all relative ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border-soft bg-surface hover:border-border-base"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-text-base">
                            {addr.fullName}
                          </span>
                          {addr.label && (
                            <span className="text-[9px] uppercase tracking-wider bg-bg-soft px-1.5 py-0.5 text-text-muted border border-border-soft">
                              {addr.label}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed mb-1">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                        </p>
                        <p className="text-xs text-text-secondary mb-2">
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-[11px] font-mono text-text-muted">
                          {formatMobile(addr.countryCode, addr.mobileNumber)}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                          <input
                            type="radio"
                            name="delivery_address"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span className={isSelected ? "text-primary" : "text-text-muted"}>
                            {isSelected ? "Selected" : "Select this address"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SECTION 2: PAYMENT METHOD */}
            <section aria-labelledby="payment-method-heading">
              <div className="border-b border-border-soft pb-4 mb-6">
                <h2 id="payment-method-heading" className="text-xs font-semibold uppercase tracking-[0.24em] text-text-base">
                  2. Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery (COD) Card */}
                <div
                  onClick={() => {
                    if (codEligibility.isEligible) {
                      setSelectedPaymentMethod("COD");
                    }
                  }}
                  className={`border p-5 transition-all flex flex-col justify-between ${
                    !codEligibility.isEligible
                      ? "opacity-60 bg-bg-soft/70 border-border-soft cursor-not-allowed"
                      : selectedPaymentMethod === "COD"
                      ? "cursor-pointer border-primary bg-primary/5 ring-1 ring-primary"
                      : "cursor-pointer border-border-soft bg-surface hover:border-border-base"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-base">
                        Cash on Delivery (COD)
                      </span>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          !codEligibility.isEligible
                            ? "border-border-soft bg-border-soft"
                            : selectedPaymentMethod === "COD"
                            ? "border-primary bg-primary text-white"
                            : "border-border-base"
                        }`}
                      >
                        {selectedPaymentMethod === "COD" && codEligibility.isEligible && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Pay with cash upon delivery of your order to your shipping address.
                    </p>
                  </div>

                  {!codEligibility.isEligible ? (
                    <div className="mt-4 rounded bg-warning/10 border border-warning/30 p-2 text-[10px] text-text-base font-medium">
                      ⚠️ {codEligibility.reason || "Cash on Delivery is unavailable for this order."}
                    </div>
                  ) : (
                    <span className="mt-4 text-[9px] uppercase tracking-wider font-semibold text-text-muted">
                      No advance online transaction needed
                    </span>
                  )}
                </div>

                {/* Razorpay Online Card */}
                <div
                  onClick={() => setSelectedPaymentMethod("RAZORPAY")}
                  className={`cursor-pointer border p-5 transition-all flex flex-col justify-between ${
                    selectedPaymentMethod === "RAZORPAY"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border-soft bg-surface hover:border-border-base"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-base">
                        Online Payment (Razorpay)
                      </span>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          selectedPaymentMethod === "RAZORPAY"
                            ? "border-primary bg-primary text-white"
                            : "border-border-base"
                        }`}
                      >
                        {selectedPaymentMethod === "RAZORPAY" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Cards (Visa, MasterCard, RuPay), UPI (GPay, PhonePe, Paytm), NetBanking & Wallets.
                    </p>
                  </div>
                  <span className="mt-4 flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-primary">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    100% Encrypted & Secure
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 3: ORDER ITEMS REVIEW */}
            <section aria-labelledby="items-review-heading">
              <div className="flex items-center justify-between border-b border-border-soft pb-4 mb-6">
                <h2 id="items-review-heading" className="text-xs font-semibold uppercase tracking-[0.24em] text-text-base">
                  3. Review Bag Items ({cart.totalQuantity})
                </h2>
                <Link
                  href={APP_ROUTES.CART}
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
                >
                  Modify Bag
                </Link>
              </div>

              <div className="divide-y divide-border-soft border-t border-b border-border-soft">
                {cart.items.map((item) => {
                  const { variant } = item;
                  const attributeLabel = variant.attributes
                    .map((a) => a.attributeValue.value)
                    .join(" / ");
                  const lineTotal = (parseFloat(variant.price) * item.quantity).toFixed(2);

                  return (
                    <div key={item.id} className="flex gap-4 py-4 sm:gap-6">
                      {/* Thumbnail */}
                      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-bg-soft border border-border-soft">
                        {variant.image ? (
                          <Image
                            src={variant.image.imageUrl}
                            alt={variant.image.altText || variant.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-bg-soft">
                            <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-text-base">
                              {variant.product.name}
                            </p>
                            <span className="text-xs font-semibold text-text-base">
                              {formatPrice(lineTotal)}
                            </span>
                          </div>
                          {attributeLabel && (
                            <p className="mt-0.5 text-[10px] text-text-muted">{attributeLabel}</p>
                          )}
                          <p className="text-[9px] font-mono text-text-muted mt-0.5">SKU: {variant.sku}</p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-text-muted">
                          <span>Quantity: {item.quantity}</span>
                          <span>{formatPrice(variant.price)} each</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border border-border-soft bg-surface p-6 shadow-sm">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-base mb-6 border-b border-border-soft pb-4">
                Order Summary
              </h2>

              {/* Authoritative Price Breakdown from Backend Cart */}
              <div className="space-y-3.5 pb-6 border-b border-border-soft text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span className="uppercase tracking-[0.1em] text-[10px]">
                    Subtotal ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium text-text-base">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>

                {parseFloat(cart.discountAmount) > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="uppercase tracking-[0.1em] text-[10px] flex items-center gap-1.5">
                      <span>Coupon Discount</span>
                      {cart.coupon && (
                        <span className="font-mono text-[9px] bg-primary/10 px-1 py-0.5 font-bold">
                          {cart.coupon.code}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold">
                      -{formatPrice(cart.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-text-secondary">
                  <span className="uppercase tracking-[0.1em] text-[10px]">Delivery</span>
                  <span className="font-medium text-text-base text-primary uppercase text-[10px] tracking-wider">
                    Free
                  </span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span className="uppercase tracking-[0.1em] text-[10px]">Estimated Tax</span>
                  <span className="text-[10px] text-text-muted">
                    Included
                  </span>
                </div>
              </div>

              {/* Final Total */}
              <div className="flex items-center justify-between py-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-base">
                  Total Due
                </span>
                <span className="font-serif text-2xl font-normal text-text-base">
                  {formatPrice(cart.finalSubtotal ?? cart.subtotal)}
                </span>
              </div>

              {/* Place Order CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={handlePlaceOrder}
                isLoading={isPlacingOrder}
                disabled={
                  isPlacingOrder ||
                  isCartLoading ||
                  !selectedAddressId ||
                  hasUnavailableItems ||
                  isAddingAddress ||
                  (selectedPaymentMethod === "COD" && !codEligibility.isEligible)
                }
              >
                {isPlacingOrder
                  ? selectedPaymentMethod === "RAZORPAY"
                    ? "Opening Payment Window…"
                    : "Placing Order…"
                  : selectedPaymentMethod === "RAZORPAY"
                  ? "Pay with Razorpay"
                  : "Place Order (COD)"}
              </Button>

              {!selectedAddressId && addresses.length === 0 && (
                <p className="mt-3 text-center text-[9px] text-danger">
                  Please add a delivery address to place order.
                </p>
              )}

              <p className="mt-4 text-center text-[9px] text-text-muted uppercase tracking-[0.12em]">
                Safe & Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
