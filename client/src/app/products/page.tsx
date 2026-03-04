"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import Pagination from "@/components/ui/Pagination";
import { useProductFilters, SortOption } from "@/store/useProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { IProduct } from "@/types";
import FiltersSidebar from "@/components/products/FiltersSidebar";

function ProductsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const { pageNumber, setPage, sort, setSort, setPageSize } =
    useProductFilters();

  // Автоматично встановлюємо pageSize залежно від розміру екрану
  useEffect(() => {
    const update = () => {
      const isMobile = window.innerWidth < 768;
      setPageSize(isMobile ? 8 : 12);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [setPageSize]);

  const { data, isLoading, error } = useProducts(keyword);

  const products = data?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Бокова панель з фільтрами */}
        <aside className="w-full md:w-64 shrink-0">
          <FiltersSidebar />
        </aside>

        {/* Основний контент з товарами */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {keyword
                ? `${t.products.searchTitle}: ${keyword}`
                : t.products.allProducts}
            </h1>

            {/* Сортування */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-gray-200 rounded px-2 py-1 text-sm bg-white outline-none focus:border-red-500 transition-colors cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
              <option value="name_asc">Name: A-Z</option>
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
              {/* Сітка товарів */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: IProduct) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Пагінація */}
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

export default function ProductsPage() {
  return <ProductsContent />;
}
