"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const setUser = useAuthStore((s) => s.setUser);
  const loadFavoritesFromServer = useFavoritesStore(
    (s) => s.loadFavoritesFromServer,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(t.auth.passwordsMismatch);
      setEmailError("");
      return;
    }

    setIsLoading(true);
    setError("");
    setEmailError("");

    try {
      const { data } = await axiosInstance.post("/api/users/register", {
        firstName,
        lastName,
        email,
        password,
      });

      setUser(data);
      await loadFavoritesFromServer(data.token);
      router.replace(redirect);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || t.auth.registrationFailed;
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("already exists")
        ) {
          setEmailError(t.auth.emailInUse);
          setError("");
        } else {
          setError(message);
        }
      } else {
        setError(t.auth.unexpectedError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300">
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm">
            <Link
              href={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="rounded-md px-3 py-2 text-center font-medium text-gray-600 transition-all duration-300 hover:bg-white/70 hover:text-black"
            >
              {t.auth.login}
            </Link>
            <Link
              href={redirect ? `/register?redirect=${redirect}` : "/register"}
              className="rounded-md bg-white px-3 py-2 text-center font-medium text-black shadow-sm transition-all duration-300"
            >
              {t.auth.register}
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{t.auth.createAccount}</h1>
            <p className="mt-2 text-gray-500">{t.auth.registerSubtitle}</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t.auth.firstName}
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t.auth.lastName}
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t.auth.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 outline-none transition-all duration-300 focus:ring-2 ${emailError ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-red-500 focus:ring-red-500"}`}
                placeholder="john@example.com"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-11 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  aria-label={
                    showPassword ? t.auth.hidePassword : t.auth.showPassword
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-11 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  aria-label={
                    showConfirmPassword
                      ? t.auth.hideConfirmPassword
                      : t.auth.showConfirmPassword
                  }
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-black py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500 disabled:bg-gray-400"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                t.auth.createAccountBtn
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            {t.auth.hasAccount}{" "}
            <Link
              href={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="font-medium text-red-500 hover:underline"
            >
              {t.auth.logIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
