"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LOCALE_COOKIE, messages, type Locale } from "@/lib/i18n";

const LanguageContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, updateLocale] = useState(initialLocale);
  const setLocale = (next: Locale) => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    updateLocale(next);
  };
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = messages[locale].seoTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", messages[locale].seoDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", messages[locale].seoTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", messages[locale].seoDescription);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", locale === "it" ? "it_IT" : "en_GB");
  }, [locale]);
  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage requires LanguageProvider");
  return { ...context, t: messages[context.locale] };
}

export function LanguageSwitch() {
  const { locale, setLocale, t } = useLanguage();
  return <div className="language-switch" role="group" aria-label={t.languageLabel}>
    <button type="button" lang="it" aria-label="Italiano" aria-pressed={locale === "it"} onClick={() => setLocale("it")}>IT</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="en" aria-label="English" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
  </div>;
}
