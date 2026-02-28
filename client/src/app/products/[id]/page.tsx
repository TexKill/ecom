"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { IProduct } from "@/types";
import { getProductById } from "@/lib/api";

const fetchProduct = async (id: string): Promise<IProduct> => getProductById(id);

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(id));
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

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-500" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-4 text-2xl font-bold">Product Not Found</h2>
        <button onClick={() => router.push("/")} className="text-blue-500 hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-red-500"
      >
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative h-100 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 md:h-150">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8"
            priority
          />
        </div>

        <div className="flex flex-col">
          {toast && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {toast}
            </div>
          )}

          <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mb-6 text-lg text-gray-500">{product.brand}</p>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.round(product.rating)
                      ? "fill-current text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-gray-500">{product.numReviews} reviews</span>
          </div>

          <div className="mb-8 text-4xl font-bold text-red-500">₴{product.price.toFixed(2)}</div>

          <p className="mb-8 leading-relaxed text-gray-700">{product.description}</p>

          <div className="mb-8 border-t border-gray-200 py-6">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Status:</span>
              <span
                className={
                  product.countInStock > 0
                    ? "font-medium text-green-600"
                    : "font-medium text-red-600"
                }
              >
                {product.countInStock > 0
                  ? `In Stock (${product.countInStock})`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={async () => {
                const wasFavorite = isFavorite;
                await toggleFavorite(product, user?.token);
                showToast(wasFavorite ? "Removed from favorites" : "Added to favorites");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-4 text-lg font-medium text-gray-700 transition-colors hover:border-red-500 hover:text-red-500"
            >
              <Heart size={24} className={isFavorite ? "fill-current text-red-500" : ""} />
              {isFavorite ? "In Favorites" : "Add to Favorites"}
            </button>

            <button
              onClick={() => addItem(product, user?.token || "")}
              disabled={product.countInStock === 0}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-black py-4 text-lg font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={24} />
              {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
