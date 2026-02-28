"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/api";

export default function PlaceOrderPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { items, shippingAddress, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const itemsPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + shippingPrice;

  useEffect(() => {
    if (!user) {
      router.replace("/login?redirect=/placeorder");
      return;
    }
    if (!shippingAddress?.address) {
      router.replace("/shipping");
      return;
    }
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [user, shippingAddress?.address, items.length, router]);

  if (!user || !shippingAddress?.address || items.length === 0) {
    return null;
  }

  const placeOrderHandler = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      await createOrder({
        orderItems: items.map((item) => ({
          product: item._id,
          qty: item.qty,
          name: item.name,
          image: item.image,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod: "card",
      });

      await clearCart(user.token);
      router.push("/");
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CheckoutSteps step1 step2 step3 />

      <h1 className="text-2xl font-bold mb-6">Place Order</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold mb-2">Shipping</h2>
            <p className="text-sm text-gray-600">
              {shippingAddress.address}, {shippingAddress.city},{" "}
              {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Order Items</h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.qty}
                  </span>
                  <span>₴{(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 h-fit">
          <h2 className="font-semibold mb-4">Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Items</span>
              <span>₴{itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₴{shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>₴{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={placeOrderHandler}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black py-3 text-white hover:bg-red-500 disabled:bg-gray-400"
          >
            {isSubmitting ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
