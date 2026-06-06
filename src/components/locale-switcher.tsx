"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={cn("inline-flex items-center rounded-md border border-border text-xs", className)}>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={cn(
            "px-2.5 py-1 font-medium uppercase transition-colors first:rounded-l-md last:rounded-r-md",
            loc === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary",
          )}
          aria-current={loc === locale}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
