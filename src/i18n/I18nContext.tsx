"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import th from "./th.json";
import en from "./en.json";

export type Language = "th" | "en";
type Translations = typeof th;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const translations = { th, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("th");

  const value = {
    language,
    setLanguage: useCallback((lang: Language) => setLanguage(lang), []),
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
