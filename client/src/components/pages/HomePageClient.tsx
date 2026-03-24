"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getProducts } from "@/lib/api";
import { IProduct } from "@/types";

interface HomePageClientProps {
  initialProducts?: IProduct[];
}

export default function HomePageClient({
  initialProducts,
}: HomePageClientProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<IProduct[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!keyword && initialProducts) {
      setProducts(initialProducts);
      setError("");
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProducts(keyword);
        setProducts(data.products);
      } catch {
        setError(t.home.loadFail);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [initialProducts, keyword, t.home.loadFail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(search.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <section
        className="bg-black text-white rounded-2xl px-10 py-16 mb-12
        flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex flex-col gap-4 max-w-md">
          <p className="text-green-400 text-sm tracking-widest uppercase">
            {t.home.deals}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t.home.heroTitleStart}{" "}
            <span className="text-red-500">{t.home.heroTitleAccent}</span>
          </h1>
          <p className="text-gray-400 text-sm">{t.home.heroSubtitle}</p>
          <Link
            href="/products"
            className="self-start bg-red-500 hover:bg-red-600
              text-white px-6 py-3 rounded
              transition-colors duration-300"
          >
            {t.home.shopNow} -&gt;
          </Link>
        </div>
      </section>

      <section className="mb-8" id="products">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t.home.allProducts}</h2>

          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded px-3 py-2 gap-2
              border-2 border-transparent focus-within:border-red-500
              focus-within:bg-white transition-all duration-300 w-48 focus-within:w-72"
          >
            <input
              type="text"
              placeholder={t.home.searchProducts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
            <button type="submit" aria-label={t.home.searchProducts}>
              <Search size={16} className="text-gray-500" />
            </button>
          </form>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl h-90 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => {
                setKeyword("");
                setSearch("");
              }}
              className="mt-4 text-sm text-gray-500 underline hover:text-red-500"
            >
              {t.home.tryAgain}
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>
              {t.home.noProductsFound}
              {keyword ? `: "${keyword}"` : ""}
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Link
                href="/products"
                className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-300"
              >
                {t.home.seeAll}
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

