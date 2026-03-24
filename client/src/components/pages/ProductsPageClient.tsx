"use client";

import { useEffect } from "react";
import FiltersSidebar from "@/components/products/FiltersSidebar";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ProductsResponse } from "@/lib/api/products";
import { useProductFilters, SortOption } from "@/store/useProductFilters";
import { IProduct } from "@/types";
import Pagination from "@/components/ui/Pagination";

interface ProductsPageClientProps {
  initialKeyword: string;
  initialData?: ProductsResponse;
}

export default function ProductsPageClient({
  initialKeyword,
  initialData,
}: ProductsPageClientProps) {
  const { t } = useLanguage();
  const { pageNumber, setPage, sort, setSort, setPageSize } =
    useProductFilters();

  useEffect(() => {
    const update = () => {
      const isMobile = window.innerWidth < 768;
      setPageSize(isMobile ? 8 : 12);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [setPageSize]);

  const { data, isLoading, error } = useProducts(initialKeyword, initialData);

  const products = data?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <FiltersSidebar />
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {initialKeyword
                ? `${t.products.searchTitle}: ${initialKeyword}`
                : t.products.allProducts}
            </h1>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-gray-200 rounded px-2 py-1 text-sm bg-white outline-none focus:border-red-500 transition-colors cursor-pointer"
            >
              <option value="newest">{t.products.newest}</option>
              <option value="price_asc">{t.products.price_asc}</option>
              <option value="price_desc">{t.products.price_desc}</option>
              <option value="rating_desc">{t.products.rating_desc}</option>
              <option value="name_asc">{t.products.name_asc}</option>
            </select>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-3/4 bg-gray-100 animate-pulse rounded-lg"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
              {t.products.loadFail}
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">{t.products.noProducts}</p>
            </div>
          )}

          {!isLoading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: IProduct) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <div className="mt-10 border-t pt-8">
                <Pagination
                  currentPage={pageNumber}
                  totalPages={data?.pages || 1}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
