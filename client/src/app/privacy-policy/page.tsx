"use client";

import InfoPageLayout from "@/components/content/InfoPageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function PrivacyPolicyPage() {
  const { t, lang } = useLanguage();

  const subtitle =
    lang === "uk"
      ? "Ми збираємо лише ті дані, які потрібні для оформлення замовлень, доставки, оплати та покращення вашого досвіду користування магазином."
      : "We collect only the data needed to process orders, deliver purchases, handle payments, and improve your shopping experience.";

  const sections =
    lang === "uk"
      ? [
          {
            heading: "Які дані ми збираємо",
            body: [
              "Під час реєстрації, оформлення замовлення або підписки ми можемо отримувати ваше ім'я, email, номер телефону, адресу доставки та технічні дані, необхідні для роботи сайту.",
              "Платіжні дані обробляються через зовнішніх платіжних провайдерів. Ми не зберігаємо повні реквізити банківських карток на сайті.",
            ],
          },
          {
            heading: "Як ми використовуємо інформацію",
            body: [
              "Ми використовуємо ваші дані для підтвердження замовлень, доставки, підтримки клієнтів, захисту від шахрайства та надсилання сервісних повідомлень.",
              "Якщо ви підписались на розсилку, email може використовуватись для новин, акцій та оновлень магазину.",
            ],
          },
          {
            heading: "Зберігання і захист",
            body: [
              "Ми застосовуємо технічні та організаційні заходи для захисту персональних даних від несанкціонованого доступу, втрати чи зміни.",
              "Ви можете звернутися до нас для оновлення, видалення або уточнення своїх даних через сторінку контактів.",
            ],
          },
        ]
      : [
          {
            heading: "What data we collect",
            body: [
              "When you register, place an order, or subscribe, we may collect your name, email, phone number, shipping address, and technical data required to operate the store.",
              "Payment details are handled by third-party payment providers. We do not store full bank card details on the site.",
            ],
          },
          {
            heading: "How we use information",
            body: [
              "We use your data to confirm orders, arrange delivery, provide support, prevent fraud, and send service-related updates.",
              "If you subscribe to our newsletter, your email may also be used for product news, promotions, and store updates.",
            ],
          },
          {
            heading: "Storage and protection",
            body: [
              "We apply technical and organizational measures to protect personal data from unauthorized access, loss, or alteration.",
              "You can contact us to update, delete, or clarify your data through the contact page.",
            ],
          },
        ];

  return (
    <InfoPageLayout
      homeLabel={t.header.home}
      title={t.footer.privacy}
      subtitle={subtitle}
      sections={sections}
    />
  );
}
