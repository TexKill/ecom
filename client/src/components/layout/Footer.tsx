"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">TexKillDev</h2>
          <p className="text-sm text-gray-400">{t.footer.subscribe}</p>
          <form className="flex items-center border border-gray-600 rounded px-3 py-2 gap-2">
            <input
              type="email"
              placeholder={t.footer.enterEmail}
              className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-500"
            />
            <button type="submit" aria-label={t.footer.enterEmail}>
              <Send size={16} className="text-white" />
            </button>
          </form>
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
