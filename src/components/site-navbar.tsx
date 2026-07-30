"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Menu,
  X,
  HeartHandshake,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { signOutAction } from "@/server/auth-actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/assessment", key: "assessment" },
  { href: "/blog", key: "blog" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

type NavUser = { name?: string | null; role: string } | null;

function initials(name?: string | null) {
  if (!name) return "•";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Giriş yapmış kullanıcı için hesap menüsü (Panelim / Yönetim / Çıkış). */
function AccountMenu({ user, isStaff }: { user: NavUser; isStaff: boolean }) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border-soft bg-card py-1 pl-1 pr-2.5 text-sm font-medium text-foreground shadow-pill transition-all duration-200 hover:shadow-card"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
          {initials(user?.name)}
        </span>
        <span className="hidden max-w-24 truncate xl:inline">
          {user?.name ?? t("dashboard")}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-soft bg-card p-1.5 shadow-card-hover"
        >
          {user?.name && (
            <p className="truncate px-3 py-2 text-xs text-muted-foreground">
              {user.name}
            </p>
          )}
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <LayoutDashboard className="size-4 text-primary" />
            {t("dashboard")}
          </Link>
          {isStaff && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <ShieldCheck className="size-4 text-primary" />
              {t("admin")}
            </Link>
          )}
          <form action={signOutAction} className="border-t border-border-soft pt-1.5 mt-1.5">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/8"
            >
              <LogOut className="size-4" />
              {t("logout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function SiteNavbar({ user }: { user: NavUser }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isStaff = user?.role === "ADMIN" || user?.role === "COUNSELOR";

  // Rota değişince mobil menüyü kapat (render sırasında state ayarlama deseni).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-primary transition-opacity hover:opacity-80"
        >
          <HeartHandshake className="size-6" />
          <span className="hidden sm:inline">PDR Danışmanlık</span>
        </Link>

        {/* İçerik linkleri — sol/orta grup */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {t(item.key)}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Hesap & dil grubu — ince dikey ayraç ile ayrılır */}
        <div className="hidden items-center gap-3 lg:flex">
          <span aria-hidden className="h-6 w-px bg-border" />
          <LocaleSwitcher />
          {user ? (
            <AccountMenu user={user} isStaff={isStaff} />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="sm">{t("booking")}</Button>
              </Link>
            </div>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-heading transition-colors hover:bg-secondary lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border-soft bg-card shadow-card lg:hidden">
          <div className="px-4 py-3">
            {/* Öncelikli eylem her zaman üstte */}
            {!user && (
              <Link href="/booking" onClick={() => setOpen(false)} className="block">
                <Button className="mb-3 w-full">{t("booking")}</Button>
              </Link>
            )}

            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary/70 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>

            {/* Hesap & dil — ayraçla ayrılmış ikinci grup */}
            <div className="mt-3 space-y-2 border-t border-border-soft pt-3">
              {user ? (
                <>
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      <LayoutDashboard className="size-4 text-primary" />
                      {t("dashboard")}
                    </Link>
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                      >
                        <ShieldCheck className="size-4 text-primary" />
                        {t("admin")}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <LocaleSwitcher />
                    <form action={signOutAction}>
                      <Button variant="outline" size="sm" type="submit">
                        <LogOut className="size-4" />
                        {t("logout")}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <LocaleSwitcher />
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm">
                      {t("login")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
