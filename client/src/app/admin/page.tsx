"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  deleteOrder,
  deleteProduct,
  getAllOrders,
  getProducts,
  markOrderDelivered,
  ProductPayload,
  restockProductsRandom,
  uploadProductImage,
  updateOrderStatus,
  updateProduct,
} from "@/lib/api";
import { IOrder, IProduct, IUser, OrderStatus } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";
import Pagination from "@/components/ui/Pagination";
import { getOrderStatusMeta } from "@/lib/orderStatus";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

const emptyForm: ProductPayload = {
  name: "",
  price: 0,
  description: "",
  descriptionUk: "",
  descriptionEn: "",
  image: "",
  brand: "",
  category: "",
  countInStock: 0,
};

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
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

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadFailMsg = t.admin.loadFail;

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
      } catch {
        setError(loadFailMsg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasHydrated, user, router, tab, page, orderPage, loadFailMsg]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), 4000);
    return () => window.clearTimeout(timer);
  }, [error]);

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
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const fallbackDescription = (
      form.descriptionEn ||
      form.descriptionUk ||
      form.description
    ).trim();

    if (!fallbackDescription) {
      showToast(t.admin.saveFail, "error");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: ProductPayload = {
        ...form,
        description: fallbackDescription,
        descriptionUk: form.descriptionUk?.trim() || fallbackDescription,
        descriptionEn: form.descriptionEn?.trim() || fallbackDescription,
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
      brand: product.brand,
      category: product.category,
      countInStock: product.countInStock,
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const url = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, image: url }));
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

  const handleDeliverOrder = (id: string) => {
    openConfirm({
      title: t.admin.confirmDeliverTitle,
      message: t.admin.confirmDeliverMessage,
      confirmText: t.admin.deliver,
      onConfirm: async () => {
        const updated = await markOrderDelivered(id);
        setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
        showToast(t.admin.orderDelivered, "success");
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.account.myAccount, href: "/account" },
          { label: t.admin.title },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.admin.title}</h1>
        <div className="flex gap-2">
          {tab === "products" && (
            <button
              onClick={handleRandomRestock}
              disabled={restocking}
              className="rounded border border-gray-300 px-4 py-2 text-sm hover:border-black disabled:opacity-60"
            >
              {restocking ? t.admin.restocking : t.admin.restock}
            </button>
          )}
          <button
            onClick={() => setTab("products")}
            className={`rounded px-4 py-2 text-sm ${tab === "products" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {t.admin.products}
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`rounded px-4 py-2 text-sm ${tab === "orders" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {t.admin.orders}
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
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, image: e.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      {t.admin.uploadImageFile}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-black file:px-3 file:py-2 file:text-sm file:text-white"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {uploadingImage ? t.admin.uploading : t.admin.uploadHint}
                    </p>
                  </label>

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
                      {t.admin.descriptionUk}
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
                      {t.admin.descriptionEn}
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
                          <td className="px-3 py-2">
                            ₴{product.price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">{product.countInStock}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
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
                              {!order.isDelivered && (
                                <button
                                  onClick={() => handleDeliverOrder(order._id)}
                                  className="rounded border border-gray-300 px-2 py-1 hover:border-black"
                                >
                                  {t.admin.deliver}
                                </button>
                              )}
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
        </>
      )}
    </div>
  );
}
