"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GalleryItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
};

const SPEED_PX_PER_SEC = 28;

// Fixed box height in px at each breakpoint (matches Tailwind classes below)
const BOX_H = { sm: 220, md: 280, lg: 340 };
// Horizontal aspect ratio (width / height) for landscape items
const LANDSCAPE_RATIO = 440 / 340;

function isVideo(item: GalleryItem) {
  return item.type === "video" || /\.(mp4|webm|ogg)(\?|$)/i.test(item.src);
}

/** Returns true if the media's natural dimensions are portrait (taller than wide) */
function detectPortrait(src: string, video: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (video) {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => resolve(el.videoHeight > el.videoWidth);
      el.onerror = () => resolve(false);
      el.src = src;
    } else {
      const img = new window.Image();
      img.onload = () => resolve(img.naturalHeight > img.naturalWidth);
      img.onerror = () => resolve(false);
      img.src = src;
    }
  });
}

export default function LiveGallery({
  photos,
}: {
  photos: readonly GalleryItem[];
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
  // portrait[i] = true means item i is portrait orientation
  const [portrait, setPortrait] = useState<boolean[]>([]);

  const loopItems = [...photos, ...photos];

  // Detect orientation for each unique item
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      photos.map((item) => detectPortrait(item.src, isVideo(item)))
    ).then((results) => {
      if (!cancelled) setPortrait(results);
    });
    return () => { cancelled = true; };
  }, [photos]);

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
    const measure = () => { halfWidthRef.current = track.scrollWidth / 2; };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [photos, portrait]);

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
  }, [paused, reduceMotion, photos]);

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

  /**
   * Compute inline width style for an item.
   * Portrait items use a flipped aspect ratio: width = height / LANDSCAPE_RATIO
   * Landscape items use the normal ratio:       width = height * LANDSCAPE_RATIO
   * We use the lg breakpoint height (340px) as the reference since CSS handles
   * the responsive height via Tailwind; the ratio stays the same across breakpoints.
   */
  function itemStyle(index: number): React.CSSProperties {
    // Use portrait array for originals; loop duplicates mirror the same index
    const origIndex = index % photos.length;
    const isPortrait = portrait[origIndex] ?? false;

    const ratio = isPortrait ? 1 / LANDSCAPE_RATIO : LANDSCAPE_RATIO;

    return {
      width: `${BOX_H.lg * ratio}px`,
    };
  }

  function itemSizes(index: number) {
    const origIndex = index % photos.length;
    const isPortrait = portrait[origIndex] ?? false;

    if (isPortrait) {
      return "(max-width: 640px) 170px, (max-width: 768px) 216px, 263px";
    }

    return "(max-width: 640px) 285px, (max-width: 768px) 362px, 440px";
  }

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
      role="region"
      aria-roledescription="carousel"
      aria-label="ALIGATR media"
    >
      <div
        ref={trackRef}
        className="flex w-max gap-3 will-change-transform md:gap-4"
      >
        {loopItems.map((item, index) => (
          <figure
            key={`${item.src}-${index}`}
            className="relative h-[220px] shrink-0 overflow-hidden bg-surface sm:h-[280px] md:h-[340px]"
            style={itemStyle(index)}
          >
            {isVideo(item) ? (
              <video
                src={item.src}
                className="pointer-events-none h-full w-full select-none object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={item.alt}
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={itemSizes(index)}
                quality={90}
                className="pointer-events-none select-none object-cover"
                draggable={false}
              />
            )}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"
              aria-hidden
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
