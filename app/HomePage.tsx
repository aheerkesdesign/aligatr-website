"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ContactForm from "./components/ContactForm";
import FadeIn from "./components/FadeIn";
import LanguageSwitcher from "./components/LanguageSwitcher";
import LiveGallery from "./components/LiveGallery";
import MixCards from "./components/MixCards";
import SectionNav from "./components/SectionNav";
import VenueLogoCarousel from "./components/VenueLogoCarousel";
import { useLanguage } from "./i18n/LanguageProvider";
import type { Venue } from "./lib/venues";

const socialIconClass =
  "interactive-transition flex h-10 w-10 items-center justify-center rounded-sm text-muted hover:text-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/dj.aligatr/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.5.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.5-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.5-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.5.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.9-.1zm0 1.8c-3.2 0-3.5 0-4.8.1-.9 0-1.5.2-1.8.3-.5.2-.7.3-1 .6-.3.3-.5.5-.6 1-.1.3-.3.9-.3 1.8-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c0 .9.2 1.5.3 1.8.2.5.3.7.6 1 .3.3.5.5 1 .6.3.1.9.3 1.8.3 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c.9 0 1.5-.2 1.8-.3.5-.2.7-.3 1-.6.3-.3.5-.5.6-1 .1-.3.3-.9.3-1.8.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c0-.9-.2-1.5-.3-1.8-.2-.5-.3-.7-.6-1-.3-.3-.5-.5-1-.6-.3-.1-.9-.3-1.8-.3-1.2-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.4-8.4a1.2 1.2 0 1 1-2.3 0 1.2 1.2 0 0 1 2.3 0z" />
      </svg>
    ),
  },
  {
    name: "SoundCloud",
    href: "https://soundcloud.com/aligatr",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@dj.aligatr",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@djaligatr",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186 31.247 31.247 0 0 0 0 12.017c0 2.016.185 4.03.502 5.831a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136c.318-1.801.502-3.815.502-5.831s-.184-4.03-.502-5.831zM9.545 15.568V8.466l6.273 3.551-6.273 3.551z" />
      </svg>
    ),
  },
];

export default function HomePage({ venues }: { venues: Venue[] }) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#media", label: t.nav.live },
    { href: "#music", label: t.nav.music },
    { href: "#contact", label: t.nav.contact },
  ];

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-[#121212]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:h-[4.25rem] sm:px-8">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            <a href="#top" className="group flex shrink-0 items-center gap-3">
              <Image
                src="/aligatr-logo-text.svg"
                alt="ALIGATR"
                width={190}
                height={32}
                className="h-6 w-auto sm:h-7"
                priority
                unoptimized
              />
              <Image
                src="/aligatr-logo.svg"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                priority
                aria-hidden
              />
            </a>
          </div>

          <SectionNav links={navLinks} ariaLabel={t.nav.primary} />

          <div className="flex min-w-0 flex-1 items-center justify-end">
            <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
              <a
                href="#contact"
                className="interactive-transition rounded-sm border border-olive px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-olive-glow hover:bg-olive hover:text-background sm:px-4 sm:text-xs"
              >
                {t.nav.book}
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <a
                href="#contact"
                className="interactive-transition hidden rounded-sm border border-olive px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-olive-glow hover:bg-olive hover:text-background sm:inline-block sm:px-4 sm:text-xs md:hidden"
              >
                {t.nav.book}
              </a>
              <button
                type="button"
                className="interactive-transition flex h-10 w-10 items-center justify-center rounded-sm text-muted hover:text-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive md:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                    <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                    <path d="M4 7h16v1.5H4V7zm0 4.25h16v1.5H4v-1.5zM4 15.5h16V17H4v-1.5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="mobile-menu"
            className="border-t border-border/60 bg-[#121212]/98 md:hidden"
          >
            <nav
              aria-label={t.nav.mobile}
              className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="interactive-transition rounded-sm px-2 py-3 text-sm font-medium uppercase tracking-[0.18em] text-muted hover:bg-surface hover:text-olive-glow"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                className="interactive-transition mt-2 rounded-sm border border-olive px-3 py-3 text-center text-sm font-medium uppercase tracking-[0.18em] text-olive-glow hover:bg-olive hover:text-background"
                onClick={() => setMenuOpen(false)}
              >
                {t.nav.book}
              </a>
              <div className="mt-4 flex justify-center border-t border-border/60 pt-4">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="top">
        <section className="relative isolate min-h-[100dvh] overflow-hidden border-b border-border">
          <Image
            src="/press-photo-front.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25"
            aria-hidden
          />
          <div className="noise-overlay pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col items-center justify-end px-5 pb-16 pt-24 text-center sm:px-8 sm:pb-20">
            <h1 className="animate-rise w-full max-w-5xl px-1">
              <Image
                src="/aligatr-logo-text.svg"
                alt="ALIGATR"
                width={1200}
                height={202}
                className="mx-auto h-auto w-full max-w-[min(90vw,42rem)]"
                priority
                unoptimized
              />
            </h1>

            <p className="animate-rise-delay-1 mt-3 max-w-xl text-sm font-medium uppercase tracking-[0.22em] text-olive-glow sm:mt-4 sm:text-base sm:tracking-[0.24em]">
              {t.hero.tagline}
            </p>

            <div className="animate-rise-delay-2 mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
              <a
                href="#music"
                className="interactive-transition rounded-sm border border-olive bg-olive px-8 py-3.5 text-center font-[family-name:var(--font-display)] text-xl tracking-[0.14em] text-background hover:border-olive-glow hover:bg-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
              >
                {t.hero.listen}
              </a>
              <a
                href="#contact"
                className="interactive-transition rounded-sm border border-foreground/25 bg-transparent px-8 py-3.5 text-center font-[family-name:var(--font-display)] text-xl tracking-[0.14em] text-foreground hover:border-olive hover:text-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
              >
                {t.hero.book}
              </a>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-b border-border py-20 sm:py-28"
        >
          <FadeIn className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-olive-glow">
                {t.about.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-wide text-foreground sm:text-6xl">
                {t.about.titleLine1}
                <br />
                <span className="text-olive">{t.about.titleLine2}</span>
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
              {t.about.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </FadeIn>
        </section>

        <section
          id="media"
          className="scroll-mt-24 border-b border-border bg-surface/40 py-20 sm:py-28"
        >
          <FadeIn className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-olive-glow">
                {t.live.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-wide text-foreground sm:text-6xl">
                {t.live.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {t.live.intro}
              </p>
            </div>

            <LiveGallery photos={t.live.photos} />
          </FadeIn>
        </section>

        <section
          id="music"
          className="scroll-mt-24 border-b border-border py-20 sm:py-28"
        >
          <FadeIn className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-olive-glow">
                {t.music.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-wide text-foreground sm:text-6xl">
                {t.music.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {t.music.intro}
              </p>
            </div>
            <MixCards />
          </FadeIn>
        </section>

        <section
          id="venues"
          className="scroll-mt-24 border-b border-border bg-surface/40 py-16 sm:py-20"
        >
          <FadeIn className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-olive-glow">
                {t.venues.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-foreground sm:text-5xl">
                {t.venues.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {t.venues.intro}
              </p>
            </div>
            <VenueLogoCarousel items={venues} ariaLabel={t.venues.carousel} />
          </FadeIn>
        </section>

        <section
          id="contact"
          className="scroll-mt-24 border-b border-border py-20 sm:py-28"
        >
          <FadeIn className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-olive-glow">
                {t.contact.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-wide text-foreground sm:text-6xl">
                {t.contact.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                {t.contact.intro}
              </p>

              <div className="mt-10 space-y-5">
                <a
                  href="mailto:aligatr.music@gmail.com"
                  className="group flex flex-col gap-1 border-l-2 border-olive pl-4 transition-colors hover:border-olive-glow"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-muted">
                    {t.contact.email}
                  </span>
                  <span className="interactive-transition text-lg text-foreground group-hover:text-olive-glow">
                    aligatr.music@gmail.com
                  </span>
                </a>

                <div className="border-l-2 border-border pl-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted">
                    {t.contact.social}
                  </span>
                  <div className="mt-2 flex gap-1">
                    {socials.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={socialIconClass}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </FadeIn>
        </section>
      </main>

      <footer className="bg-surface py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 sm:flex-row sm:justify-between sm:px-8">
          <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.16em] text-foreground">
            ALIGATR
          </p>
          <p className="text-center text-xs tracking-wide text-muted sm:text-left">
            © {new Date().getFullYear()} ALIGATR. {t.footer.rights}
          </p>
          <div className="flex gap-1">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={socialIconClass}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
