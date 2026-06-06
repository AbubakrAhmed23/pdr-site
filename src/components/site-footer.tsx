"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeartHandshake } from "lucide-react";

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

  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <HeartHandshake className="size-6" />
            PDR Danışmanlık
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            {tFooter("tagline")}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{tFooter("navTitle")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {PAGE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {tNav(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{tFooter("legalTitle")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {tFooter(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>{tFooter("disclaimer")}</p>
          <p>
            © {new Date().getFullYear()} PDR Danışmanlık. {tFooter("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
