"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { IProduct } from "@/types";

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product._id));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow duration-300 hover:shadow-lg"
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative h-52 overflow-hidden bg-gray-50">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />

          {product.countInStock === 0 && (
            <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={async () => {
          const wasFavorite = isFavorite;
          await toggleFavorite(product, user?.token);
          showToast(wasFavorite ? "Removed from favorites" : "Added to favorites");
        }}
        className="absolute right-3 top-3 rounded-full bg-white p-1.5 opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={16}
          className={`${isFavorite ? "fill-current text-red-500" : "text-gray-600"} transition-colors duration-200 hover:text-red-500`}
        />
      </button>

      <div className="flex flex-col gap-2 p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-800 transition-colors duration-200 hover:text-red-500">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-red-500">
            ₴{product.price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={
                i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"
              }
            >
              ★
            </span>
          ))}
          <span className="ml-1 text-xs text-gray-400">({product.numReviews})</span>
        </div>

        <button
          onClick={() => addItem(product, user?.token || "")}
          disabled={product.countInStock === 0}
          className="mt-1 flex items-center justify-center gap-2 rounded bg-black py-2 text-sm text-white transition-colors duration-300 hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>

        {toast && (
          <div className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
