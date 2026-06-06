"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Tags,
  Newspaper,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/[locale]/(admin)/admin/actions";

const ITEMS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/appointments", label: "Randevular", icon: CalendarCheck },
  { href: "/admin/assessments", label: "Ön Değerlendirmeler", icon: ClipboardList },
  { href: "/admin/content", label: "İçerik & Profil", icon: FileText },
  { href: "/admin/pricing", label: "Fiyatlar", icon: Tags },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export function AdminNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const base = `/${locale}`;

  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const full = `${base}${item.href}`;
        const active = item.exact
          ? pathname === full
          : pathname.startsWith(full);
        return (
          <Link
            key={item.href}
            href={full}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <form action={signOutAction} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Çıkış Yap
        </button>
      </form>
    </nav>
  );
}
