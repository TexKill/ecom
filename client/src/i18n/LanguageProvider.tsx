"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Lang, messages, Messages } from "./messages";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANG_STORAGE_KEY = "lang";
const languageListeners = new Set<() => void>();

const getStoredLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
  return saved === "uk" || saved === "en" ? saved : "en";
};

const subscribeToLanguage = (listener: () => void) => {
  languageListeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      languageListeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === LANG_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

const emitLanguageChange = () => {
  languageListeners.forEach((listener) => listener());
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore<Lang>(
    subscribeToLanguage,
    getStoredLang,
    () => "en",
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
    emitLanguageChange();
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: messages[lang],
    }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
