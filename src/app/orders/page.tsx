'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { LoadingState, EmptyState, ErrorState } from '@/components/common';
import { ProductPagination } from '@/components/product/ProductPagination';
import { ordersService } from '@/services/api';
import { formatPrice } from '@/lib/product';
import { formatOrderDate, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE_CLASSES } from '@/lib/order';
import { APP_ROUTES } from '@/constants';
import { ApiError } from '@/types/api';
import type { OrderResponse, OrderPagination as OrderPaginationType } from '@/types/orders';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [pagination, setPagination] = useState<OrderPaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(APP_ROUTES.ORDERS)}`);
      return;
    }

    ordersService
      .getOrders({ page: currentPage, limit: 10 })
      .then((res) => {
        if (ignore) return;
        setOrders(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        setError(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          router.replace(`/login?redirect=${encodeURIComponent(APP_ROUTES.ORDERS)}`);
        } else {
          const msg = err instanceof ApiError ? err.message : 'Unable to load your orders. Please try again.';
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentPage, retryCount, router]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) {
      params.set('page', String(newPage));
    }
    const queryString = params.toString();
    setIsLoading(true);
    router.push(queryString ? `${APP_ROUTES.ORDERS}?${queryString}` : APP_ROUTES.ORDERS);
  };

  if (isLoading && orders.length === 0 && !error) {
    return <LoadingState message="Loading your orders..." className="min-h-[60vh]" />;
  }

  return (
    <div className="flex flex-col flex-grow py-12 md:py-16 bg-bg-base">
      <PageContainer className="max-w-4xl">
        {/* Page Header */}
        <div className="mb-10 border-b border-border-base pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <Link
              href={APP_ROUTES.PROFILE}
              className="text-[9px] font-semibold uppercase tracking-[0.28em] text-text-muted hover:text-primary transition-colors"
            >
              Account
            </Link>
            <h1 className="mt-2 font-serif text-3xl font-normal uppercase tracking-widest text-text-base">
              My Orders
            </h1>
          </div>
          {pagination.total > 0 && (
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.16em]">
              {pagination.total} {pagination.total === 1 ? 'Order' : 'Orders'} Total
            </span>
          )}
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState
            title="Unable to load orders"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            title="No orders yet"
            description="Explore our latest collection and find something you love."
            actionLabel="Start Shopping"
            onActionClick={() => router.push(APP_ROUTES.PRODUCTS)}
            icon={
              <svg
                className="mx-auto h-12 w-12 text-text-muted stroke-[1]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
            }
          />
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="border border-border-base bg-surface p-6 sm:p-8 transition-shadow hover:shadow-sm flex flex-col gap-6"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-text-base">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            ORDER_STATUS_BADGE_CLASSES[order.status] || 'bg-bg-soft text-text-secondary'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        Placed on {formatOrderDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-muted block">
                        Total Amount
                      </span>
                      <span className="text-base font-semibold text-text-base">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="divide-y divide-border-soft">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-2.5 flex items-start justify-between text-xs gap-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-text-base">{item.productName}</p>
                          {item.attributes && item.attributes.length > 0 && (
                            <p className="text-[10px] text-text-muted">
                              {item.attributes.map((a) => a.value).join(' / ')}
                            </p>
                          )}
                          <p className="text-[10px] text-text-muted">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-medium text-text-base text-right shrink-0">
                          {formatPrice(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="pt-2 text-[10px] text-text-muted italic">
                        + {order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-soft">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'} in this order
                    </span>

                    <Link
                      href={APP_ROUTES.ORDER_DETAIL(order.id)}
                      className="inline-flex items-center justify-center border border-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <ProductPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                className="mt-10"
              />
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading orders..." className="min-h-[60vh]" />}>
      <OrdersContent />
    </Suspense>
  );
}
