'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import {
  catalogService,
  bannerService,
  type PublicCategoryItem,
  type PublicBannerItem,
} from "@/services/api";
import type { PublicProductListItem } from "@/types/api";
import { APP_ROUTES } from "@/constants";

export default function Home() {
  const [categories, setCategories] = useState<PublicCategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<PublicProductListItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [banners, setBanners] = useState<PublicBannerItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    // Load active homepage hero banners
    bannerService
      .getActiveBanners()
      .then((res) => {
        if (isMounted && res.data) {
          setBanners(res.data);
        }
      })
      .catch(() => {});

    // Load featured categories
    catalogService
      .listCategories({ page: 1, limit: 3 })
      .then((res) => {
        if (isMounted) {
          setCategories(res.data ?? []);
          setCategoriesLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setCategoriesLoading(false);
      });

    // Load new arrival products
    catalogService
      .listProducts({ page: 1, limit: 8, sort: "newest" })
      .then((res) => {
        if (isMounted) {
          setProducts(res.data ?? []);
          setProductsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProductsError("Unable to load latest arrivals.");
          setProductsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-20 py-10 md:py-16 transition-colors duration-200">
      {/* 1. Campaign Hero Section */}
      <PageContainer>
        <HeroBanner banner={banners[0]} />
      </PageContainer>

      {/* 2. Shop by Category / Curated Segments */}
      <PageContainer>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-soft pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Curated Segments
              </span>
              <h2 className="font-serif text-2xl font-normal uppercase tracking-widest text-text-base">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline inline-flex items-center gap-1"
            >
              All Collections &rarr;
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="aspect-[3/4] w-full bg-border-soft animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={APP_ROUTES.CATEGORY(cat.slug)}
                  className="group relative aspect-[3/4] w-full bg-surface border border-border-base hover:border-primary-medium/40 transition-all duration-300 flex flex-col justify-end p-6 overflow-hidden"
                >
                  {cat.imageUrl ? (
                    <div className="absolute inset-0">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-green-light/40 group-hover:bg-green-light/60 transition-colors" />
                  )}

                  <div className="relative z-10 flex flex-col gap-2">
                    <h3 className={`font-serif text-xl font-normal uppercase tracking-wider ${
                      cat.imageUrl ? "text-white" : "text-text-base"
                    }`}>
                      {cat.name}
                    </h3>
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-1 ${
                      cat.imageUrl ? "text-accent" : "text-text-secondary group-hover:text-primary"
                    }`}>
                      Explore Category &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-border-base bg-surface text-xs text-text-muted">
              Collections will appear here soon.
            </div>
          )}
        </div>
      </PageContainer>

      {/* 3. Featured / New Arrivals Showcase */}
      <PageContainer>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-soft pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Seasonal Selects
              </span>
              <h2 className="font-serif text-2xl font-normal uppercase tracking-widest text-text-base">
                New Arrivals
              </h2>
            </div>
            <Link
              href={APP_ROUTES.PRODUCTS}
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline inline-flex items-center gap-1"
            >
              View All Products &rarr;
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productsError ? (
            <div className="p-8 text-center border border-border-base bg-surface text-xs text-danger">
              {productsError}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 4} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-border-base bg-surface text-xs text-text-muted">
              New products will be added shortly.
            </div>
          )}
        </div>
      </PageContainer>

      {/* 4. Brand Values & Heritage Section */}
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border-soft">
          <div className="border border-border-base bg-surface p-6 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Ethical Sourcing
            </span>
            <h4 className="font-serif text-base font-normal uppercase text-text-base">
              Pure Natural Fibers
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Every textile is conscientiously selected from certified mills, emphasizing breathable cottons and Mulberry silks.
            </p>
          </div>

          <div className="border border-border-base bg-surface p-6 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Bespoke Quality
            </span>
            <h4 className="font-serif text-base font-normal uppercase text-text-base">
              Artisan Craftsmanship
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Meticulous tailoring, durable double-stitch seams, and subtle hand-finished accents designed to endure seasons.
            </p>
          </div>

          <div className="border border-border-base bg-surface p-6 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Reliable Delivery
            </span>
            <h4 className="font-serif text-base font-normal uppercase text-text-base">
              Seamless Pan-India Dispatch
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Express, tracked shipments dispatched directly from our studio, with Cash on Delivery and encrypted online payment.
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
