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
  uploadProductImage,
  updateProduct,
} from "@/lib/api";
import { IOrder, IProduct, IUser } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

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
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductPayload>(emptyForm);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

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
        const [productsRes, ordersRes] = await Promise.all([
          getProducts("", 1),
          getAllOrders(),
        ]);
        setProducts(productsRes.products);
        setOrders(ordersRes);
      } catch {
        setError(t.admin.loadFail);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasHydrated, user, router, t.admin.loadFail]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), 4000);
    return () => window.clearTimeout(timer);
  }, [error]);

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
      setError(t.admin.saveFail);
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
        setProducts((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      resetForm();
    } catch {
      setError(t.admin.saveFail);
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
      setError("");
      const url = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch {
      setError(t.admin.uploadFail);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch {
      setError(t.admin.deleteProductFail);
    }
  };

  const handleDeliverOrder = async (id: string) => {
    try {
      const updated = await markOrderDelivered(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch {
      setError(t.admin.deliverFail);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch {
      setError(t.admin.deleteOrderFail);
    }
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
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.productName}</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="iPhone 15 Pro"
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.brand}</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Apple"
                      value={form.brand}
                      onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.category}</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Electronics"
                      value={form.category}
                      onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.imageUrl}</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.uploadImageFile}</span>
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
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.priceUah}</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="19999"
                      value={form.price}
                      onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.countInStock}</span>
                    <input
                      type="number"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="25"
                      value={form.countInStock}
                      onChange={(e) => setForm((s) => ({ ...s, countInStock: Number(e.target.value) }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.descriptionUk}</span>
                    <textarea
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t.admin.shortDescription}
                      value={form.descriptionUk || ""}
                      onChange={(e) => setForm((s) => ({ ...s, descriptionUk: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{t.admin.descriptionEn}</span>
                    <textarea
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={t.admin.shortDescription}
                      value={form.descriptionEn || ""}
                      onChange={(e) => setForm((s) => ({ ...s, descriptionEn: e.target.value }))}
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
                    {saving ? t.admin.saving : isEditing ? t.admin.update : t.admin.create}
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

              <div className="overflow-x-auto rounded-lg border border-gray-200 lg:col-span-2">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t.admin.name}</th>
                      <th className="px-3 py-2 text-left">{t.admin.price}</th>
                      <th className="px-3 py-2 text-left">{t.admin.stock}</th>
                      <th className="px-3 py-2 text-left">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-t">
                        <td className="px-3 py-2">{product.name}</td>
                        <td className="px-3 py-2">₴{product.price.toFixed(2)}</td>
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
                              onClick={() => handleDeleteProduct(product._id)}
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
          )}

          {tab === "orders" && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">{t.admin.order}</th>
                    <th className="px-3 py-2 text-left">{t.admin.user}</th>
                    <th className="px-3 py-2 text-left">{t.admin.total}</th>
                    <th className="px-3 py-2 text-left">{t.admin.paid}</th>
                    <th className="px-3 py-2 text-left">{t.admin.delivered}</th>
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
                    return (
                      <tr key={order._id} className="border-t">
                        <td className="px-3 py-2">{order._id.slice(-8)}</td>
                        <td className="px-3 py-2">{userText}</td>
                        <td className="px-3 py-2">₴{order.totalPrice.toFixed(2)}</td>
                        <td className="px-3 py-2">{order.isPaid ? t.admin.yes : t.admin.no}</td>
                        <td className="px-3 py-2">{order.isDelivered ? t.admin.yes : t.admin.no}</td>
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
          )}
        </>
      )}
    </div>
  );
}
