import { ProductDetailContent } from '@/components/product';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /products/[slug] — Customer-facing product detail page.
 * Awaits the dynamic `params` Promise (Next.js 16 convention) and
 * passes the resolved slug to the client-side ProductDetailContent component.
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}
