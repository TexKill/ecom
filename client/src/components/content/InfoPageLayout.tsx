"use client";

import Breadcrumbs from "@/components/layout/Breadcrumbs";

type InfoSection = {
  heading: string;
  body: string[];
};

interface InfoPageLayoutProps {
  homeLabel: string;
  title: string;
  subtitle: string;
  sections: InfoSection[];
}

export default function InfoPageLayout({
  homeLabel,
  title,
  subtitle,
  sections,
}: InfoPageLayoutProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: homeLabel, href: "/" },
          { label: title },
        ]}
      />

      <section className="rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-6 py-10 text-white shadow-xl sm:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
          Information
        </p>
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
          {subtitle}
        </p>
      </section>

      <section className="mt-8 space-y-4">
        {sections.map((section) => (
          <article
            key={section.heading}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-gray-600 sm:text-base">
              {section.body.map((paragraph, index) => (
                <p key={`${section.heading}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
