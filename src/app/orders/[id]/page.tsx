import React from 'react';
import OrderDetailContent from './OrderDetailContent';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /orders/[id] — Customer-facing order details page.
 * Awaits the dynamic `params` Promise and renders the client-side OrderDetailContent.
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailContent id={id} />;
}
