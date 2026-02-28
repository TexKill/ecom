"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

const UAH = "\u20B4";

export default function CartPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, removeItem, updateQty, clearCart, totalPrice, totalQty } =
    useCartStore();
  const user = useAuthStore((s) => s.user);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">{t.cart.empty}</h2>
        <p className="mb-8 text-gray-500">{t.cart.emptySubtitle}</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-black px-8 py-3 text-white transition-colors hover:bg-red-500"
        >
          {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.header.products, href: "/products" },
          { label: t.cart.viewCart },
        ]}
      />

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-red-500"
      >
        <ArrowLeft size={20} />
        {t.cart.continueShopping}
      </Link>

      <h1 className="mb-8 text-3xl font-bold">{t.cart.title}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => clearCart(user?.token || "")}
              className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
              {t.cart.clear}
            </button>
          </div>

          {items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-50 sm:h-32 sm:w-32">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  sizes="128px"
                  className="object-contain p-2"
                />
              </div>

              <div className="flex grow flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/products/${item._id}`}>
                      <h3 className="line-clamp-2 font-medium text-gray-900 hover:text-red-500">
                        {item.name}
                      </h3>
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(item._id, user?.token || "")}
                    className="p-1 text-gray-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="flex items-center rounded-md border border-gray-200">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1, user?.token || "")}
                      className="p-2 text-gray-600 transition-colors hover:bg-gray-50"
                      disabled={item.qty <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-sm font-medium">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1, user?.token || "")}
                      className="p-2 text-gray-600 transition-colors hover:bg-gray-50"
                      disabled={item.qty >= item.countInStock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <span className="text-lg font-bold text-gray-900">
                    {UAH}{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-gray-100 bg-gray-50 p-6">
            <h2 className="mb-6 text-xl font-bold">{t.cart.orderSummary}</h2>

            <div className="mb-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>
                  {t.cart.subtotal} ({totalQty()} {t.cart.items})
                </span>
                <span>{UAH}{totalPrice().toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-[auto,1fr] items-start gap-x-3 text-gray-600">
                <span className="shrink-0">{t.cart.shipping}:</span>
                <span className="justify-self-end max-w-[170px] text-right leading-5">
                  {t.cart.shippingAtCheckout}
                </span>
              </div>
            </div>

            <div className="mb-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>{t.cart.total}</span>
                <span className="text-red-500">{UAH}{totalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (user) {
                  router.push("/checkout");
                } else {
                  router.push("/login?redirect=/checkout");
                }
              }}
              className="w-full rounded-lg bg-black py-4 font-medium text-white transition-colors hover:bg-red-500"
            >
              {t.cart.proceed}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
