"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/api";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { items, shippingAddress, saveShippingAddress, clearCart } = useCartStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetAddress, setStreetAddress] = useState(shippingAddress.address || "");
  const [apartment, setApartment] = useState("");
  const [townCity, setTownCity] = useState(shippingAddress.city || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState(user?.email || "");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "00000");
  const [country, setCountry] = useState(
    shippingAddress.country || (lang === "uk" ? "Україна" : "Ukraine"),
  );
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [couponCode, setCouponCode] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    if (!firstName && user.name) {
      setFirstName(user.name.split(" ")[0] || user.name);
    }
    if (!emailAddress && user.email) {
      setEmailAddress(user.email);
    }
  }, [hasHydrated, user, items.length, router, firstName, emailAddress]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const shippingPrice = subtotal > 100 ? 0 : 10;
  const total = subtotal + shippingPrice;

  if (!hasHydrated || !user || items.length === 0) return null;

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setMessage(t.checkout.couponEnter);
      return;
    }
    setMessage(t.checkout.couponNext);
  };

  const placeOrder = async () => {
    try {
      setSubmitting(true);
      setMessage("");

      const address = apartment.trim()
        ? `${streetAddress.trim()}, ${apartment.trim()}`
        : streetAddress.trim();

      if (saveInfo) {
        saveShippingAddress({
          address,
          city: townCity.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        });
      }

      await createOrder({
        orderItems: items.map((item) => ({
          product: item._id,
          qty: item.qty,
          name: item.name,
          image: item.image,
          price: item.price,
        })),
        shippingAddress: {
          address,
          city: townCity.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        paymentMethod:
          paymentMethod === "bank" ? "bank_transfer" : "cash_on_delivery",
      });

      await clearCart(user.token);
      router.push("/orders");
    } catch {
      setMessage(t.checkout.orderFail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: t.checkout.account, href: "/account" },
          { label: t.checkout.myAccount, href: "/account" },
          { label: t.checkout.product, href: "/products" },
          { label: t.checkout.viewCart, href: "/cart" },
          { label: t.checkout.checkout },
        ]}
      />

      {message && (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-gray-900">
            {t.checkout.billingDetails}
          </h1>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.auth.firstName}*</span>
              <input
                type="text"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.auth.lastName}*</span>
              <input
                type="text"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.streetAddress}*</span>
              <input
                type="text"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.apartment}</span>
              <input
                type="text"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.townCity}*</span>
              <input
                type="text"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={townCity}
                onChange={(e) => setTownCity(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.phoneNumber}*</span>
              <input
                type="tel"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.emailAddress}*</span>
              <input
                type="email"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-500">{t.checkout.postalCode}*</span>
                <input
                  type="text"
                  className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-500">{t.checkout.country}*</span>
                <input
                  type="text"
                  className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-400"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="h-4 w-4 accent-red-500"
              />
              {t.checkout.saveInfo}
            </label>
          </div>
        </section>

        <section className="lg:pl-10">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="text-sm text-gray-800">
                    {item.name} <span className="text-gray-500">x {item.qty}</span>
                  </p>
                </div>
                <p className="text-sm font-medium">₴{(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span>{t.checkout.subtotal}:</span>
              <span>₴{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span>{t.checkout.shipping}:</span>
              <span>{shippingPrice === 0 ? t.checkout.free : `₴${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t.checkout.total}:</span>
              <span>₴{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                className="h-4 w-4 accent-black"
              />
              <span>{t.checkout.bank}</span>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "cash_on_delivery"}
                onChange={() => setPaymentMethod("cash_on_delivery")}
                className="h-4 w-4 accent-black"
              />
              <span>{t.checkout.cod}</span>
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder={t.checkout.couponCode}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="rounded border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-400"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="rounded bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-600"
            >
              {t.checkout.applyCoupon}
            </button>
          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting}
            className="mt-5 rounded bg-red-500 px-8 py-3 text-sm font-medium text-white hover:bg-red-600 disabled:bg-gray-400"
          >
            {submitting ? t.checkout.placing : t.checkout.placeOrder}
          </button>

          <p className="mt-4 text-xs text-gray-500">{t.checkout.terms}</p>
          <p className="mt-1 text-xs text-gray-500">
            {t.checkout.needEdit}{" "}
            <Link href="/cart" className="underline">
              {t.checkout.goBackToCart}
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
