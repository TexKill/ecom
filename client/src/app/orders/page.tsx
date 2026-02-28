"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyOrders } from "@/lib/api";
import { IOrder } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function OrdersPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setError(t.orders.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, hasHydrated, router, t.orders.loadFail]);

  if (!hasHydrated || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.account.myAccount, href: "/account" },
          { label: t.orders.title },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{t.orders.title}</h1>

      {loading && <p className="text-gray-500">{t.orders.loading}</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-500">{t.orders.empty}</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-lg border border-gray-200 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{t.orders.order} #{order._id.slice(-8)}</p>
                <p className="text-sm text-gray-500">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString(
                        lang === "uk" ? "uk-UA" : "en-US",
                      )
                    : t.orders.dateUnavailable}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₴{order.totalPrice.toFixed(2)}</p>
                <p className={`text-sm ${order.isPaid ? "text-green-600" : "text-amber-600"}`}>
                  {order.isPaid ? t.orders.paid : t.orders.pending}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
