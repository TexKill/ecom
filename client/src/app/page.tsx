"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";
import { IProduct } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { Search } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProducts(keyword);
        setProducts(data.products);
      } catch {
        setError("Failed to load products. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ── Hero section ── */}
      <section
        className="bg-black text-white rounded-2xl px-10 py-16 mb-12
        flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex flex-col gap-4 max-w-md">
          <p className="text-green-400 text-sm tracking-widest uppercase">
            {"Today's Best Deals"}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Shop the Latest <span className="text-red-500">Products</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Discover thousands of products at unbeatable prices.
          </p>
          <a
            href="#products"
            className="self-start bg-red-500 hover:bg-red-600
              text-white px-6 py-3 rounded
              transition-colors duration-300"
          >
            Shop Now →
          </a>
        </div>

        {/* Декоративна права частина */}
        <div className="hidden md:flex text-8xl">🛍️</div>
      </section>

      {/* ── Пошук ── */}
      <section className="mb-8" id="products">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Products</h2>

          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded px-3 py-2 gap-2
              border-2 border-transparent focus-within:border-red-500
              focus-within:bg-white transition-all duration-300 w-48 focus-within:w-72"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
            <button type="submit">
              <Search size={16} className="text-gray-500" />
            </button>
          </form>
        </div>

        {/* ── Стани завантаження ── */}

        {/* Loading: показуємо скелетон замість порожнього екрану */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg h-72 animate-pulse"
              />
              // animate-pulse — Tailwind анімація "пульсування" для скелетонів
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => setKeyword("")}
              className="mt-4 text-sm text-gray-500 underline hover:text-red-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Порожній результат пошуку */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p>
              {'No products found for "'}
              {keyword}
              {'"'}
            </p>
          </div>
        )}

        {/* Сітка товарів */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              // key — обов'язковий атрибут при рендері списків
              // React використовує його щоб відстежувати які елементи змінились
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
