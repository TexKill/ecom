"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useSyncExternalStore } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface Props {
  step1?: boolean;
  step2?: boolean;
  step3?: boolean;
}

export default function CheckoutSteps({ step1, step2, step3 }: Props) {
  const { t } = useLanguage();
  const isHydrated = useSyncExternalStore(
    (subscribe) => {
      window.addEventListener("storage", subscribe);
      return () => window.removeEventListener("storage", subscribe);
    },
    () => true,
    () => false,
  );

  const { user } = useAuthStore();

  if (!isHydrated) return <div className="h-6 mb-8"></div>;

  return (
    <nav className="flex justify-center mb-8">
      <ol className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
        {!user && (
          <>
            <li>
              {step1 ? (
                <Link
                  href="/login?redirect=/checkout"
                  className="text-red-500 font-medium hover:underline"
                >
                  {t.steps.signIn}
                </Link>
              ) : (
                <span className="text-gray-400">{t.steps.signIn}</span>
              )}
            </li>
            <span className="text-gray-300">/</span>
          </>
        )}

        <li>
          {step2 ? (
            <Link href="/shipping" className="text-red-500 font-medium hover:underline">
              {t.steps.shipping}
            </Link>
          ) : (
            <span className="text-gray-400">{t.steps.shipping}</span>
          )}
        </li>
        <span className="text-gray-300">/</span>
        <li>
          {step3 ? (
            <Link href="/placeorder" className="text-red-500 font-medium hover:underline">
              {t.steps.placeOrder}
            </Link>
          ) : (
            <span className="text-gray-400">{t.steps.placeOrder}</span>
          )}
        </li>
      </ol>
    </nav>
  );
}
