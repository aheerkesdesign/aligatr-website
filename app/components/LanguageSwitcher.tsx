"use client";

import { useLanguage } from "@/app/i18n/LanguageProvider";
import type { Locale } from "@/app/i18n/translations";

const options: Locale[] = ["nl", "en"];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.lang.label}
      className="flex items-center border border-border"
    >
      {options.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            className={`cursor-pointer px-2.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive sm:px-3 sm:text-xs ${
              active
                ? "bg-olive text-background"
                : "bg-transparent text-muted hover:text-olive-glow"
            }`}
          >
            {t.lang[option]}
          </button>
        );
      })}
    </div>
  );
}
