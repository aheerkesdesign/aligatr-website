"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/app/i18n/LanguageProvider";

const fieldClass =
  "interactive-transition w-full rounded-sm border border-border bg-surface px-4 py-3 text-[0.95rem] text-foreground outline-none placeholder:text-[#6f6f6f] focus:border-olive";
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim();

export default function ContactForm() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const c = t.contact;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!FORMSPREE_ENDPOINT) {
      setError(c.configError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.append("_subject", "New ALIGATR booking request");

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      setSubmitted(true);
    } catch {
      setError(c.errorBody);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-sm border border-olive/40 bg-surface-raised p-8 text-center"
      >
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-olive-glow">
          {c.successTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{c.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.name} htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder={c.namePlaceholder}
          />
        </Field>
        <Field label={c.emailLabel} htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder={c.emailPlaceholder}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.date} htmlFor="date">
          <input
            id="date"
            name="date"
            type="date"
            required
            className={`${fieldClass} [color-scheme:dark]`}
          />
        </Field>
        <Field label={c.eventType} htmlFor="eventType">
          <select
            id="eventType"
            name="eventType"
            required
            className={`${fieldClass} appearance-none bg-[length:12px_8px] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239a9a9a' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">{c.eventTypePlaceholder}</option>
            {c.eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={c.message} htmlFor="message">
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${fieldClass} min-h-[140px] resize-y`}
          placeholder={c.messagePlaceholder}
        />
      </Field>

      {error ? (
        <div
          role="alert"
          className="rounded-sm border border-red-400/30 bg-red-950/20 px-4 py-3 text-sm text-red-100"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="interactive-transition w-full rounded-sm border border-olive bg-olive px-6 py-3.5 font-[family-name:var(--font-display)] text-xl tracking-[0.12em] text-background hover:border-olive-glow hover:bg-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[220px]"
      >
        {submitting ? c.submitting : c.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2" htmlFor={htmlFor}>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
