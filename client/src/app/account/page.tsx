"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { updateUserProfile } from "@/lib/api";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { useLanguage } from "@/i18n/LanguageProvider";

const splitName = (name?: string) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) || [];
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

export default function AccountPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace("/login?redirect=/account");
    }
  }, [user, hasHydrated, router]);

  useEffect(() => {
    if (!user) return;

    const fallback = splitName(user.name);
    setFirstName(user.firstName || fallback.firstName);
    setLastName(user.lastName || fallback.lastName);
  }, [user]);

  if (!hasHydrated || !user) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      setToast({ message: t.auth.passwordsMismatch, type: "error" });
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(newPassword
          ? {
              currentPassword,
              password: newPassword,
            }
          : {}),
      });

      setUser(updatedUser);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);
      setToast({ message: t.account.profileUpdated, type: "success" });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || t.account.profileUpdateFailed
        : t.account.profileUpdateFailed;
      setToast({ message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    const fallback = splitName(user.name);
    setFirstName(user.firstName || fallback.firstName);
    setLastName(user.lastName || fallback.lastName);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
            <span className="font-semibold">{t.account.name}:</span>{" "}
            {user.name}
          </p>
          <p>
            <span className="font-semibold">{t.account.email}:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">{t.account.role}:</span>{" "}
            {user.isAdmin ? t.account.admin : t.account.customer}
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  {t.auth.firstName}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  {t.auth.lastName}
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="grid gap-4 border-t border-gray-200 pt-5 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  {t.account.currentPassword}
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  required={Boolean(newPassword)}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  {t.account.newPassword}
                </span>
                <input
                  type="password"
                  minLength={6}
                  maxLength={128}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  {t.auth.confirmPassword}
                </span>
                <input
                  type="password"
                  minLength={6}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  required={Boolean(newPassword)}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:bg-gray-400"
              >
                {saving ? t.admin.saving : t.admin.update}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-black disabled:opacity-60"
              >
                {t.admin.cancel}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-6 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-black"
          >
            {t.account.editProfile}
          </button>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
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
