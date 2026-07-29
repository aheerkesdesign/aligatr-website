"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

type BarState = {
  left: number;
  width: number;
  visible: boolean;
};

export default function SectionNav({
  links,
  ariaLabel,
}: {
  links: readonly NavLink[];
  ariaLabel: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const scrollLockRef = useRef<string | null>(null);
  const scrollLockTimerRef = useRef<number | null>(null);

  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [hoverHref, setHoverHref] = useState<string | null>(null);
  const [bar, setBar] = useState<BarState>({
    left: 0,
    width: 0,
    visible: false,
  });

  const targetHref = hoverHref ?? activeHref;

  const moveBarTo = useCallback((href: string | null) => {
    const nav = navRef.current;
    if (!nav || !href) {
      setBar((prev) => ({ ...prev, visible: false }));
      return;
    }

    const index = links.findIndex((link) => link.href === href);
    const linkEl = linkRefs.current[index];
    if (!linkEl) {
      setBar((prev) => ({ ...prev, visible: false }));
      return;
    }

    setBar({
      left: linkEl.offsetLeft,
      width: linkEl.offsetWidth,
      visible: true,
    });
  }, [links]);

  useEffect(() => {
    moveBarTo(targetHref);
  }, [moveBarTo, targetHref, links]);

  useEffect(() => {
    function onResize() {
      moveBarTo(targetHref);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveBarTo, targetHref]);

  useEffect(() => {
    const hrefs = links.map((link) => link.href);

    function resolveActiveSection() {
      if (scrollLockRef.current) {
        setActiveHref(scrollLockRef.current);
        return;
      }

      const marker = Math.min(160, window.innerHeight * 0.28);
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (nearBottom) {
        setActiveHref(hrefs[hrefs.length - 1] ?? null);
        return;
      }

      let current: string | null = null;
      for (const href of hrefs) {
        const section = document.getElementById(href.slice(1));
        if (!section) continue;
        if (section.getBoundingClientRect().top <= marker) {
          current = href;
        }
      }

      setActiveHref(current);
    }

    resolveActiveSection();
    window.addEventListener("scroll", resolveActiveSection, { passive: true });
    window.addEventListener("resize", resolveActiveSection);
    return () => {
      window.removeEventListener("scroll", resolveActiveSection);
      window.removeEventListener("resize", resolveActiveSection);
    };
  }, [links]);

  useEffect(() => {
    return () => {
      if (scrollLockTimerRef.current != null) {
        window.clearTimeout(scrollLockTimerRef.current);
      }
    };
  }, []);

  function lockActive(href: string) {
    scrollLockRef.current = href;
    setActiveHref(href);
    if (scrollLockTimerRef.current != null) {
      window.clearTimeout(scrollLockTimerRef.current);
    }
    scrollLockTimerRef.current = window.setTimeout(() => {
      scrollLockRef.current = null;
      scrollLockTimerRef.current = null;
    }, 900);
  }

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className="relative hidden shrink-0 items-center gap-8 md:flex"
      onMouseLeave={() => setHoverHref(null)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 h-0.5 rounded-full bg-olive-glow transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: bar.left,
          width: bar.width,
          opacity: bar.visible ? 1 : 0,
        }}
      />

      {links.map((link, index) => {
        const isActive = activeHref === link.href;
        const isHovered = hoverHref === link.href;
        const emphasized = isHovered || (isActive && !hoverHref);

        return (
          <a
            key={link.href}
            ref={(el) => {
              linkRefs.current[index] = el;
            }}
            href={link.href}
            aria-current={isActive ? "true" : undefined}
            className={`relative py-1 text-xs font-medium uppercase tracking-[0.22em] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              emphasized ? "text-olive-glow" : "text-muted hover:text-olive-glow"
            }`}
            onMouseEnter={() => setHoverHref(link.href)}
            onFocus={() => setHoverHref(link.href)}
            onBlur={() => setHoverHref(null)}
            onClick={() => lockActive(link.href)}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
