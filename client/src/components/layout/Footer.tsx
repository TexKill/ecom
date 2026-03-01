"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => {
      setStatus(null);
      setStatusMessage("");
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus("error");
      setStatusMessage(t.footer.subscribeInvalid);
      return;
    }

    try {
      setSubmitting(true);
      setStatus(null);
      setStatusMessage("");

      await axiosInstance.post("/api/subscribers", { email: normalizedEmail });

      setStatus("success");
      setStatusMessage(t.footer.subscribeSuccess);
      setEmail("");
    } catch (error) {
      setStatus("error");
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setStatusMessage(t.footer.subscribeExists);
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setStatusMessage(t.footer.subscribeInvalid);
      } else {
        setStatusMessage(t.footer.subscribeError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">TexKillDev</h2>
          <p className="text-sm text-gray-400">{t.footer.subscribe}</p>
          <form
            onSubmit={handleSubscribe}
            className="flex items-center border border-gray-600 rounded px-3 py-2 gap-2"
          >
            <input
              type="email"
              placeholder={t.footer.enterEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-500"
              disabled={submitting}
            />
            <button
              type="submit"
              aria-label={t.footer.subscribeBtnAria}
              disabled={submitting}
            >
              <Send size={16} className="text-white" />
            </button>
          </form>
          {statusMessage && (
            <p
              className={`text-xs ${
                status === "success" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-base">{t.footer.support}</h3>
          <p className="text-sm text-gray-400">{t.footer.supportAddress}</p>
          <p className="text-sm text-gray-400">texkilldev@gmail.com</p>
          <p className="text-sm text-gray-400">+380 44 123 4567</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-base">{t.footer.account}</h3>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li>
              <Link href="/account" className="hover:text-white">
                {t.footer.myAccount}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white">
                {t.footer.loginRegister}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                {t.footer.cart}
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:text-white">
                {t.footer.favorites}
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white">
                {t.footer.shop}
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-base">{t.footer.quickLink}</h3>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li>
              <Link href="#" className="hover:text-white">
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                {t.footer.terms}
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                {t.footer.faq}
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                {t.footer.contact}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        {"\u00A9"} Copyright {new Date().getFullYear()} TexKillDev
      </div>
    </footer>
  );
}

