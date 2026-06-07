"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";

export function CrisisBanner() {
  const t = useTranslations("Crisis");
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="border-t border-destructive/20 bg-destructive/5 text-destructive-foreground">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2 text-sm text-destructive sm:px-6 lg:px-8">
        <AlertTriangle className="mt-0.5 shrink-0" />
        <p className="flex-1">
          <span className="font-semibold">{t("title")}</span>{" "}
          <span>{t("body")}</span>
        </p>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="shrink-0 rounded p-0.5 hover:bg-destructive/10"
        >
          <X />
        </button>
      </div>
    </div>
  );
}
