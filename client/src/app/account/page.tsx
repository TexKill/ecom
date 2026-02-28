"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function AccountPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace("/login?redirect=/account");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.account.myAccount },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{t.account.title}</h1>

      <div className="rounded-xl border border-gray-200 p-6">
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold">{t.account.name}:</span> {user.name}
          </p>
          <p>
            <span className="font-semibold">{t.account.email}:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">{t.account.role}:</span>{" "}
            {user.isAdmin ? t.account.admin : t.account.customer}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            {t.account.myOrders}
          </Link>
          {user.isAdmin && (
            <Link
              href="/admin"
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-black"
            >
              {t.account.adminDashboard}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
