"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Sparkles, ShieldCheck } from "lucide-react";

type Option = { value: number; label: string };
type Props = {
  locale: string;
  gad7: string[];
  phq9: string[];
  options: Option[];
};

type Step = "consent" | "form" | "result";

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-primary/10 text-primary",
  MODERATE: "bg-accent text-accent-foreground",
  HIGH: "bg-destructive/15 text-destructive",
  CRISIS: "bg-destructive text-destructive-foreground",
};

export function AssessmentFlow({ locale, gad7, phq9, options }: Props) {
  const t = useTranslations("Assessment");
  const [step, setStep] = useState<Step>("consent");
  const [consent, setConsent] = useState(false);
  const [gad7Answers, setGad7] = useState<(number | null)[]>(
    Array(gad7.length).fill(null),
  );
  const [phq9Answers, setPhq9] = useState<(number | null)[]>(
    Array(phq9.length).fill(null),
  );
  const [concern, setConcern] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [risk, setRisk] = useState<string>("LOW");
  const [crisis, setCrisis] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const routingKeyFor = (r: string) =>
    r === "CRISIS"
      ? "routingCrisis"
      : r === "HIGH"
        ? "routingHigh"
        : r === "MODERATE"
          ? "routingModerate"
          : "routingLow";

  async function submit() {
    if (
      gad7Answers.some((a) => a === null) ||
      phq9Answers.some((a) => a === null)
    ) {
      setError(t("answerAll"));
      return;
    }
    setError(null);
    setLoading(true);
    setSummary("");
    setStep("result");

    try {
      const res = await fetch("/api/assessment/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, gad7: gad7Answers, phq9: phq9Answers, concern }),
      });
      setRisk(res.headers.get("X-Risk-Level") ?? "LOW");
      setCrisis(res.headers.get("X-Crisis") === "1");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setSummary((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch {
      setSummary(
        locale === "tr"
          ? "Bir hata oluştu. Lütfen tekrar deneyin."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Consent ───────────────────────────────────────────────
  if (step === "consent") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-5 pt-6">
          <p className="text-muted-foreground">{t("intro")}</p>
          <div className="rounded-xl border-l-4 border-accent bg-accent-soft/50 p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-5 text-primary" />
              {t("consentTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("consentDisclaimer")}
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span>{t("consentCheckbox")}</span>
          </label>
          <Button disabled={!consent} onClick={() => setStep("form")}>
            {t("start")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Form ──────────────────────────────────────────────────
  if (step === "form") {
    const renderScale = (
      titleKey: "gad7Title" | "phq9Title",
      items: string[],
      answers: (number | null)[],
      setAnswers: (v: (number | null)[]) => void,
    ) => (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">{t(titleKey)}</h2>
        {items.map((q, i) => (
          <div key={i} className="rounded-xl border border-border-soft bg-card p-4 shadow-card">
            <p className="mb-3 text-sm font-medium">
              {i + 1}. {q}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const next = [...answers];
                    next[i] = opt.value;
                    setAnswers(next);
                  }}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                    answers[i] === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <p className="rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground">
          {t("instructions")}
        </p>
        {renderScale("gad7Title", gad7, gad7Answers, setGad7)}
        {renderScale("phq9Title", phq9, phq9Answers, setPhq9)}

        <div className="space-y-2">
          <label className="font-medium">{t("concernLabel")}</label>
          <Textarea
            rows={4}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder={t("concernPlaceholder")}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button size="lg" onClick={submit} disabled={loading}>
          {loading ? t("submitting") : t("submit")}
        </Button>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────
  return (
    <div ref={resultRef} className="mx-auto max-w-2xl space-y-5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl p-5",
          RISK_STYLES[risk] ?? RISK_STYLES.LOW,
        )}
      >
        {crisis ? (
          <AlertTriangle className="size-6 shrink-0" />
        ) : (
          <Sparkles className="size-6 shrink-0" />
        )}
        <div>
          <p className="text-sm opacity-90">
            {crisis ? t("crisisTitle") : t("yourRisk")}
          </p>
          {!crisis && (
            <p className="text-lg font-bold">
              {t(`risk${risk}` as "riskLOW")}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="whitespace-pre-line leading-relaxed">
            {summary || (loading ? t("generating") : "")}
          </p>
        </CardContent>
      </Card>

      <p className="rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground">
        {t(routingKeyFor(risk))}
      </p>

      <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>

      {!crisis && (
        <Link href="/booking">
          <Button size="lg" className="w-full">
            {t("bookCta")}
          </Button>
        </Link>
      )}
    </div>
  );
}
