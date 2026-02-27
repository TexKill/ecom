"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Star, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { IProduct } from "@/types";
import axios from "axios";

// function to fetch product details by ID
const fetchProduct = async (id: string): Promise<IProduct> => {
  const { data } = await axios.get(`http://localhost:9000/api/products/${id}`);
  return data;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const addItem = useCartStore((s) => s.addItem);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <button
          onClick={() => router.push("/")}
          className="text-blue-500 hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column - image */}
        <div className="relative h-100 md:h-150 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Right column - Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-gray-500 text-lg mb-6">{product.brand}</p>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.round(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-gray-500">{product.numReviews} reviews</span>
          </div>

          <div className="text-4xl font-bold text-red-500 mb-8">
            ₴{product.price.toFixed(2)}
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="border-t border-gray-200 py-6 mb-8">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Status:</span>
              <span
                className={
                  product.countInStock > 0
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {product.countInStock > 0
                  ? `In Stock (${product.countInStock})`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => {
              addItem(product);
              // Optionally, you can show a toast notification here
            }}
            disabled={product.countInStock === 0}
            className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-lg text-lg font-medium hover:bg-red-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={24} />
            {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
