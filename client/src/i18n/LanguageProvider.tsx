"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Lang, messages, Messages } from "./messages";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("lang");
    return saved === "uk" || saved === "en" ? saved : "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: messages[lang],
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
