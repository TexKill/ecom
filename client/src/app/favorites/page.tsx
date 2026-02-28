"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function FavoritesPage() {
  const { t } = useLanguage();
  const user = useAuthStore((s) => s.user);
  const items = useFavoritesStore((s) => s.items);
  const loadFavoritesFromServer = useFavoritesStore((s) => s.loadFavoritesFromServer);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);
  const addToCart = useCartStore((s) => s.addItem);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2200);
  };

  useEffect(() => {
    if (user?.token) {
      loadFavoritesFromServer(user.token);
    }
  }, [user?.token, loadFavoritesFromServer]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const handleClearAll = async () => {
    await clearFavorites(user?.token);
    showToast(t.favorites.cleared);
  };

  const handleMoveAllToCart = async () => {
    for (const item of items) {
      addToCart(
        {
          _id: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          countInStock: item.countInStock,
          brand: "",
          category: "",
          description: "",
          reviews: [],
          rating: 0,
          numReviews: 0,
        },
        user?.token || "",
      );
    }
    await clearFavorites(user?.token);
    showToast(t.favorites.movedToCart);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.header.products, href: "/products" },
          { label: t.favorites.title },
        ]}
      />

      {toast && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.favorites.title}</h1>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleMoveAllToCart}
              className="text-sm font-medium text-black hover:text-red-600"
            >
              {t.favorites.moveAllToCart}
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm font-medium text-red-500 hover:text-red-700"
            >
              {t.favorites.clearAll}
            </button>
          </div>
        )}
      </div>

      {!user && (
        <p className="mb-4 text-sm text-gray-500">
          {t.favorites.guestHint}{" "}
          <Link href="/login?redirect=/favorites" className="text-red-500 underline">
            {t.favorites.signIn}
          </Link>{" "}
          {t.favorites.syncHint}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="text-gray-600">{t.favorites.empty}</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded bg-black px-5 py-2 text-white hover:bg-red-500"
          >
            {t.favorites.browseProducts}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
            >
              <Link href={`/products/${item.productId}`} className="relative h-24 w-24 shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="rounded object-contain bg-gray-50 p-2"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="line-clamp-2 font-medium hover:text-red-500"
                >
                  {item.name}
                </Link>
                <p className="mt-1 font-semibold text-red-500">₴{item.price.toFixed(2)}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {item.countInStock > 0
                    ? `${t.favorites.inStock}: ${item.countInStock}`
                    : t.favorites.outOfStock}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    addToCart(
                      {
                        _id: item.productId,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        countInStock: item.countInStock,
                        brand: "",
                        category: "",
                        description: "",
                        reviews: [],
                        rating: 0,
                        numReviews: 0,
                      },
                      user?.token || "",
                    )
                  }
                  disabled={item.countInStock === 0}
                  aria-label={t.favorites.addAria}
                  className="rounded bg-black px-3 py-2 text-xs text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <span className="inline-flex items-center gap-1">
                    <ShoppingCart size={14} />
                    {t.favorites.add}
                  </span>
                </button>
                <button
                  onClick={async () => {
                    await removeFavorite(item.productId, user?.token);
                    showToast(t.favorites.removed);
                  }}
                  className="rounded border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:border-red-500 hover:text-red-500"
                >
                  <span className="inline-flex items-center gap-1">
                    <Trash2 size={14} />
                    {t.favorites.remove}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
