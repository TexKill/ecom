import type { Lang } from "@/i18n/messages";

const categoryLabels: Record<string, Record<Lang, string>> = {
  Accessories: {
    en: "Accessories",
    uk: "Аксесуари",
  },
  Audio: {
    en: "Audio",
    uk: "Аудіо",
  },
  Components: {
    en: "Components",
    uk: "Комплектуючі",
  },
  Gaming: {
    en: "Gaming",
    uk: "Геймінг",
  },
  Laptops: {
    en: "Laptops",
    uk: "Ноутбуки",
  },
  Monitors: {
    en: "Monitors",
    uk: "Монітори",
  },
  Smartphones: {
    en: "Smartphones",
    uk: "Смартфони",
  },
  Tablets: {
    en: "Tablets",
    uk: "Планшети",
  },
  Wearables: {
    en: "Wearables",
    uk: "Носимі пристрої",
  },
};

export function getCategoryLabel(category: string, lang: Lang) {
  return categoryLabels[category]?.[lang] || category;
}
