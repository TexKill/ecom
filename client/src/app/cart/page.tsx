"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, clearCart, totalPrice, totalQty } =
    useCartStore();
  const user = useAuthStore((s) => s.user);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-red-500 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => clearCart(user?.token || "")} // FIXED
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm"
            >
              {/* Product Image */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-md overflow-hidden shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  sizes="128px"
                  className="object-contain p-2"
                />
              </div>

              {/* Product Info & Controls */}
              <div className="flex flex-col justify-between grow">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <Link href={`/products/${item._id}`}>
                      <h3 className="font-medium text-gray-900 hover:text-red-500 line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(item._id, user?.token || "")} // FIXED
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button
                      onClick={() =>
                        updateQty(item._id, item.qty - 1, user?.token || "")
                      } // FIXED
                      className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                      disabled={item.qty <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium text-sm">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item._id, item.qty + 1, user?.token || "")
                      } // FIXED
                      className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                      disabled={item.qty >= item.countInStock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <span className="font-bold text-lg text-gray-900">
                    ₴{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalQty()} items)</span>
                <span>₴{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-red-500">₴{totalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (user) {
                  router.push("/shipping");
                } else {
                  router.push("/login?redirect=/shipping");
                }
              }}
              className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-red-500 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
