'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Button, LoadingState } from "@/components/common";
import { catalogService, type PublicCategoryItem } from "@/services/api";
import { APP_ROUTES } from "@/constants";
import { ApiError } from "@/types/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<PublicCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    catalogService
      .listCategories({ page: 1, limit: 50 })
      .then((res) => {
        if (isMounted) {
          setCategories(res.data ?? []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : "Unable to load categories. Please try again.";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    catalogService
      .listCategories({ page: 1, limit: 50 })
      .then((res) => {
        setCategories(res.data ?? []);
        setIsLoading(false);
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Unable to load categories. Please try again.";
        setError(msg);
        setIsLoading(false);
      });
  };

  return (
    <div className="py-12 md:py-20">
      <PageContainer>
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
              Curated Segments
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide uppercase text-text-base">
              All Collections
            </h1>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore our range of timeless essentials, handwoven silks, and curated seasonal edits.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="min-h-[40vh] flex items-center justify-center">
              <LoadingState message="Loading collections…" />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 border border-border-base bg-surface">
              <p className="text-sm text-danger mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && categories.length === 0 && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 border border-border-base bg-surface">
              <h2 className="font-serif text-xl text-text-base mb-2">No Collections Found</h2>
              <p className="text-xs text-text-muted mb-6">Collections will be published soon. Browse all our products in the meantime.</p>
              <Link href={APP_ROUTES.PRODUCTS}>
                <Button variant="primary" size="sm">
                  View All Products
                </Button>
              </Link>
            </div>
          )}

          {/* Categories Grid */}
          {!isLoading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={APP_ROUTES.CATEGORY(cat.slug)}
                  className="group relative aspect-[3/4] w-full bg-surface border border-border-base hover:border-primary-medium/40 transition-all duration-300 overflow-hidden flex flex-col justify-end p-8"
                >
                  {cat.imageUrl ? (
                    <div className="absolute inset-0">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-green-light/40 group-hover:bg-green-light/60 transition-colors" />
                  )}

                  <div className="relative z-10 flex flex-col gap-2">
                    <h2 className={`font-serif text-2xl font-normal uppercase tracking-wider ${
                      cat.imageUrl ? "text-white" : "text-text-base"
                    }`}>
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className={`text-xs line-clamp-2 max-w-sm ${
                        cat.imageUrl ? "text-white/80" : "text-text-secondary"
                      }`}>
                        {cat.description}
                      </p>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 ${
                      cat.imageUrl ? "text-accent" : "text-primary"
                    }`}>
                      Explore Collection &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
