"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/api";
import { IProduct } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ProductsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProducts(keyword);
        setProducts(data.products);
      } catch {
        setError(t.products.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, t.products.loadFail]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {keyword ? `${t.products.searchTitle}: ${keyword}` : t.products.allProducts}
      </h1>

      {loading && <p className="text-gray-500">{t.products.loading}</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500">{t.products.noProducts}</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
