"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeartHandshake, AlertTriangle } from "lucide-react";

const PAGE_LINKS = [
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/blog", key: "blog" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/privacy", key: "privacy" },
  { href: "/legal/kvkk", key: "kvkk" },
  { href: "/legal/terms", key: "terms" },
  { href: "/legal/contract", key: "contract" },
] as const;

export function SiteFooter() {
  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const tCrisis = useTranslations("Crisis");

  return (
    <footer className="mt-auto bg-heading text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-background transition-opacity hover:opacity-80"
          >
            <HeartHandshake className="size-6 text-accent" />
            PDR Danışmanlık
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-background/65">
            {tFooter("tagline")}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {tFooter("navTitle")}
          </h3>
          <ul className="space-y-2.5 text-sm text-background/65">
            {PAGE_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors duration-200 hover:text-background"
                >
                  {tNav(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {tFooter("legalTitle")}
          </h3>
          <ul className="space-y-2.5 text-sm text-background/65">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors duration-200 hover:text-background"
                >
                  {tFooter(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Kriz bilgisi kalıcı olarak burada da yer alır — toast kaybolsa da erişilebilir. */}
      <div className="border-t border-background/12">
        <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-4 text-xs leading-relaxed text-background/70 sm:px-6 lg:px-8">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            <span className="font-semibold text-background">
              {tCrisis("title")}
            </span>{" "}
            {tCrisis("body")}
          </p>
        </div>
      </div>

      <div className="border-t border-background/12">
        <div className="mx-auto max-w-6xl space-y-1.5 px-4 py-5 text-xs leading-relaxed text-background/55 sm:px-6 lg:px-8">
          <p>{tFooter("disclaimer")}</p>
          <p>
            © {new Date().getFullYear()} PDR Danışmanlık. {tFooter("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
