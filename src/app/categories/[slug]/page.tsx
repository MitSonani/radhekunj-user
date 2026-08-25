import { Suspense } from 'react';
import { LoadingState } from '@/components/common';
import { ProductsListing } from '@/components/product';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /categories/[slug] — Customer-facing category browsing page.
 * Awaits the dynamic `params` Promise and passes the category slug to
 * ProductsListing, which filters products by that category via the API.
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LoadingState message="Loading collection..." className="min-h-[60vh]" />}>
      <ProductsListing categorySlug={slug} />
    </Suspense>
  );
}
