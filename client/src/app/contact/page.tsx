"use client";

import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.header.contact },
        ]}
      />

      <h1 className="mb-3 text-3xl font-bold">{t.header.contact}</h1>
      <p className="mb-8 max-w-2xl text-gray-600">{t.footer.subscribe}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {t.footer.support}
          </h2>
          <p className="text-gray-800">{t.footer.supportAddress}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Email
          </h2>
          <a className="text-gray-800 hover:text-red-500" href="mailto:texkilldev@gmail.com">
            texkilldev@gmail.com
          </a>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Phone
          </h2>
          <a className="text-gray-800 hover:text-red-500" href="tel:+380441234567">
            +380 44 123 4567
          </a>
        </div>
      </div>
    </div>
  );
}
