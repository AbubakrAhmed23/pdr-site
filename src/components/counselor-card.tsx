import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * "Uzman kartı" — danışmanın kısa tanıtımı, eğitim rozeti ve profil bağlantısı.
 */
export function CounselorCard({
  name,
  title,
  bio,
  photoUrl,
  label,
  badge,
  cta,
}: {
  name: string;
  title?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  label: string;
  badge: string;
  cta: string;
}) {
  return (
    <div className="reveal overflow-hidden rounded-2xl border border-border-soft bg-card shadow-card">
      <div className="grid gap-8 p-6 sm:p-9 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full icon-gradient blur-[2px]" aria-hidden />
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                width={128}
                height={128}
                unoptimized
                className="relative size-28 rounded-full object-cover ring-4 ring-card sm:size-32"
              />
            ) : (
              <div className="relative flex size-28 items-center justify-center rounded-full bg-primary/12 text-2xl font-semibold text-primary ring-4 ring-card sm:size-32">
                {initials(name)}
              </div>
            )}
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-heading">
            {name}
          </p>
          {title && (
            <p className="mt-1 text-sm font-medium text-primary">{title}</p>
          )}

          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent-foreground">
            <GraduationCap className="size-3.5" />
            {badge}
          </span>

          {bio && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {bio}
            </p>
          )}

          <div className="mt-6">
            <Link href="/about">
              <Button variant="outline" size="sm">
                {cta}
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
