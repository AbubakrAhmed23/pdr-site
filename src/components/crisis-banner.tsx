"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Toast'un ekranda kalma süresi (ms). Kısaltmak/uzatmak için burayı değiştir. */
const VISIBLE_MS = 7000;
/** Bu kadar kaydırıldıktan sonra görünür. */
const SCROLL_TRIGGER_PX = 180;
/** Kaydırma olmayan kısa sayfalarda yine de görünsün diye yedek gecikme (ms). */
const FALLBACK_MS = 4000;
/** Oturum başına bir kez göster. */
const SESSION_KEY = "pdr-crisis-toast-shown";

type Phase = "hidden" | "in" | "out";

/**
 * Kriz/acil durum bilgisi — sayfa akışını bozmayan, yandan kayarak giren
 * ve kendiliğinden kaybolan toast. Bilgi kalıcı olarak footer'da da yer alır.
 */
export function CrisisBanner() {
  const t = useTranslations("Crisis");
  const [phase, setPhase] = useState<Phase>("hidden");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paused = useRef(false);

  const dismiss = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setPhase("out");
    exitTimer.current = setTimeout(() => setPhase("hidden"), 350);
  }, []);

  const startHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!paused.current) dismiss();
    }, VISIBLE_MS);
  }, [dismiss]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      sessionStorage.setItem(SESSION_KEY, "1");
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fallback);
      setPhase("in");
      startHideTimer();
    };
    const onScroll = () => {
      if (window.scrollY > SCROLL_TRIGGER_PX) reveal();
    };
    const fallback = setTimeout(reveal, FALLBACK_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fallback);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, [startHideTimer]);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      // Fareyle üzerine gelince / odaklanınca sayaç durur, okunacak vakit kalır.
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
        startHideTimer();
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={() => {
        paused.current = false;
        startHideTimer();
      }}
      className={cn(
        "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:bottom-6 sm:right-6",
        phase === "in" ? "toast-in" : "toast-out",
      )}
    >
      <div className="flex gap-3 overflow-hidden rounded-2xl border border-destructive/20 border-l-4 border-l-destructive bg-card p-4 shadow-card-hover">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-heading">{t("title")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("body")}
          </p>
          <a
            href="tel:112"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/15"
          >
            <Phone className="size-3.5" />
            112
          </a>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label={t("title")}
          className="-mr-1 -mt-1 size-7 shrink-0 rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="mx-auto size-4" />
        </button>
      </div>
    </div>
  );
}
