"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPromoCode,
  createProduct,
  deletePromoCode,
  deleteOrder,
  deleteProduct,
  getAdminOrderStats,
  getAllOrders,
  getPaymentLogs,
  getPromoCodes,
  getProducts,
  ProductPayload,
  restockProductsRandom,
  uploadProductImage,
  updatePromoCode,
  updateOrderStatus,
  updateProduct,
} from "@/lib/api";
import {
  IOrder,
  IProduct,
  IUser,
  OrderStatus,
  IPaymentLog,
  IPromoCode,
} from "@/types";
import { useAuthStore } from "@/store/authStore";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";
import Pagination from "@/components/ui/Pagination";
import { getOrderStatusMeta } from "@/lib/orderStatus";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { getCategoryLabel } from "@/lib/categoryLabels";

const emptyForm: ProductPayload = {
  name: "",
  price: 0,
  description: "",
  descriptionUk: "",
  descriptionEn: "",
  image: "",
  images: [],
  brand: "",
  category: "",
  countInStock: 0,
};

type PromoFormState = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt: string;
};

const emptyPromoForm: PromoFormState = {
  code: "",
  type: "percent",
  value: 10,
  minOrderAmount: 0,
  isActive: true,
  expiresAt: "",
};

type AdminTab = "products" | "orders" | "payments" | "promos";
const isAdminTab = (value: string): value is AdminTab =>
  value === "products" ||
  value === "orders" ||
  value === "payments" ||
  value === "promos";

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [tab, setTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<IPaymentLog[]>([]);
  const [promoCodes, setPromoCodes] = useState<IPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{
    totalOrders: number;
    paidOrders: number;
    unpaidOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    paidRevenue: number;
    averageOrderValue: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentDateFrom, setPaymentDateFrom] = useState("");
  const [paymentDateTo, setPaymentDateTo] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmText: string;
    danger?: boolean;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [promoEditingId, setPromoEditingId] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState<PromoFormState>(emptyPromoForm);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadFailMsg = t.admin.loadFail;

  const getPromoAdminErrorMessage = (rawMessage?: string) => {
    if (!rawMessage) return t.admin.actionFailed;
    if (rawMessage === "Promo code already exists") return t.admin.promoExists;
    if (rawMessage === "Validation failed") return t.admin.actionFailed;
    return rawMessage;
  };

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (!user.isAdmin) {
      router.replace("/");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (tab === "products") {
          const productsRes = await getProducts("", page, 15);
          setProducts(productsRes.products);
          setTotalPages(productsRes.pages);
        }

        if (tab === "orders") {
          const ordersRes = await getAllOrders(orderPage);
          setOrders(ordersRes.orders);
          setOrderTotalPages(ordersRes.pages);
        }

        if (tab === "payments") {
          const logsRes = await getPaymentLogs({
            page: paymentPage,
            status: paymentStatusFilter || undefined,
            dateFrom: paymentDateFrom || undefined,
            dateTo: paymentDateTo || undefined,
          });
          setPaymentLogs(logsRes.logs);
          setPaymentTotalPages(logsRes.pages);
        }

        if (tab === "promos") {
          const promoCodesRes = await getPromoCodes();
          setPromoCodes(promoCodesRes);
        }

        const statsRes = await getAdminOrderStats();
        setStats(statsRes);
      } catch {
        setError(loadFailMsg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    hasHydrated,
    user,
    router,
    tab,
    page,
    orderPage,
    paymentPage,
    paymentStatusFilter,
    paymentDateFrom,
    paymentDateTo,
    loadFailMsg,
  ]);

  useEffect(() => {
    setPaymentPage(1);
  }, [paymentStatusFilter, paymentDateFrom, paymentDateTo]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), 4000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    const queryTab = searchParams.get("tab");
    if (queryTab && isAdminTab(queryTab)) {
      setTab(queryTab);
      if (typeof window !== "undefined") {
        localStorage.setItem("adminTab", queryTab);
      }
      return;
    }

    if (typeof window === "undefined") return;
    const savedTab = localStorage.getItem("adminTab");
    if (savedTab && isAdminTab(savedTab)) {
      setTab(savedTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", savedTab);
      router.replace(`/admin?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  const handleTabChange = (nextTab: AdminTab) => {
    setTab(nextTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminTab", nextTab);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToast({ message, type });
  };

  const openConfirm = (config: {
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
    onConfirm: () => Promise<void>;
  }) => {
    setConfirmState({
      title: config.title,
      message: config.message,
      confirmText: config.confirmText || t.admin.confirmAction,
      danger: config.danger,
      onConfirm: config.onConfirm,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    try {
      setConfirmLoading(true);
      await confirmState.onConfirm();
      setConfirmState(null);
    } catch {
      showToast(t.admin.actionFailed, "error");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!hasHydrated || !user || !user.isAdmin) return null;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageUrlInput("");
  };

  const resetPromoForm = () => {
    setPromoEditingId(null);
    setPromoForm(emptyPromoForm);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const fallbackShortDescription = (
      form.descriptionEn ||
      form.descriptionUk ||
      form.description
    ).trim();
    if (!fallbackShortDescription) {
      showToast(t.admin.saveFail, "error");
      return;
    }

    if (form.images.length === 0) {
      showToast(t.admin.saveFail, "error");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: ProductPayload = {
        ...form,
        image: form.images[0] || form.image,
        images: form.images,
        description: fallbackShortDescription,
        descriptionUk: form.descriptionUk?.trim() || fallbackShortDescription,
        descriptionEn: form.descriptionEn?.trim() || fallbackShortDescription,
      };

      if (editingId) {
        const updated = await updateProduct(editingId, payload);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        showToast(t.admin.productUpdated, "success");
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        showToast(t.admin.productCreated, "success");
      }
      resetForm();
    } catch {
      showToast(t.admin.saveFail, "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: IProduct) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      descriptionUk: product.descriptionUk || product.description,
      descriptionEn: product.descriptionEn || product.description,
      image: product.image,
      images:
        product.images?.length && product.images[0]
          ? product.images
          : product.image
            ? [product.image]
            : [],
      brand: product.brand,
      category: product.category,
      countInStock: product.countInStock,
    });
    setImageUrlInput("");
  };

  const syncImages = (images: string[]) => {
    setForm((prev) => ({
      ...prev,
      images,
      image: images[0] || "",
    }));
  };

  const addImageUrl = () => {
    const normalizedUrl = imageUrlInput.trim();
    if (!normalizedUrl) return;
    if (form.images.includes(normalizedUrl)) {
      setImageUrlInput("");
      return;
    }
    syncImages([...form.images, normalizedUrl]);
    setImageUrlInput("");
  };

  const removeImage = (imageUrl: string) => {
    syncImages(form.images.filter((item) => item !== imageUrl));
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    try {
      setUploadingImage(true);
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        uploadedUrls.push(url);
      }
      syncImages(
        [...form.images, ...uploadedUrls].filter(
          (url, index, arr) => arr.indexOf(url) === index,
        ),
      );
      showToast(t.admin.imageUploaded, "success");
    } catch {
      showToast(t.admin.uploadFail, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    openConfirm({
      title: t.admin.confirmDeleteProductTitle,
      message: t.admin.confirmDeleteProductMessage.replace("{name}", name),
      confirmText: t.admin.delete,
      danger: true,
      onConfirm: async () => {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        if (editingId === id) resetForm();
        showToast(t.admin.productDeleted, "success");
      },
    });
  };

  const handleDeleteOrder = (id: string) => {
    openConfirm({
      title: t.admin.confirmDeleteOrderTitle,
      message: t.admin.confirmDeleteOrderMessage,
      confirmText: t.admin.delete,
      danger: true,
      onConfirm: async () => {
        await deleteOrder(id);
        setOrders((prev) => prev.filter((o) => o._id !== id));
        showToast(t.admin.orderDeleted, "success");
      },
    });
  };

  const handleSubmitPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...promoForm,
        code: promoForm.code.trim().toUpperCase(),
        expiresAt: promoForm.expiresAt
          ? new Date(`${promoForm.expiresAt}T23:59:59.999`).toISOString()
          : undefined,
      };

      if (promoEditingId) {
        const updated = await updatePromoCode(promoEditingId, payload);
        setPromoCodes((prev) =>
          prev.map((promo) => (promo._id === promoEditingId ? updated : promo)),
        );
        showToast(t.admin.promoUpdated, "success");
      } else {
        const created = await createPromoCode(payload);
        setPromoCodes((prev) => [created, ...prev]);
        showToast(t.admin.promoCreated, "success");
      }

      resetPromoForm();
    } catch (err: unknown) {
      const nextMessage = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      showToast(getPromoAdminErrorMessage(nextMessage), "error");
    } finally {
      setSaving(false);
    }
  };

  const startPromoEdit = (promoCode: IPromoCode) => {
    setPromoEditingId(promoCode._id);
    setPromoForm({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      minOrderAmount: promoCode.minOrderAmount,
      isActive: promoCode.isActive,
      expiresAt: promoCode.expiresAt ? promoCode.expiresAt.slice(0, 10) : "",
    });
  };

  const handleDeletePromoCode = (id: string, code: string) => {
    openConfirm({
      title: t.admin.delete,
      message: `${t.admin.promoCode}: ${code}?`,
      confirmText: t.admin.delete,
      danger: true,
      onConfirm: async () => {
        await deletePromoCode(id);
        setPromoCodes((prev) => prev.filter((promo) => promo._id !== id));
        if (promoEditingId === id) resetPromoForm();
        showToast(t.admin.promoDeleted, "success");
      },
    });
  };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    const statusLabel = getOrderStatusMeta(status, t.orders).label;
    openConfirm({
      title: t.admin.confirmStatusTitle,
      message: t.admin.confirmStatusMessage.replace("{status}", statusLabel),
      confirmText: t.admin.update,
      onConfirm: async () => {
        setStatusUpdatingId(id);
        try {
          const updated = await updateOrderStatus(id, status);
          setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
          showToast(t.admin.orderStatusUpdated, "success");
        } finally {
          setStatusUpdatingId(null);
        }
      },
    });
  };

  const handleRandomRestock = () => {
    openConfirm({
      title: t.admin.confirmRestockTitle,
      message: t.admin.confirmRestockMessage,
      confirmText: t.admin.restock,
      onConfirm: async () => {
        setRestocking(true);
        try {
          await restockProductsRandom();
          const productsRes = await getProducts("", page, 15);
          setProducts(productsRes.products);
          setTotalPages(productsRes.pages);
          showToast(t.admin.productsRestocked, "success");
        } finally {
          setRestocking(false);
        }
      },
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.account.myAccount, href: "/account" },
          { label: t.admin.title },
        ]}
      />

      <div className="mb-6 space-y-3">
        <h1 className="text-3xl font-bold leading-tight sm:text-2xl">{t.admin.title}</h1>
        {tab === "products" && (
          <button
            onClick={handleRandomRestock}
            disabled={restocking}
            className="w-full rounded border border-gray-300 px-4 py-2 text-sm hover:border-black disabled:opacity-60 sm:w-auto"
          >
            {restocking ? t.admin.restocking : t.admin.restock}
          </button>
        )}
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            onClick={() => handleTabChange("products")}
            className={`rounded px-3 py-2 text-xs sm:px-4 sm:text-sm ${tab === "products" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {t.admin.products}
          </button>
          <button
            onClick={() => handleTabChange("orders")}
            className={`rounded px-3 py-2 text-xs sm:px-4 sm:text-sm ${tab === "orders" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {t.admin.orders}
          </button>
          <button
            onClick={() => handleTabChange("payments")}
            className={`rounded px-3 py-2 text-xs sm:px-4 sm:text-sm ${tab === "payments" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {t.admin.paymentsTab}
          </button>
          <button
            onClick={() => handleTabChange("promos")}
            className={`rounded px-3 py-2 text-xs sm:px-4 sm:text-sm ${tab === "promos" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {t.admin.promos}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <ConfirmModal
        open={Boolean(confirmState)}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmText={confirmState?.confirmText || t.admin.confirmAction}
        danger={confirmState?.danger}
        loading={confirmLoading}
        cancelText={t.admin.cancel}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      {loading ? (
        <p className="text-gray-500">{t.admin.loading}</p>
      ) : (
        <>
          {stats && (
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsTotalOrders}</p>
                <p className="text-xl font-semibold">{stats.totalOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsPaidOrders}</p>
                <p className="text-xl font-semibold">{stats.paidOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsPendingOrders}</p>
                <p className="text-xl font-semibold">{stats.pendingOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsDeliveredOrders}</p>
                <p className="text-xl font-semibold">{stats.deliveredOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsTotalRevenue}</p>
                <p className="text-xl font-semibold">₴{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsPaidRevenue}</p>
                <p className="text-xl font-semibold">₴{stats.paidRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsUnpaidOrders}</p>
                <p className="text-xl font-semibold">{stats.unpaidOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">{t.admin.statsAvgOrderValue}</p>
                <p className="text-xl font-semibold">
                  ₴{stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {tab === "products" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <form
                onSubmit={handleSubmitProduct}
                className="rounded-lg border border-gray-200 p-4 lg:col-span-1"
              >
                <h2 className="mb-4 font-semibold">
                  {isEditing ? t.admin.editProduct : t.admin.createProduct}
                </h2>
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.productName}
                    </span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="iPhone 15 Pro"
                      value={form.name}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.brand}
                    </span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Apple"
                      value={form.brand}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, brand: e.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.category}
                    </span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Electronics"
                      value={form.category}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, category: e.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.imageUrl}
                    </span>
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                        placeholder="https://..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-black"
                      >
                        {t.admin.add}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {form.images.length > 0 ? form.images[0] : t.admin.uploadHint}
                    </p>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.uploadImageFile}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-black file:px-3 file:py-2 file:text-sm file:text-white"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          handleImageUpload(e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {uploadingImage ? t.admin.uploading : t.admin.uploadHint}
                    </p>
                  </label>

                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.images}
                    </span>
                    <div className="space-y-2">
                      {form.images.map((imageUrl, index) => (
                        <div
                          key={`${imageUrl}-${index}`}
                          className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2"
                        >
                          <span className="min-w-0 flex-1 truncate text-xs text-gray-600">
                            {index + 1}. {imageUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(imageUrl)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            {t.admin.delete}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.priceUah}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="19999"
                      value={form.price}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          price: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.countInStock}
                    </span>
                    <input
                      type="number"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="25"
                      value={form.countInStock}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          countInStock: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {lang === "uk" ? "Короткий опис (UA)" : "Short Description (UA)"}
                    </span>
                    <textarea
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t.admin.shortDescription}
                      value={form.descriptionUk || ""}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          descriptionUk: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {lang === "uk" ? "Короткий опис (EN)" : "Short Description (EN)"}
                    </span>
                    <textarea
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t.admin.shortDescription}
                      value={form.descriptionEn || ""}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          descriptionEn: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-red-500 disabled:bg-gray-400"
                  >
                    {saving
                      ? t.admin.saving
                      : isEditing
                        ? t.admin.update
                        : t.admin.create}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded border border-gray-300 px-4 py-2 text-sm"
                    >
                      {t.admin.cancel}
                    </button>
                  )}
                </div>
              </form>

              <div className="rounded-lg border border-gray-200 lg:col-span-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">{t.admin.name}</th>
                        <th className="px-3 py-2 text-left">
                          {t.admin.category}
                        </th>
                        <th className="px-3 py-2 text-left">{t.admin.price}</th>
                        <th className="px-3 py-2 text-left">{t.admin.stock}</th>
                        <th className="px-3 py-2 text-left">
                          {t.admin.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id} className="border-t">
                          <td className="px-3 py-2">{product.name}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {getCategoryLabel(product.category, lang)}
                          </td>
                          <td className="px-3 py-2">
                            ₴{product.price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">{product.countInStock}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <Link
                                href={`/products/${product._id}`}
                                className="rounded border border-gray-300 px-2 py-1 hover:border-black"
                              >
                                {t.admin.view}
                              </Link>
                              <button
                                onClick={() => startEdit(product)}
                                className="rounded border border-gray-300 px-2 py-1 hover:border-black"
                              >
                                {t.admin.edit}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProduct(product._id, product.name)
                                }
                                className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
                              >
                                {t.admin.delete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination для products */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t.admin.order}</th>
                      <th className="px-3 py-2 text-left">{t.admin.user}</th>
                      <th className="px-3 py-2 text-left">{t.admin.total}</th>
                      <th className="px-3 py-2 text-left">{t.admin.paid}</th>
                      <th className="px-3 py-2 text-left">{t.admin.paymentTx}</th>
                      <th className="px-3 py-2 text-left">
                        {t.admin.delivered}
                      </th>
                      <th className="px-3 py-2 text-left">{t.orders.status}</th>
                      <th className="px-3 py-2 text-left">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const orderUser = order.user as IUser | string;
                      const userText =
                        typeof orderUser === "string"
                          ? orderUser.slice(-6)
                          : `${orderUser.name} (${orderUser.email})`;
                      const statusMeta = getOrderStatusMeta(order.status, t.orders);
                      return (
                        <tr key={order._id} className="border-t">
                          <td className="px-3 py-2">{order._id.slice(-8)}</td>
                          <td className="px-3 py-2">{userText}</td>
                          <td className="px-3 py-2">
                            ₴{order.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            {order.isPaid ? t.admin.yes : t.admin.no}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-1 text-xs text-gray-700">
                              <span>{order.paymentResult?.id || "-"}</span>
                              <span className="text-gray-500">
                                {order.paymentResult?.status || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {order.isDelivered ? t.admin.yes : t.admin.no}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-2">
                              <span
                                className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                              <select
                                value={order.status || "pending"}
                                onChange={(e) =>
                                  handleStatusChange(order._id, e.target.value as OrderStatus)
                                }
                                disabled={statusUpdatingId === order._id}
                                className="rounded border border-gray-300 px-2 py-1 text-xs"
                              >
                                <option value="pending">{t.orders.statusPending}</option>
                                <option value="processing">{t.orders.statusProcessing}</option>
                                <option value="shipped">{t.orders.statusShipped}</option>
                                <option value="delivered">{t.orders.statusDelivered}</option>
                                <option value="cancelled">{t.orders.statusCancelled}</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <Link
                                href={`/orders/${order._id}`}
                                className="rounded border border-gray-300 px-2 py-1 hover:border-black"
                              >
                                {t.admin.view}
                              </Link>
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
                              >
                                {t.admin.delete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination для orders */}
              <Pagination
                currentPage={orderPage}
                totalPages={orderTotalPages}
                onPageChange={setOrderPage}
              />
            </div>
          )}

          {tab === "payments" && (
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs text-gray-600">
                  {t.admin.paymentsStatus}
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="rounded border border-gray-300 px-2 py-2 text-sm"
                  >
                    <option value="">{t.admin.paymentsAll}</option>
                    <option value="success">success</option>
                    <option value="sandbox">sandbox</option>
                    <option value="failure">failure</option>
                    <option value="error">error</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-gray-600">
                  {t.admin.paymentsDateFrom}
                  <input
                    type="date"
                    value={paymentDateFrom}
                    onChange={(e) => setPaymentDateFrom(e.target.value)}
                    className="rounded border border-gray-300 px-2 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-gray-600">
                  {t.admin.paymentsDateTo}
                  <input
                    type="date"
                    value={paymentDateTo}
                    onChange={(e) => setPaymentDateTo(e.target.value)}
                    className="rounded border border-gray-300 px-2 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t.admin.order}</th>
                      <th className="px-3 py-2 text-left">{t.admin.paymentTx}</th>
                      <th className="px-3 py-2 text-left">{t.admin.paymentsStatus}</th>
                      <th className="px-3 py-2 text-left">{t.admin.paymentsProcessed}</th>
                      <th className="px-3 py-2 text-left">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentLogs.map((log) => (
                      <tr key={log._id} className="border-t">
                        <td className="px-3 py-2">{log.orderId.slice(-8)}</td>
                        <td className="px-3 py-2">{log.transactionId || "-"}</td>
                        <td className="px-3 py-2">{log.status || "-"}</td>
                        <td className="px-3 py-2">
                          {log.processedAt
                            ? new Date(log.processedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/orders/${log.orderId}`}
                            className="rounded border border-gray-300 px-2 py-1 hover:border-black"
                          >
                            {t.admin.view}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={paymentPage}
                totalPages={paymentTotalPages}
                onPageChange={setPaymentPage}
              />
            </div>
          )}

          {tab === "promos" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <form
                onSubmit={handleSubmitPromoCode}
                className="rounded-lg border border-gray-200 p-4 lg:col-span-1"
              >
                <h2 className="mb-4 font-semibold">{t.admin.promoCreate}</h2>
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.promoCode}
                    </span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm uppercase"
                      value={promoForm.code}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.promoType}
                    </span>
                    <select
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      value={promoForm.type}
                      onChange={(e) =>
                        setPromoForm((prev) => ({
                          ...prev,
                          type: e.target.value as "percent" | "fixed",
                        }))
                      }
                    >
                      <option value="percent">percent</option>
                      <option value="fixed">fixed</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.promoValue}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      value={promoForm.value}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, value: Number(e.target.value) }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.promoMinOrder}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      value={promoForm.minOrderAmount}
                      onChange={(e) =>
                        setPromoForm((prev) => ({
                          ...prev,
                          minOrderAmount: Number(e.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.promoExpiresAt}
                    </span>
                    <input
                      type="date"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      value={promoForm.expiresAt}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                      }
                    />
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={promoForm.isActive}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                    />
                    {t.admin.promoActive}
                  </label>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-red-500 disabled:bg-gray-400"
                  >
                    {saving ? t.admin.saving : promoEditingId ? t.admin.update : t.admin.create}
                  </button>
                  {promoEditingId && (
                    <button
                      type="button"
                      onClick={resetPromoForm}
                      className="rounded border border-gray-300 px-4 py-2 text-sm"
                    >
                      {t.admin.cancel}
                    </button>
                  )}
                </div>
              </form>

              <div className="rounded-lg border border-gray-200 lg:col-span-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">{t.admin.promoCode}</th>
                        <th className="px-3 py-2 text-left">{t.admin.promoType}</th>
                        <th className="px-3 py-2 text-left">{t.admin.promoValue}</th>
                        <th className="px-3 py-2 text-left">{t.admin.promoMinOrder}</th>
                        <th className="px-3 py-2 text-left">{t.admin.promoActive}</th>
                        <th className="px-3 py-2 text-left">{t.admin.promoExpiresAt}</th>
                        <th className="px-3 py-2 text-left">{t.admin.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.length === 0 && (
                        <tr>
                          <td className="px-3 py-4 text-gray-500" colSpan={7}>
                            {t.admin.noPromoCodes}
                          </td>
                        </tr>
                      )}
                      {promoCodes.map((promoCode) => (
                        <tr key={promoCode._id} className="border-t">
                          <td className="px-3 py-2 font-medium">{promoCode.code}</td>
                          <td className="px-3 py-2">{promoCode.type}</td>
                          <td className="px-3 py-2">{promoCode.value}</td>
                          <td className="px-3 py-2">{promoCode.minOrderAmount}</td>
                          <td className="px-3 py-2">
                            {promoCode.isActive ? t.admin.yes : t.admin.no}
                          </td>
                          <td className="px-3 py-2">
                            {promoCode.expiresAt
                              ? new Date(promoCode.expiresAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startPromoEdit(promoCode)}
                                className="rounded border border-gray-300 px-2 py-1 hover:border-black"
                              >
                                {t.admin.edit}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePromoCode(promoCode._id, promoCode.code)
                                }
                                className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
                              >
                                {t.admin.delete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
