"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import CheckoutSteps from "@/components/CheckoutSteps";

export default function ShippingPage() {
  const router = useRouter();

  // Wait for hydration
  const isHydrated = useSyncExternalStore(
    (subscribe) => {
      window.addEventListener("storage", subscribe);
      return () => window.removeEventListener("storage", subscribe);
    },
    () => true,
    () => false,
  );

  const { user } = useAuthStore();
  const { shippingAddress, saveShippingAddress } = useCartStore();

  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || "",
  );
  const [country, setCountry] = useState(shippingAddress?.country || "");

  // Protect route properly
  useEffect(() => {
    // Only check authentication AFTER hydration is complete
    if (isHydrated && !user) {
      router.replace("/login?redirect=/shipping");
    }
  }, [user, isHydrated, router]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    saveShippingAddress({ address, city, postalCode, country });
    router.push("/placeorder");
  };

  // Prevent flicker or form rendering if not hydrated or not logged in
  if (!isHydrated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <CheckoutSteps step1 step2 />

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="123 Main St"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Kyiv"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Ukraine"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-red-500 transition-colors mt-6"
          >
            Continue to Order
          </button>
        </form>
      </div>
    </div>
  );
}
