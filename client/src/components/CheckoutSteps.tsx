"use client"; // Required because we are using a store hook

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useSyncExternalStore } from "react";

interface Props {
  step1?: boolean;
  step2?: boolean;
  step3?: boolean;
}

export default function CheckoutSteps({ step1, step2, step3 }: Props) {
  // Hydration-safe store read
  const isHydrated = useSyncExternalStore(
    (subscribe) => {
      window.addEventListener("storage", subscribe);
      return () => window.removeEventListener("storage", subscribe);
    },
    () => true,
    () => false,
  );

  const { user } = useAuthStore();

  // If we haven't hydrated yet, don't show the bar to prevent layout shift
  if (!isHydrated) return <div className="h-6 mb-8"></div>;

  return (
    <nav className="flex justify-center mb-8">
      <ol className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
        {/* Only show "Sign In" step if the user is NOT logged in */}
        {!user && (
          <>
            <li>
              {step1 ? (
                <Link
                  href="/login?redirect=/shipping"
                  className="text-red-500 font-medium hover:underline"
                >
                  Sign In
                </Link>
              ) : (
                <span className="text-gray-400">Sign In</span>
              )}
            </li>
            <span className="text-gray-300">/</span>
          </>
        )}

        <li>
          {step2 ? (
            <Link
              href="/shipping"
              className="text-red-500 font-medium hover:underline"
            >
              Shipping
            </Link>
          ) : (
            <span className="text-gray-400">Shipping</span>
          )}
        </li>
        <span className="text-gray-300">/</span>
        <li>
          {step3 ? (
            <Link
              href="/placeorder"
              className="text-red-500 font-medium hover:underline"
            >
              Place Order
            </Link>
          ) : (
            <span className="text-gray-400">Place Order</span>
          )}
        </li>
      </ol>
    </nav>
  );
}
