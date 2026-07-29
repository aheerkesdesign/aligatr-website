"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GalleryItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
};

const SPEED_PX_PER_SEC = 28;

function isVideo(item: GalleryItem) {
  return item.type === "video" || /\.(mp4|webm|ogg)(\?|$)/i.test(item.src);
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

  const loopItems = [...photos, ...photos];

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
  }, [photos]);

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
          while (offsetRef.current <= -half) {
            offsetRef.current += half;
          }
          while (offsetRef.current > 0) {
            offsetRef.current -= half;
          }
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

  return (
    <div
      className="relative -mx-5 cursor-grab overflow-hidden active:cursor-grabbing sm:-mx-8"
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
            className={`relative h-[220px] shrink-0 overflow-hidden bg-surface sm:h-[280px] md:h-[340px] ${
              isVideo(item)
                ? "w-[340px] sm:w-[440px] md:w-[540px]"
                : "w-[280px] sm:w-[360px] md:w-[440px]"
            }`}
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
                sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, 440px"
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
