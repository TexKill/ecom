"use client";

import InfoPageLayout from "@/components/content/InfoPageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function TermsOfUsePage() {
  const { t, lang } = useLanguage();

  const subtitle =
    lang === "uk"
      ? "Користуючись сайтом, ви погоджуєтесь із правилами оформлення замовлень, оплати, доставки та відповідального використання сервісу."
      : "By using this website, you agree to the rules for ordering, payment, delivery, and responsible use of the service.";

  const sections =
    lang === "uk"
      ? [
          {
            heading: "Використання сайту",
            body: [
              "Ви погоджуєтесь використовувати сайт лише законним способом і не вчиняти дій, що можуть зашкодити роботі сервісу, іншим користувачам або безпеці платформи.",
              "Ми можемо оновлювати каталог, ціни, наявність товарів і вміст сторінок без попереднього повідомлення.",
            ],
          },
          {
            heading: "Замовлення та оплата",
            body: [
              "Після оформлення замовлення ви отримуєте підтвердження, але остаточне прийняття замовлення залежить від наявності товару та успішної обробки оплати.",
              "У випадку помилок у ціні, залишках або технічних збоях ми можемо зв'язатися з вами для уточнення або скасування замовлення.",
            ],
          },
          {
            heading: "Повернення та підтримка",
            body: [
              "Якщо у вас виникли питання щодо доставки, гарантії чи повернення, звертайтесь у службу підтримки через контактну сторінку.",
              "Подальше використання сайту після оновлення умов означає згоду з актуальною версією правил.",
            ],
          },
        ]
      : [
          {
            heading: "Using the website",
            body: [
              "You agree to use the website lawfully and avoid actions that could harm the service, other users, or the security of the platform.",
              "We may update the catalog, pricing, stock availability, and page content without prior notice.",
            ],
          },
          {
            heading: "Orders and payment",
            body: [
              "After placing an order, you receive confirmation, but final acceptance depends on stock availability and successful payment processing.",
              "If pricing, inventory, or technical errors occur, we may contact you to clarify or cancel the order.",
            ],
          },
          {
            heading: "Returns and support",
            body: [
              "If you have questions about delivery, warranty, or returns, please contact support through the contact page.",
              "Continuing to use the website after terms are updated means you accept the latest version of these rules.",
            ],
          },
        ];

  return (
    <InfoPageLayout
      homeLabel={t.header.home}
      title={t.footer.terms}
      subtitle={subtitle}
      sections={sections}
    />
  );
}
