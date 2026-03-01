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

type RequiredField =
  | "firstName"
  | "lastName"
  | "streetAddress"
  | "townCity"
  | "phoneNumber"
  | "emailAddress"
  | "postalCode"
  | "country";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { items, shippingAddress, saveShippingAddress, clearCart } = useCartStore();

  const savedAddressParts = shippingAddress.address
    ? shippingAddress.address.split(",").map((part) => part.trim())
    : [];
  const savedStreetAddress = savedAddressParts[0] || "";
  const savedApartment = savedAddressParts.slice(1).join(", ");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetAddress, setStreetAddress] = useState(savedStreetAddress);
  const [apartment, setApartment] = useState(savedApartment);
  const [townCity, setTownCity] = useState(shippingAddress.city || "");
  const [phoneNumber, setPhoneNumber] = useState(shippingAddress.phoneNumber || "");
  const [emailAddress, setEmailAddress] = useState(user?.email || "");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");
  const [country, setCountry] = useState(shippingAddress.country || "");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [couponCode, setCouponCode] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<RequiredField, boolean>>({
    firstName: false,
    lastName: false,
    streetAddress: false,
    townCity: false,
    phoneNumber: false,
    emailAddress: false,
    postalCode: false,
    country: false,
  });

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
    if (user.name) {
      const nameParts = user.name.trim().split(/\s+/).filter(Boolean);
      const derivedFirstName = nameParts[0] || "";
      const derivedLastName = nameParts.slice(1).join(" ");

      if (!firstName && derivedFirstName) {
        setFirstName(derivedFirstName);
      }
      if (!lastName && derivedLastName) {
        setLastName(derivedLastName);
      }
    }
    if (!emailAddress && user.email) {
      setEmailAddress(user.email);
    }
  }, [hasHydrated, user, items.length, router, firstName, lastName, emailAddress]);

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

  const getInputClass = (field: RequiredField) =>
    `w-full rounded border px-4 py-3 outline-none ${
      fieldErrors[field]
        ? "border-red-500 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-gray-50 focus:border-red-400"
    }`;

  const validateRequiredFields = () => {
    const nextErrors: Record<RequiredField, boolean> = {
      firstName: !firstName.trim(),
      lastName: !lastName.trim(),
      streetAddress: !streetAddress.trim(),
      townCity: !townCity.trim(),
      phoneNumber: !phoneNumber.trim(),
      emailAddress:
        !emailAddress.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim()),
      postalCode: !postalCode.trim(),
      country: !country.trim(),
    };

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const placeOrder = async () => {
    if (!validateRequiredFields()) {
      setMessage(t.checkout.orderFail);
      return;
    }

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
          phoneNumber: phoneNumber.trim(),
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
          phoneNumber: phoneNumber.trim(),
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
                className={getInputClass("firstName")}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, firstName: false }));
                  }
                }}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.auth.lastName}*</span>
              <input
                type="text"
                className={getInputClass("lastName")}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (fieldErrors.lastName && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, lastName: false }));
                  }
                }}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.streetAddress}*</span>
              <input
                type="text"
                className={getInputClass("streetAddress")}
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value);
                  if (fieldErrors.streetAddress && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, streetAddress: false }));
                  }
                }}
                placeholder="15 Soniachna St"
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
                placeholder="Apt. 24"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.townCity}*</span>
              <input
                type="text"
                className={getInputClass("townCity")}
                value={townCity}
                onChange={(e) => {
                  setTownCity(e.target.value);
                  if (fieldErrors.townCity && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, townCity: false }));
                  }
                }}
                placeholder="Kyiv"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.phoneNumber}*</span>
              <input
                type="tel"
                className={getInputClass("phoneNumber")}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (fieldErrors.phoneNumber && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, phoneNumber: false }));
                  }
                }}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-500">{t.checkout.emailAddress}*</span>
              <input
                type="email"
                className={getInputClass("emailAddress")}
                value={emailAddress}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmailAddress(value);
                  if (
                    fieldErrors.emailAddress &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ) {
                    setFieldErrors((prev) => ({ ...prev, emailAddress: false }));
                  }
                }}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-500">{t.checkout.postalCode}*</span>
                <input
                  type="text"
                  className={getInputClass("postalCode")}
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (fieldErrors.postalCode && e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, postalCode: false }));
                    }
                  }}
                  placeholder="03150"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-500">{t.checkout.country}*</span>
                <input
                  type="text"
                  className={getInputClass("country")}
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (fieldErrors.country && e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, country: false }));
                    }
                  }}
                  placeholder="Ukraine"
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

