"use client";

import { useLanguage } from "@/app/i18n/LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const isEn = locale === "en";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEn}
      aria-label={t.lang.label}
      onClick={() => setLocale(isEn ? "nl" : "en")}
      className="relative grid h-8 w-[4.75rem] cursor-pointer grid-cols-2 items-center overflow-hidden rounded-sm border border-border bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive sm:h-9 sm:w-[5.25rem]"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/2 rounded-[1px] bg-olive transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: isEn ? "translateX(100%)" : "translateX(0%)" }}
      />
      <span
        className={`relative z-10 text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 sm:text-xs ${
          isEn ? "text-muted" : "text-background"
        }`}
      >
        {t.lang.nl}
      </span>
      <span
        className={`relative z-10 text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 sm:text-xs ${
          isEn ? "text-background" : "text-muted"
        }`}
      >
        {t.lang.en}
      </span>
    </button>
  );
}
