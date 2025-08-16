"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "../lib/i18n";

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en"); // default to English

  useEffect(() => {
    // 1. Try to get saved language from localStorage
    const savedLang = localStorage.getItem("language");

    if (savedLang) {
      changeLanguage(savedLang);
    } else {
      // 2. Detect browser language
      const browserLang = navigator.language || navigator.languages[0] || "en";

      // 3. Check if it's Arabic ('ar') or English ('en'), else default to English
      const lang = browserLang.startsWith("ar") ? "ar" : "en";

      changeLanguage(lang);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
