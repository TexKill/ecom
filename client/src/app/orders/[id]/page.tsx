"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { getOrderById } from "@/lib/api";
import { getOrderStatusMeta } from "@/lib/orderStatus";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuthStore } from "@/store/authStore";
import { IOrder } from "@/types";

export default function OrderDetailsPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const id = params?.id as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace(`/login?redirect=/orders/${id}`);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getOrderById(id);
        setOrder(data);
      } catch {
        setError(t.orders.loadFail);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      setLoading(false);
      setError(t.orders.loadFail);
    }
  }, [id, user, hasHydrated, router, t.orders.loadFail]);

  if (!hasHydrated || !user) return null;
  const statusMeta = order ? getOrderStatusMeta(order.status, t.orders) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.account.myAccount, href: "/account" },
          { label: t.orders.title, href: "/orders" },
          { label: order ? `${t.orders.order} #${order._id.slice(-8)}` : t.orders.order },
        ]}
      />

      {loading && <p className="text-gray-500">{t.orders.loading}</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && !error && order && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {t.orders.order} #{order._id.slice(-8)}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString(
                        lang === "uk" ? "uk-UA" : "en-US",
                      )
                    : t.orders.dateUnavailable}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-xs text-gray-500">{t.orders.status}</p>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusMeta?.badgeClass}`}
                >
                  {statusMeta?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold">{t.checkout.shipping}</h2>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phoneNumber && <p>{order.shippingAddress.phoneNumber}</p>}
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold">{t.checkout.product}</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={`${item.product}-${item.name}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product}`}
                            className="line-clamp-2 text-sm font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-500">x{item.qty}</p>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-gray-800">
                        {"\u20B4"}{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold">{t.cart.orderSummary}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t.checkout.total}</span>
                    <span className="font-semibold">{"\u20B4"}{order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t.checkout.shipping}</span>
                    <span>
                      {order.shippingPrice === 0
                        ? t.checkout.free
                        : `${"\u20B4"}${order.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <p>
                      {t.checkout.cod}: {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="mb-4 text-lg font-semibold">{t.orders.status}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.orders.paymentStatus}</span>
                    <span className={order.isPaid ? "text-green-600" : "text-amber-600"}>
                      {order.isPaid ? t.orders.paid : t.orders.unpaid}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-600">{t.orders.deliveryStatus}</span>
                    <span className={order.isDelivered ? "text-green-600" : "text-amber-600"}>
                      {order.isDelivered ? t.admin.yes : t.admin.no}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
