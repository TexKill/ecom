"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useProductFilters } from "@/store/useProductFilters";
import { fetchProductFilters } from "@/lib/api/products";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function FiltersSidebar() {
  const { t } = useLanguage();
  const {
    category,
    setCategory,
    brand,
    toggleBrand,
    minPrice,
    maxPrice,
    setPriceRange,
    resetFilters,
  } = useProductFilters();

  const [meta, setMeta] = useState<{
    brands: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  } | null>(null);

  // Контролює видимість панелі на мобільних
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchProductFilters()
      .then(setMeta)
      .catch((err) => console.error("Failed to load filters", err));
  }, []);

  const activeBrands = brand ? brand.split(",") : [];

  // Чи є активні фільтри (для бейджика на кнопці)
  const hasActiveFilters = Boolean(category || brand || minPrice || maxPrice);

  return (
    <>
      {/* КНОПКА — видима тільки на мобільних */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex items-center gap-2 w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium bg-white mb-4"
      >
        <SlidersHorizontal size={16} />
        {t.products.clearFilters || "Filters"}
        {hasActiveFilters && (
          <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {[category, brand, minPrice, maxPrice].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* OVERLAY — затемнення фону на мобільних */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div
        className={`
          // Мобільна версія: виїжджає знизу
          fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-y-0" : "translate-y-full"}
          
          // Десктопна версія: завжди видима, статична позиція
          md:static md:translate-y-0 md:shadow-none md:rounded-none md:z-auto md:bg-transparent
        `}
      >
        {/* Заголовок панелі */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <span className="font-bold text-base">Filters</span>
          <button onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Контент фільтрів (скролиться на мобільних) */}
        <div className="p-4 md:p-0 max-h-[70vh] md:max-h-none overflow-y-auto space-y-8">
          {/* КАТЕГОРІЇ */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">
              {t.products.categories}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCategory("")}
                className={`text-left text-sm py-1 transition-colors ${
                  !category
                    ? "text-red-500 font-bold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {t.products.allCategories}
              </button>
              {meta?.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left text-sm py-1 transition-colors ${
                    category === cat
                      ? "text-red-500 font-bold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* БРЕНДИ */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">
              {t.products.brands}
            </h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {meta?.brands.map((b) => (
                <label
                  key={b}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={activeBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      activeBrands.includes(b)
                        ? "text-black font-medium"
                        : "text-gray-600 group-hover:text-black"
                    }`}
                  >
                    {b}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ЦІНА */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400">
              {t.products.priceRange}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-red-500"
                value={minPrice ?? ""}
                onChange={(e) =>
                  setPriceRange(
                    e.target.value ? Number(e.target.value) : undefined,
                    maxPrice,
                  )
                }
              />
              <span className="text-gray-300 shrink-0">—</span>
              <input
                type="number"
                placeholder="∞"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-red-500"
                value={maxPrice ?? ""}
                onChange={(e) =>
                  setPriceRange(
                    minPrice,
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            {meta?.priceRange && (
              <p className="text-[10px] text-gray-400 mt-1">
                ₴{meta.priceRange.min} — ₴{meta.priceRange.max}
              </p>
            )}
          </div>

          {/* КНОПКА ОЧИЩЕННЯ */}
          <button
            onClick={() => {
              resetFilters();
              setMobileOpen(false);
            }}
            className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-600 transition-colors"
          >
            {t.products.clearFilters}
          </button>
        </div>
      </div>
    </>
  );
}
