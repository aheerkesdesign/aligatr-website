"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function FadeIn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      setSettled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || settled) return;
    // Safety net if transitionend is skipped (tab backgrounded, reduced motion mid-flight).
    const timer = window.setTimeout(() => setSettled(true), 1000);
    return () => window.clearTimeout(timer);
  }, [visible, settled]);

  return (
    <div
      ref={ref}
      className={`fade-in-section ${visible ? "is-visible" : ""} ${settled ? "is-settled" : ""} ${className}`}
      onTransitionEnd={(event) => {
        if (event.target !== ref.current) return;
        if (event.propertyName !== "transform" && event.propertyName !== "opacity") {
          return;
        }
        if (visible) setSettled(true);
      }}
    >
      {children}
    </div>
  );
}
