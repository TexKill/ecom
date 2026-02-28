"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { IProduct } from "@/types";
import { createProductReview, deleteProductReview, getProductById } from "@/lib/api";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

const fetchProduct = async (id: string): Promise<IProduct> => getProductById(id);
const decodeMojibake = (value: string) => {
  if (!/[ÐÑÃ]/.test(value)) return value;
  try {
    const bytes = Uint8Array.from([...value].map((ch) => ch.charCodeAt(0) & 0xff));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return value;
  }
};

export default function ProductPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(id));

  const [toast, setToast] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewDeletingId, setReviewDeletingId] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  const hasUserReviewed = useMemo(() => {
    if (!product || !user) return false;
    return product.reviews.some((r) => r.user === user._id);
  }, [product, user]);

  const localizedDescription = useMemo(() => {
    if (!product) return "";
    if (lang === "uk") {
      return decodeMojibake((product.descriptionUk || product.description || "").trim());
    }
    return decodeMojibake((product.descriptionEn || product.description || "").trim());
  }, [product, lang]);

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
        <h2 className="mb-4 text-2xl font-bold">{t.product.notFound}</h2>
        <button onClick={() => router.push("/")} className="text-blue-500 hover:underline">
          {t.product.returnHome}
        </button>
      </div>
    );
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setReviewSubmitting(true);
      setReviewError("");
      await createProductReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment("");
      setReviewRating(5);
      await refetch();
      showToast(t.product.submitSuccess);
    } catch {
      setReviewError(t.product.submitFail);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const removeReview = async (reviewId?: string) => {
    if (!reviewId || !user?.isAdmin) return;
    try {
      setReviewDeletingId(reviewId);
      setReviewError("");
      await deleteProductReview(product._id, reviewId);
      await refetch();
      showToast(t.product.removeSuccess);
    } catch {
      setReviewError(t.product.removeFail);
    } finally {
      setReviewDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.header.products, href: "/products" },
          { label: product.name },
        ]}
      />

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-red-500"
      >
        <ArrowLeft size={20} />
        {t.product.backToProducts}
      </Link>

      {toast && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {toast}
        </div>
      )}

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
            <span className="text-gray-500">{product.numReviews} {t.product.reviewsCount}</span>
          </div>

          <div className="mb-8 text-4xl font-bold text-red-500">{"\u20B4"}{product.price.toFixed(2)}</div>

          <p className="mb-8 leading-relaxed text-gray-700">{localizedDescription}</p>

          <div className="mb-8 border-t border-gray-200 py-6">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">{t.product.status}:</span>
              <span
                className={
                  product.countInStock > 0
                    ? "font-medium text-green-600"
                    : "font-medium text-red-600"
                }
              >
                {product.countInStock > 0
                  ? `${t.product.inStock} (${product.countInStock})`
                  : t.product.outOfStock}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={async () => {
                const wasFavorite = isFavorite;
                await toggleFavorite(product, user?.token);
                showToast(
                  wasFavorite ? t.product.removedFromFavorites : t.product.addedToFavorites,
                );
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-4 text-lg font-medium text-gray-700 transition-colors hover:border-red-500 hover:text-red-500"
            >
              <Heart size={24} className={isFavorite ? "fill-current text-red-500" : ""} />
              {isFavorite ? t.product.inFavorites : t.product.addToFavorites}
            </button>

            <button
              onClick={() => addItem(product, user?.token || "")}
              disabled={product.countInStock === 0}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-black py-4 text-lg font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={24} />
              {product.countInStock === 0 ? t.product.outOfStock : t.product.addToCart}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-xl font-semibold">{t.product.reviewsTitle}</h2>
          {product.reviews.length === 0 && (
            <p className="text-sm text-gray-500">{t.product.noReviews}</p>
          )}
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review._id || review.user} className="rounded border border-gray-100 p-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="font-medium">{review.name}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(review.rating)
                            ? "fill-current text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString(
                          lang === "uk" ? "uk-UA" : "en-US",
                        )
                      : ""}
                  </span>
                  {user?.isAdmin && review._id && (
                    <button
                      onClick={() => removeReview(review._id)}
                      disabled={reviewDeletingId === review._id}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:text-gray-400"
                    >
                      <Trash2 size={12} />
                      {reviewDeletingId === review._id ? t.product.removing : t.product.delete}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-xl font-semibold">{t.product.writeReview}</h2>
          {!user && (
            <p className="text-sm text-gray-600">
              {t.product.please}{" "}
              <Link
                href={`/login?redirect=/products/${product._id}`}
                className="text-red-500 underline"
              >
                {t.product.signIn}
              </Link>{" "}
              {t.product.toLeaveReview}
            </p>
          )}

          {user && hasUserReviewed && (
            <p className="text-sm text-gray-600">{t.product.alreadyReviewed}</p>
          )}

          {user && !hasUserReviewed && (
            <form onSubmit={submitReview} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">{t.product.rating}</span>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value={5}>{t.product.ratingExcellent}</option>
                  <option value={4}>{t.product.ratingGood}</option>
                  <option value={3}>{t.product.ratingAverage}</option>
                  <option value={2}>{t.product.ratingPoor}</option>
                  <option value={1}>{t.product.ratingBad}</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">{t.product.comment}</span>
                <textarea
                  className="min-h-28 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </label>

              {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full rounded bg-black py-2 text-sm text-white hover:bg-red-500 disabled:bg-gray-400"
              >
                {reviewSubmitting ? t.product.submitting : t.product.submitReview}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}


