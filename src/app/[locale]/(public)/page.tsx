import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  GraduationCap,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const trust = [
    { icon: ShieldCheck, title: t("trust1Title"), body: t("trust1Body") },
    { icon: GraduationCap, title: t("trust2Title"), body: t("trust2Body") },
    { icon: Clock, title: t("trust3Title"), body: t("trust3Body") },
  ];
  const steps = [t("how1"), t("how2"), t("how3"), t("how4")];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              {t("heroBadge")}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/booking">
                <Button size="lg">
                  {t("heroCtaPrimary")}
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="/assessment">
                <Button size="lg" variant="outline">
                  {t("heroCtaSecondary")}
                </Button>
              </Link>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-xs text-muted-foreground">
              {t("disclaimer")}
            </p>
          </div>
        </Container>
      </section>

      {/* Trust */}
      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            {t("trustTitle")}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {trust.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            {t("howTitle")}
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li
                key={i}
                className="relative rounded-xl border border-border bg-card p-6"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 text-sm text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/90">
              {t("ctaBody")}
            </p>
            <div className="mt-8">
              <Link href="/booking">
                <Button size="lg" variant="secondary">
                  {t("heroCtaPrimary")}
                  <ArrowRight />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
