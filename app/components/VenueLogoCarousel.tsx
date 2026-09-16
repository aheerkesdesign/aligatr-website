"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Venue } from "@/app/lib/venues";

const SPEED_PX_PER_SEC = 36;

export default function VenueLogoCarousel({
  items,
  ariaLabel,
}: {
  items: readonly Venue[];
  ariaLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const resumedAtRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const loopItems = [...items, ...items];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!draggingRef.current && !paused && now >= resumedAtRef.current) {
        offsetRef.current -= SPEED_PX_PER_SEC * dt;
        const half = halfWidthRef.current;
        if (half > 0) {
          while (offsetRef.current <= -half) offsetRef.current += half;
          while (offsetRef.current > 0) offsetRef.current -= half;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduceMotion, items]);

  function normalizeOffset() {
    const half = halfWidthRef.current;
    if (half <= 0) return;
    while (offsetRef.current <= -half) offsetRef.current += half;
    while (offsetRef.current > 0) offsetRef.current -= half;
  }

  function applyTransform() {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    setPaused(true);
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const delta = event.clientX - dragStartXRef.current;
    offsetRef.current = dragStartOffsetRef.current + delta;
    normalizeOffset();
    applyTransform();
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resumedAtRef.current = performance.now() + 900;
    setPaused(false);
  }

  if (!items.length) return null;

  return (
    <div
      className="venue-logo-mask relative -mx-5 cursor-grab overflow-hidden active:cursor-grabbing sm:-mx-8"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(event) => {
        if (draggingRef.current) endDrag(event);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (!draggingRef.current) setPaused(false);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-10 py-2 will-change-transform sm:gap-14 md:gap-16"
      >
        {loopItems.map((venue, index) => (
          <figure
            key={`${venue.name}-${index}`}
            className="group flex h-14 w-[9.5rem] shrink-0 items-center justify-center sm:h-16 sm:w-[11rem]"
          >
            <Image
              src={venue.src}
              alt={venue.name}
              width={176}
              height={64}
              className="pointer-events-none h-full w-full select-none object-contain opacity-45 grayscale transition-opacity duration-200 group-hover:opacity-80"
              draggable={false}
              unoptimized
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
