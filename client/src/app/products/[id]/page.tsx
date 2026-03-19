"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { IProduct } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import {
  createProductReview,
  deleteProductReview,
  getProductById,
} from "@/lib/api";
import { fetchProducts } from "@/lib/api/products";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

const fetchProduct = async (id: string): Promise<IProduct> =>
  getProductById(id);

const SIMILAR_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "monitor",
  "smartphone",
  "phone",
  "tablet",
  "laptop",
  "watch",
  "wireless",
  "pro",
  "max",
  "ultra",
  "gen",
]);

const tokenizeProductName = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !SIMILAR_STOP_WORDS.has(token));

export default function ProductPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

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
  const [selectedImage, setSelectedImage] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("about-product");
  const [showStickySummary, setShowStickySummary] = useState(false);
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
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: similarProductsData } = useQuery({
    queryKey: [
      "similar-products",
      product?.category,
      product?.brand,
      product?._id,
    ],
    queryFn: async () => {
      if (!product) {
        return { products: [] as IProduct[] };
      }

      const [categoryResponse, brandResponse] = await Promise.all([
        fetchProducts({
          category: product.category,
          pageNumber: 1,
          pageSize: 20,
        }),
        fetchProducts({
          brand: product.brand,
          pageNumber: 1,
          pageSize: 20,
        }),
      ]);

      const mergedProducts = [
        ...categoryResponse.products,
        ...brandResponse.products,
      ];
      const baseTokens = tokenizeProductName(product.name);

      const uniqueProducts = mergedProducts.filter(
        (candidate, index, array) =>
          candidate._id !== product._id &&
          array.findIndex((item) => item._id === candidate._id) === index,
      );

      const scoredProducts = uniqueProducts
        .map((candidate) => {
          const candidateTokens = tokenizeProductName(candidate.name);
          const sharedTokenCount = candidateTokens.filter((token) =>
            baseTokens.includes(token),
          ).length;
          const sameBrand = candidate.brand === product.brand;
          const sameCategory = candidate.category === product.category;

          const score =
            (sameBrand ? 3 : 0) + (sameCategory ? 2 : 0) + sharedTokenCount * 5;

          return {
            candidate,
            score,
            sameBrand,
            sameCategory,
            sharedTokenCount,
          };
        })
        .filter(
          ({ sharedTokenCount, sameBrand, sameCategory }) =>
            sharedTokenCount > 0 || sameBrand || sameCategory,
        )
        .sort((a, b) => b.score - a.score)
        .map(({ candidate }) => candidate);

      return { products: scoredProducts.slice(0, 4) };
    },
    enabled: Boolean(product),
  });

  const hasUserReviewed = useMemo(() => {
    if (!product || !user) return false;
    return product.reviews.some((r) => r.user === user._id);
  }, [product, user]);

  const localizedDescription = useMemo(() => {
    if (!product) return "";
    if (lang === "uk") {
      return (product.descriptionUk || product.description || "").trim();
    }
    return (product.descriptionEn || product.description || "").trim();
  }, [product, lang]);

  const localizedLongDescription = localizedDescription;

  const productImages = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) {
      return product.images.filter(Boolean);
    }
    return product.image ? [product.image] : [];
  }, [product]);

  useEffect(() => {
    setSelectedImage(productImages[0] || "");
  }, [productImages]);

  const similarProducts = similarProductsData?.products || [];
  const characteristicsRows = useMemo(() => {
    if (!product) return [];

    return [
      {
        label: lang === "uk" ? "Бренд" : "Brand",
        values: [product.brand],
      },
      {
        label: lang === "uk" ? "Категорія" : "Category",
        values: [product.category],
      },
      {
        label: lang === "uk" ? "Ціна" : "Price",
        values: [`\u20B4${product.price.toFixed(2)}`],
      },
      {
        label: lang === "uk" ? "Наявність" : "Availability",
        values: [
          product.countInStock > 0
            ? `${t.product.inStock} (${product.countInStock})`
            : t.product.outOfStock,
        ],
      },
      {
        label: lang === "uk" ? "Рейтинг" : "Rating",
        values: [`${product.rating.toFixed(1)} / 5`],
      },
      {
        label: lang === "uk" ? "Відгуки" : "Reviews",
        values: [String(product.numReviews)],
      },
    ];
  }, [lang, product, t.product.inStock, t.product.outOfStock]);
  const productSections = useMemo(
    () => [
      {
        id: "about-product",
        label: lang === "uk" ? "Про товар" : "About Product",
      },
      {
        id: "characteristics",
        label: lang === "uk" ? "Характеристики" : "Characteristics",
      },
      {
        id: "reviews",
        label: lang === "uk" ? "Відгуки та питання" : "Reviews & Questions",
        count: product?.numReviews ?? 0,
      },
      {
        id: "buy-together",
        label: lang === "uk" ? "Купують разом" : "Buy Together",
        count: similarProducts.length,
      },
    ],
    [lang, product?.numReviews, similarProducts.length],
  );

  const selectedImageIndex = Math.max(productImages.indexOf(selectedImage), 0);

  const showImageAtIndex = (index: number) => {
    if (productImages.length === 0) return;
    const normalizedIndex =
      (index + productImages.length) % productImages.length;
    setSelectedImage(productImages[normalizedIndex]);
  };

  const showPrevImage = () => {
    showImageAtIndex(selectedImageIndex - 1);
  };

  const showNextImage = () => {
    showImageAtIndex(selectedImageIndex + 1);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(null);
    setTouchStartX(event.targetTouches[0]?.clientX ?? null);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(event.targetTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) return;

    const swipeDistance = touchStartX - touchEndX;
    if (Math.abs(swipeDistance) < 50) return;

    if (swipeDistance > 0) {
      showNextImage();
    } else {
      showPrevImage();
    }
  };

  useEffect(() => {
    setActiveSectionId("about-product");
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      let currentSection = productSections[0]?.id ?? "about-product";
      const aboutSection = document.getElementById("about-product");

      productSections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (!element) return;

        const top = element.getBoundingClientRect().top;
        if (top <= 150) {
          currentSection = section.id;
        }
      });

      setActiveSectionId(currentSection);

      if (aboutSection) {
        const sectionBottom = aboutSection.getBoundingClientRect().bottom;
        setShowStickySummary(sectionBottom <= 140);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [productSections]);

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
        <button
          onClick={() => router.push("/")}
          className="text-blue-500 hover:underline"
        >
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
      await queryClient.invalidateQueries({ queryKey: ["product", id] });
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
      await queryClient.invalidateQueries({ queryKey: ["product", id] });
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
        href="/products"
        className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-red-500"
      >
        <ArrowLeft size={20} />
        {t.product.backToProducts}
      </Link>

      {toast && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {toast}
        </div>
      )}

      <nav className="sticky top-[calc(var(--site-header-height,72px)+8px)] z-20 mb-10 rounded-2xl border border-gray-200 bg-white/95 px-3 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 py-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-5 sm:gap-7">
              {productSections.map((section) => {
                const isActive = activeSectionId === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      const target = document.getElementById(section.id);
                      if (!target) return;

                      target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      setActiveSectionId(section.id);
                    }}
                    className={`relative whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-700 hover:text-red-600"
                    }`}
                  >
                    {section.label}{" "}
                    {typeof section.count === "number" && (
                      <span className="font-semibold text-gray-900">
                        {section.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {showStickySummary && (
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between xl:min-w-fit xl:border-t-0 xl:pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {"\u20B4"}
                {product.price.toFixed(2)}
              </div>
              <div className="flex gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    const wasFavorite = isFavorite;
                    await toggleFavorite(product, user?.token);
                    showToast(
                      wasFavorite
                        ? t.product.removedFromFavorites
                        : t.product.addedToFavorites,
                    );
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors hover:border-red-500 hover:text-red-500"
                  aria-label={
                    isFavorite
                      ? t.product.inFavorites
                      : t.product.addToFavorites
                  }
                  title={
                    isFavorite
                      ? t.product.inFavorites
                      : t.product.addToFavorites
                  }
                >
                  <Heart
                    size={18}
                    className={isFavorite ? "fill-current text-red-500" : ""}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => addItem(product, user?.token || "")}
                  disabled={product.countInStock === 0}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-black text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300"
                  aria-label={
                    product.countInStock === 0
                      ? t.product.outOfStock
                      : t.product.addToCart
                  }
                  title={
                    product.countInStock === 0
                      ? t.product.outOfStock
                      : t.product.addToCart
                  }
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div
        id="about-product"
        className="scroll-mt-28 grid grid-cols-1 gap-12 md:grid-cols-2"
      >
        <div className="space-y-4">
          <div
            className="relative h-100 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 md:h-150"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage || product.image || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8"
              priority
            />

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow transition hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
                  {productImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-dot-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        selectedImage === imageUrl
                          ? "bg-red-500"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {productImages.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(imageUrl)}
                  className={`relative h-24 overflow-hidden rounded-xl border bg-gray-50 ${
                    selectedImage === imageUrl
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={imageUrl || "/placeholder.png"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
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
            <span className="text-gray-500">
              {product.numReviews} {t.product.reviewsCount}
            </span>
          </div>

          <div className="mb-8 text-4xl font-bold text-black">
            {"\u20B4"}
            {product.price.toFixed(2)}
          </div>

          <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              {lang === "uk" ? "Коротко" : "In Brief"}
            </p>
            <p className="mt-3 leading-relaxed text-gray-700">
              {localizedDescription}
            </p>
          </div>

          <div className="mb-8 border-t border-gray-200 py-6">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">{t.product.status}:</span>
              <span
                className={
                  product.countInStock > 0
                    ? "font-medium text-red-600"
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
                  wasFavorite
                    ? t.product.removedFromFavorites
                    : t.product.addedToFavorites,
                );
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-4 text-lg font-medium text-gray-700 transition-colors hover:border-red-500 hover:text-red-500"
            >
              <Heart
                size={24}
                className={isFavorite ? "fill-current text-red-500" : ""}
              />
              {isFavorite ? t.product.inFavorites : t.product.addToFavorites}
            </button>

            <button
              onClick={() => addItem(product, user?.token || "")}
              disabled={product.countInStock === 0}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-black py-4 text-lg font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={24} />
              {product.countInStock === 0
                ? t.product.outOfStock
                : t.product.addToCart}
            </button>
          </div>
        </div>
      </div>

      <section
        id="about-product-hidden"
        className="hidden scroll-mt-28 mt-2 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
          {lang === "uk" ? "Про товар" : "About Product"}
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
              {localizedLongDescription}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-900">
              {lang === "uk" ? "Основне" : "Highlights"}
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "uk" ? "Бренд" : "Brand"}</span>
                <span className="font-medium text-gray-900">
                  {product.brand}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "uk" ? "Категорія" : "Category"}</span>
                <span className="font-medium text-gray-900">
                  {product.category}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "uk" ? "Рейтинг" : "Rating"}</span>
                <span className="font-medium text-gray-900">
                  {product.rating.toFixed(1)} / 5
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>{lang === "uk" ? "Відгуки" : "Reviews"}</span>
                <span className="font-medium text-gray-900">
                  {product.numReviews}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="characteristics"
        className="scroll-mt-28 mt-8 rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
          {lang === "uk" ? "Характеристики" : "Characteristics"}
        </p>
        <div className="mt-6 rounded-2xl bg-white p-2 sm:p-4">
          <div className="space-y-4">
            {characteristicsRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-2  pb-3 sm:grid-cols-[minmax(180px,420px)_1fr] sm:gap-4"
              >
                <div className="flex items-end gap-3 text-sm text-gray-700 sm:text-base">
                  <span className="shrink-0">{row.label}</span>
                  <span className="hidden h-px flex-1 border-b border-dotted border-gray-300 sm:block" />
                </div>
                <div className="space-y-2 text-sm text-gray-900 sm:text-base">
                  {row.values.map((value, index) => (
                    <div
                      key={`${row.label}-${index}`}
                      className="wrap-break-word"
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="reviews"
        className="scroll-mt-28 mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-xl font-semibold">
            {t.product.reviewsTitle}
          </h2>
          {product.reviews.length === 0 && (
            <p className="text-sm text-gray-500">{t.product.noReviews}</p>
          )}
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review._id || review.user}
                className="rounded border border-gray-100 p-3"
              >
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
                      {reviewDeletingId === review._id
                        ? t.product.removing
                        : t.product.delete}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-xl font-semibold">
            {t.product.writeReview}
          </h2>
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
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {t.product.rating}
                </span>
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
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {t.product.comment}
                </span>
                <textarea
                  className="min-h-28 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </label>

              {reviewError && (
                <p className="text-sm text-red-500">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full rounded bg-black py-2 text-sm text-white hover:bg-red-500 disabled:bg-gray-400"
              >
                {reviewSubmitting
                  ? t.product.submitting
                  : t.product.submitReview}
              </button>
            </form>
          )}
        </div>
      </section>

      <section
        id="buy-together"
        className="scroll-mt-28 mt-14 rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8"
      >
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t.product.similarTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              {t.product.similarSubtitle}
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
          >
            {t.home.seeAll}
          </Link>
        </div>

        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct._id} product={similarProduct} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t.product.noSimilar}</p>
        )}
      </section>
    </div>
  );
}
