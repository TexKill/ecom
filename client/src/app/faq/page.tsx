"use client";

import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function FaqPage() {
  const { t, lang } = useLanguage();

  const items =
    lang === "uk"
      ? [
          {
            question: "Як швидко обробляються замовлення?",
            answer:
              "Зазвичай ми обробляємо нові замовлення протягом одного робочого дня. У періоди акцій або високого навантаження це може зайняти трохи більше часу.",
          },
          {
            question: "Чи можна оплатити замовлення онлайн?",
            answer:
              "Так, на сайті доступна онлайн-оплата через інтегрований платіжний сервіс. Доступність способів оплати може залежати від типу замовлення.",
          },
          {
            question: "Як відстежити статус замовлення?",
            answer:
              "Після оформлення замовлення ви можете переглядати його статус у своєму акаунті на сторінці замовлень.",
          },
          {
            question: "Чи можна повернути товар?",
            answer:
              "Якщо товар не підійшов або має дефект, зверніться до підтримки. Ми підкажемо умови повернення та подальші кроки.",
          },
          {
            question: "Куди звертатися з додатковими питаннями?",
            answer:
              "Скористайтеся сторінкою Contact або напишіть нам на email, вказаний у футері. Ми допоможемо з оплатою, доставкою або вибором товару.",
          },
        ]
      : [
          {
            question: "How quickly are orders processed?",
            answer:
              "We usually process new orders within one business day. During promotions or busy periods, processing may take a little longer.",
          },
          {
            question: "Can I pay online?",
            answer:
              "Yes, online payment is available through the integrated payment service. Available methods may vary depending on the order.",
          },
          {
            question: "How can I track my order status?",
            answer:
              "After placing an order, you can check its current status in your account on the orders page.",
          },
          {
            question: "Can I return a product?",
            answer:
              "If an item is unsuitable or defective, contact support and we will explain the return conditions and next steps.",
          },
          {
            question: "Where can I ask additional questions?",
            answer:
              "Use the Contact page or email us using the address shown in the footer. We can help with payment, delivery, or product selection.",
          },
        ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t.header.home, href: "/" },
          { label: t.footer.faq },
        ]}
      />

      <section className="rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-6 py-10 text-white shadow-xl sm:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
          Support
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">{t.footer.faq}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
          {lang === "uk"
            ? "Відповіді на найпоширеніші запитання щодо замовлень, оплати, доставки та підтримки."
            : "Answers to the most common questions about orders, payments, delivery, and support."}
        </p>
      </section>

      <section className="mt-8 space-y-4">
        {items.map((item, index) => (
          <details
            key={`${item.question}-${index}`}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none text-lg font-semibold text-gray-900">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </section>
    </div>
  );
}
