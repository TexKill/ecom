"use client";

import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import Pagination from "@/components/ui/Pagination";
import { useProductFilters } from "@/store/useProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { IProduct } from "@/types";

function ProductsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const { pageNumber, pageSize, setPage } = useProductFilters();

  const { data, isLoading, error } = useProducts({
    pageNumber,
    pageSize,
    keyword,
  });

  const products = data?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {keyword
          ? `${t.products.searchTitle}: ${keyword}`
          : t.products.allProducts}
      </h1>

      {isLoading && <p className="text-gray-500">{t.products.loading}</p>}

      {error && <p className="text-red-500">{t.products.loadFail}</p>}

      {!isLoading && !error && products.length === 0 && (
        <p className="text-gray-500">{t.products.noProducts}</p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={pageNumber}
            totalPages={data?.pages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return <ProductsContent />;
}
