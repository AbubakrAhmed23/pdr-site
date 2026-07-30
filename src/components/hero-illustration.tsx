import { cn } from "@/lib/utils";

/**
 * Hero için soyut, sıcak illüstrasyon: organik blob + yaprak + sohbet balonu.
 * Fotoğraf değil; tüm renkler tema değişkenlerinden gelir.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 460"
      role="presentation"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="pdr-blob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="pdr-leaf" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {/* Ana organik blob */}
      <path
        d="M240 18C332 18 421 70 449 161c28 91-19 190-100 240-81 50-201 47-266-10C18 334 6 218 47 138 88 58 148 18 240 18Z"
        fill="url(#pdr-blob)"
      />

      {/* Kaydırılmış ince kontur — derinlik hissi */}
      <path
        d="M262 44c86 0 168 49 194 134 26 85-18 178-93 225"
        fill="none"
        stroke="var(--primary)"
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Yaprak — büyüme/iyileşme motifi */}
      <path
        d="M252 330c0-84 62-148 148-160 8 86-56 156-142 163Z"
        fill="url(#pdr-leaf)"
      />
      <path
        d="M252 330c42-38 96-100 148-160"
        fill="none"
        stroke="var(--background)"
        strokeOpacity="0.75"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Sohbet balonu — büyük */}
      <g>
        <path
          d="M96 108h158a26 26 0 0 1 26 26v66a26 26 0 0 1-26 26H150l-38 30 6-30h-22a26 26 0 0 1-26-26v-66a26 26 0 0 1 26-26Z"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <rect x="120" y="142" width="110" height="10" rx="5" fill="var(--primary)" fillOpacity="0.35" />
        <rect x="120" y="164" width="78" height="10" rx="5" fill="var(--accent)" fillOpacity="0.45" />
        <rect x="120" y="186" width="96" height="10" rx="5" fill="var(--primary)" fillOpacity="0.18" />
      </g>

      {/* Sohbet balonu — küçük, karşı taraf */}
      <g>
        <path
          d="M300 246h74a22 22 0 0 1 22 22v34a22 22 0 0 1-22 22h-18l-24 22 4-22h-36a22 22 0 0 1-22-22v-34a22 22 0 0 1 22-22Z"
          fill="var(--accent-soft)"
          stroke="var(--accent)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <circle cx="322" cy="285" r="5" fill="var(--accent-strong)" fillOpacity="0.65" />
        <circle cx="340" cy="285" r="5" fill="var(--accent-strong)" fillOpacity="0.45" />
        <circle cx="358" cy="285" r="5" fill="var(--accent-strong)" fillOpacity="0.3" />
      </g>

      {/* Serpiştirilmiş noktalar */}
      <circle cx="72" cy="284" r="7" fill="var(--primary)" fillOpacity="0.3" />
      <circle cx="122" cy="330" r="4" fill="var(--accent)" fillOpacity="0.55" />
      <circle cx="390" cy="96" r="5" fill="var(--accent)" fillOpacity="0.5" />
      <circle cx="418" cy="132" r="3" fill="var(--primary)" fillOpacity="0.4" />
    </svg>
  );
}
