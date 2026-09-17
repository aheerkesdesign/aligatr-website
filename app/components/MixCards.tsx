"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/app/i18n/LanguageProvider";

const PLAYLIST_URL = "https://soundcloud.com/aligatr/sets/aligatr-mixtapes";
const WIDGET_API_SRC = "https://w.soundcloud.com/player/api.js";

type SoundCloudSound = {
  id?: number | string;
  title?: string;
  duration?: number;
  description?: string;
  permalink_url?: string;
};

type MixTrack = {
  index: number;
  id: string;
  title: string;
  description: string;
  durationMs: number;
  durationLabel: string;
};

type PlayProgressEvent = {
  currentPosition?: number;
};

type SoundCloudWidget = {
  bind: (eventName: string, listener: (...args: unknown[]) => void) => void;
  play: () => void;
  pause: () => void;
  skip: (index: number) => void;
  seekTo: (ms: number) => void;
  setVolume: (volume: number) => void;
  getSounds: (callback: (sounds: SoundCloudSound[]) => void) => void;
  getCurrentSound: (callback: (sound: SoundCloudSound | null) => void) => void;
  getCurrentSoundIndex: (callback: (index: number) => void) => void;
  getDuration: (callback: (ms: number) => void) => void;
};

declare global {
  interface Window {
    SC?: {
      Widget: ((el: HTMLIFrameElement | string) => SoundCloudWidget) & {
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          PLAY_PROGRESS: string;
        };
      };
    };
  }
}

function formatDuration(ms?: number) {
  if (ms == null || ms < 0 || Number.isNaN(ms)) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T) {
  return new Promise<T>((resolve) => {
    let settled = false;
    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(fallback), ms);
    promise.then(finish, () => finish(fallback));
  });
}

function loadWidgetApi() {
  if (window.SC?.Widget) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${WIDGET_API_SRC}"]`,
  );
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      if (window.SC?.Widget) {
        resolve();
        return;
      }

      const timer = window.setTimeout(() => {
        reject(new Error("Widget API failed"));
      }, 8000);

      existing.addEventListener(
        "load",
        () => {
          window.clearTimeout(timer);
          if (window.SC?.Widget) resolve();
          else reject(new Error("Widget API failed"));
        },
        { once: true },
      );
      existing.addEventListener(
        "error",
        () => {
          window.clearTimeout(timer);
          reject(new Error("Widget API failed"));
        },
        { once: true },
      );
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_API_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Widget API failed"));
    document.body.appendChild(script);
  });
}

function getSounds(widget: SoundCloudWidget, timeoutMs = 1500) {
  return withTimeout(
    new Promise<SoundCloudSound[]>((resolve) => {
      widget.getSounds((sounds) => resolve(sounds ?? []));
    }),
    timeoutMs,
    [],
  );
}

function getCurrentSound(widget: SoundCloudWidget, timeoutMs = 1200) {
  return withTimeout(
    new Promise<SoundCloudSound | null>((resolve) => {
      widget.getCurrentSound((sound) => resolve(sound ?? null));
    }),
    timeoutMs,
    null,
  );
}

function isSoundResolved(sound: SoundCloudSound) {
  return typeof sound.title === "string" && sound.title.trim().length > 0;
}

function placeholderTitle(index: number) {
  return `Mix ${index + 1}`;
}

function isPlaceholderTitle(title: string, index: number) {
  return title === placeholderTitle(index);
}

function toMixTrack(sound: SoundCloudSound, index: number): MixTrack {
  const rawTitle = typeof sound.title === "string" ? sound.title.trim() : "";
  const title = rawTitle || placeholderTitle(index);
  const description =
    typeof sound.description === "string" ? sound.description.trim() : "";
  const durationMs =
    typeof sound.duration === "number" && sound.duration > 0
      ? sound.duration
      : 0;

  return {
    index,
    id: String(sound.id ?? `${title}-${index}`),
    title,
    description,
    durationMs,
    durationLabel: durationMs > 0 ? formatDuration(durationMs) : "--:--",
  };
}

function mergeTrack(existing: MixTrack | undefined, next: MixTrack): MixTrack {
  if (!existing) return next;

  const preferNextTitle = !isPlaceholderTitle(next.title, next.index);
  return {
    ...existing,
    id: next.id || existing.id,
    title: preferNextTitle ? next.title : existing.title,
    description: next.description || existing.description,
    durationMs: next.durationMs || existing.durationMs,
    durationLabel:
      next.durationMs > 0 ? next.durationLabel : existing.durationLabel,
  };
}

function mergeTracks(prev: MixTrack[], sounds: SoundCloudSound[]): MixTrack[] {
  const length = Math.max(prev.length, sounds.length);
  const next: MixTrack[] = [];

  for (let i = 0; i < length; i++) {
    const sound = sounds[i];
    const existing = prev[i];
    if (sound) {
      next.push(mergeTrack(existing, toMixTrack(sound, i)));
    } else if (existing) {
      next.push(existing);
    }
  }

  return next;
}

function tracksNeedHydration(tracks: MixTrack[]) {
  return tracks.some(
    (track) =>
      isPlaceholderTitle(track.title, track.index) || track.durationMs <= 0,
  );
}

async function waitForSounds(widget: SoundCloudWidget, budgetMs = 16000) {
  const deadline = Date.now() + budgetMs;
  let best: SoundCloudSound[] = [];

  while (Date.now() < deadline) {
    const sounds = await getSounds(widget);
    if (sounds.length > 0) {
      // Prefer the longest playlist snapshot; SoundCloud may grow it as
      // later tracks resolve.
      if (sounds.length >= best.length) best = sounds;
      if (sounds.every(isSoundResolved) && sounds.length >= best.length) {
        return sounds;
      }
    }
    await wait(250);
  }

  return best;
}

export default function MixCards() {
  const { t } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [tracks, setTracks] = useState<MixTrack[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playerDismissed, setPlayerDismissed] = useState(false);
  const [userHasPlayed, setUserHasPlayed] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const activeTrack =
    playingIndex == null ? null : (tracks[playingIndex] ?? null);
  const showPlayer = userHasPlayed && activeTrack != null && !playerDismissed;
  const progress =
    durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0;

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (iframeLoaded) return;
    // Safety net if the load event is swallowed (rare with cross-origin iframes).
    const timer = window.setTimeout(() => setIframeLoaded(true), 4000);
    return () => window.clearTimeout(timer);
  }, [iframeLoaded]);

  useEffect(() => {
    if (!iframeLoaded) return;

    let cancelled = false;
    const iframe = iframeRef.current;
    if (!iframe) return;

    async function setup() {
      try {
        await loadWidgetApi();
        if (cancelled || !iframeRef.current || !window.SC?.Widget) {
          throw new Error("Widget unavailable");
        }

        const widget = window.SC.Widget(iframeRef.current);
        widgetRef.current = widget;
        let started = false;

        const hydratePlaylist = async (budgetMs: number) => {
          const deadline = Date.now() + budgetMs;
          while (!cancelled && Date.now() < deadline) {
            const sounds = await getSounds(widget);
            if (sounds.length > 0) {
              setTracks((prev) => mergeTracks(prev, sounds));
              if (sounds.every(isSoundResolved)) return true;
            }
            await wait(400);
          }
          return false;
        };

        const onReady = async () => {
          if (cancelled || started) return;
          started = true;
          try {
            // Playlist metadata can lag behind READY on a cold SoundCloud load.
            // Do not skip/play through tracks to hydrate — mobile browsers often
            // never answer those Widget API calls without a user gesture, which
            // left this UI stuck on "Loading mixes…".
            const sounds = await waitForSounds(widget);
            if (cancelled) return;
            if (!sounds.length) {
              setStatus("error");
              return;
            }
            setTracks(sounds.map(toMixTrack));
            setStatus("ready");

            // Later playlist items often arrive as untitled stubs first.
            // Keep polling so "Mix 6" fills in without requiring a click.
            if (!sounds.every(isSoundResolved)) {
              void hydratePlaylist(18000);
            }
          } catch {
            if (!cancelled) setStatus("error");
          }
        };

        widget.bind(window.SC.Widget.Events.READY, onReady);
        widget.bind(window.SC.Widget.Events.PLAY, () => {
          if (cancelled) return;
          setIsPlaying(true);
          setPlayerDismissed(false);
          widget.getCurrentSoundIndex((index) => {
            if (!cancelled) setPlayingIndex(index);
          });
          widget.getDuration((ms) => {
            if (!cancelled && typeof ms === "number") setDurationMs(ms);
          });
          // Playing often unlocks full metadata for the current (and nearby) tracks.
          void (async () => {
            const sound = await getCurrentSound(widget);
            if (cancelled || !sound) return;
            widget.getCurrentSoundIndex((index) => {
              if (cancelled || typeof index !== "number") return;
              const next = toMixTrack(sound, index);
              setTracks((prev) =>
                prev.map((track, i) =>
                  i === index ? mergeTrack(track, next) : track,
                ),
              );
              if (next.durationMs > 0) setDurationMs(next.durationMs);
            });
            const sounds = await getSounds(widget);
            if (!cancelled && sounds.length > 0) {
              setTracks((prev) => mergeTracks(prev, sounds));
            }
          })();
        });
        widget.bind(window.SC.Widget.Events.PAUSE, () => {
          if (!cancelled) setIsPlaying(false);
        });
        widget.bind(window.SC.Widget.Events.FINISH, () => {
          if (!cancelled) {
            setIsPlaying(false);
            setPositionMs(0);
          }
        });
        widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (payload) => {
          if (cancelled || draggingRef.current) return;
          const event = payload as PlayProgressEvent;
          if (typeof event.currentPosition === "number") {
            setPositionMs(event.currentPosition);
          }
        });

        // READY often already fired by the time we bind after iframe onLoad.
        window.setTimeout(() => {
          if (!cancelled) void onReady();
        }, 300);
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void setup();

    return () => {
      cancelled = true;
    };
  }, [iframeLoaded]);

  async function hydratePlayingTrack(index: number) {
    const widget = widgetRef.current;
    if (!widget) return;

    for (let attempt = 0; attempt < 8; attempt++) {
      const sound = await getCurrentSound(widget);
      if (sound && isSoundResolved(sound)) {
        const next = toMixTrack(sound, index);
        setTracks((prev) =>
          prev.map((track, i) => (i === index ? mergeTrack(track, next) : track)),
        );
        if (next.durationMs > 0) setDurationMs(next.durationMs);
        break;
      }
      await wait(200);
    }

    const sounds = await getSounds(widget);
    if (sounds.length > 0) {
      setTracks((prev) => mergeTracks(prev, sounds));
    }
  }

  async function toggleTrack(index: number) {
    const widget = widgetRef.current;
    if (!widget) return;

    if (playingIndex === index && isPlaying) {
      widget.pause();
      return;
    }

    if (playingIndex === index && !isPlaying) {
      setPlayerDismissed(false);
      setUserHasPlayed(true);
      widget.play();
      if (tracksNeedHydration(tracks)) void hydratePlayingTrack(index);
      return;
    }

    setPlayerDismissed(false);
    setUserHasPlayed(true);
    widget.skip(index);
    await wait(80);
    widget.play();
    setPlayingIndex(index);
    setPositionMs(0);
    setDurationMs(tracks[index]?.durationMs ?? 0);

    // User gesture unlocks full track metadata that getSounds often stubs out.
    void hydratePlayingTrack(index);
  }

  function toggleActive() {
    const widget = widgetRef.current;
    if (!widget || playingIndex == null) return;
    if (isPlaying) widget.pause();
    else {
      setPlayerDismissed(false);
      setUserHasPlayed(true);
      widget.play();
    }
  }

  function seekFromClientX(clientX: number) {
    const widget = widgetRef.current;
    const track = scrubRef.current;
    if (!widget || !track || durationMs <= 0) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const ms = Math.round(durationMs * ratio);
    widget.seekTo(ms);
    setPositionMs(ms);
  }

  function onScrubPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromClientX(event.clientX);
  }

  function onScrubPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    seekFromClientX(event.clientX);
  }

  function onScrubPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const playerBar =
    showPlayer && activeTrack ? (
      <div
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-olive/40 bg-[#121212]/95 backdrop-blur-md"
        role="region"
        aria-label={t.music.nowPlaying}
      >
        <div
          ref={scrubRef}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={Math.max(durationMs, 1)}
          aria-valuenow={positionMs}
          aria-label="Seek"
          className="group relative flex h-4 w-full cursor-pointer items-center bg-transparent"
          style={{ touchAction: "none" }}
          onPointerDown={onScrubPointerDown}
          onPointerMove={onScrubPointerMove}
          onPointerUp={onScrubPointerUp}
          onPointerCancel={onScrubPointerUp}
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-border">
            <div
              className="absolute inset-y-0 left-0 bg-olive"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#121212] bg-olive-glow shadow-[0_0_0_1px_rgba(107,112,67,0.5)] transition-transform group-hover:scale-110"
            style={{ left: `${progress}%` }}
            aria-hidden
          />
        </div>

        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-3 pt-1 sm:gap-5 sm:px-8 sm:pb-4">
          <button
            type="button"
            onClick={toggleActive}
            aria-label={
              isPlaying
                ? `${t.music.pause} ${activeTrack.title}`
                : `${t.music.play} ${activeTrack.title}`
            }
            className="interactive-transition flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-olive bg-olive text-background hover:border-olive-glow hover:bg-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 translate-x-0.5"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-olive-glow">
              {t.music.nowPlaying}
            </p>
            <p className="truncate font-[family-name:var(--font-display)] text-xl tracking-wide text-foreground sm:text-2xl">
              {activeTrack.title}
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-muted">
              {formatDuration(positionMs)} /{" "}
              {formatDuration(durationMs || activeTrack.durationMs)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              widgetRef.current?.pause();
              setPlayerDismissed(true);
            }}
            aria-label="Close player"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
            </svg>
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="relative">
      <iframe
        ref={iframeRef}
        title="ALIGATR SoundCloud playlist"
        allow="autoplay; encrypted-media"
        loading="eager"
        onLoad={() => setIframeLoaded(true)}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(PLAYLIST_URL)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&buying=false&sharing=false&download=false`}
        // Keep a real box in the viewport. 1×1 / off-screen iframes often never
        // finish initializing the SoundCloud Widget API on mobile browsers.
        className="pointer-events-none fixed left-0 top-0 -z-10 h-[166px] w-[100px] opacity-0"
        tabIndex={-1}
        aria-hidden
      />

      {status === "loading" && (
        <div className="rounded-sm border border-border bg-surface-raised/80 px-6 py-10 text-center text-sm tracking-wide text-muted">
          {t.music.loading}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-sm border border-border bg-surface-raised/80 px-6 py-10 text-center">
          <p className="text-sm tracking-wide text-muted">
            {t.music.error}
          </p>
          <a
            href={PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block cursor-pointer text-sm text-olive-glow transition-colors hover:text-foreground"
          >
            {t.music.openPlaylist}
          </a>
        </div>
      )}

      {status === "ready" && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((mix) => {
            const playing = playingIndex === mix.index && isPlaying;

            return (
              <li
                key={mix.id}
                className="group relative overflow-hidden rounded-sm border border-border bg-surface-raised/80 transition-colors hover:border-olive/50"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-olive-deep via-olive to-olive-glow" />
                <div className="flex flex-col gap-5 p-6 pt-8">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-foreground">
                      {mix.title}
                    </h3>
                    <button
                      type="button"
                      aria-label={
                        playing
                          ? `${t.music.pause} ${mix.title}`
                          : `${t.music.play} ${mix.title}`
                      }
                      aria-pressed={playing}
                      onClick={() => void toggleTrack(mix.index)}
                      className="interactive-transition flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-olive bg-olive text-background hover:border-olive-glow hover:bg-olive-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
                    >
                      {playing ? (
                        <span className="flex h-4 items-end gap-1" aria-hidden>
                          <span
                            className="eq-bar inline-block h-4 w-1 bg-background"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="eq-bar inline-block h-4 w-1 bg-background"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="eq-bar inline-block h-4 w-1 bg-background"
                            style={{ animationDelay: "300ms" }}
                          />
                        </span>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6 translate-x-0.5"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M8 5.5v13l11-6.5-11-6.5z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                    {mix.description || t.music.trackFallback}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs uppercase tracking-[0.16em] text-muted">
                    <span>{mix.durationLabel}</span>
                    <span className={playing ? "text-olive-glow" : ""}>
                      {playing ? t.music.playing : t.music.ready}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {portalReady && playerBar
        ? createPortal(playerBar, document.body)
        : null}
    </div>
  );
}
