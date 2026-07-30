import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { getCounselorProfile } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/hero-illustration";
import { CounselorCard } from "@/components/counselor-card";
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

  const base = getSiteUrl();
  const profile = await getCounselorProfile();
  const counselorName = profile?.user?.name ?? "Ennur Pupus";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "PDR Danışmanlık",
    description: t("heroSubtitle"),
    url: `${base}/${locale}`,
    areaServed: "TR",
    availableLanguage: ["tr", "en"],
    ...(profile && {
      provider: {
        "@type": "Person",
        name: counselorName,
        jobTitle: pickField(profile, locale, "title"),
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — sıcak krem zemin + soyut illüstrasyon */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 via-background to-background">
        {/* Arka planda yumuşak organik ışıklar */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-accent/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-[24rem] rounded-full bg-primary/10 blur-3xl"
        />

        <Container className="relative py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-rise text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-semibold tracking-wide text-heading shadow-pill ring-1 ring-border-soft">
                <Sparkles className="size-3.5 text-accent-strong" />
                {t("heroBadge")}
              </span>

              <h1 className="mt-6 text-4xl font-semibold sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]">
                {t("heroTitle")}
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                {t("heroSubtitle")}
              </p>

              {/* Tek baskın CTA; ön değerlendirme altında ince bir bağlantı olarak durur. */}
              <div className="mt-8 flex flex-col items-center gap-4 lg:items-start">
                <Link href="/booking">
                  <Button size="lg">
                    {t("heroCtaPrimary")}
                    <ArrowRight />
                  </Button>
                </Link>
                <Link
                  href="/assessment"
                  className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
                >
                  {t("heroCtaSecondary")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <p className="mx-auto mt-6 max-w-xl text-xs leading-relaxed text-muted-foreground lg:mx-0">
                {t("disclaimer")}
              </p>
            </div>

            <div className="animate-rise mx-auto w-full max-w-md lg:max-w-none [animation-delay:120ms]">
              <HeroIllustration />
            </div>
          </div>
        </Container>
      </section>

      {/* Güven — hero'nun hemen altında */}
      <section className="bg-background-alt py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">
            {t("trustTitle")}
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {trust.map((item) => (
              <div
                key={item.title}
                className="reveal card-lift rounded-2xl border border-border-soft bg-card p-7 shadow-card"
              >
                <div className="icon-gradient flex size-12 items-center justify-center rounded-xl text-primary">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-heading">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {profile && (
            <div className="mt-10">
              <CounselorCard
                name={counselorName}
                title={pickField(profile, locale, "title")}
                bio={pickField(profile, locale, "bio")}
                photoUrl={profile.photoUrl}
                label={t("counselorLabel")}
                badge={t("counselorBadge")}
                cta={t("counselorCta")}
              />
            </div>
          )}
        </Container>
      </section>

      {/* Nasıl çalışır — açık yeşil zemin ile ritim */}
      <section className="bg-secondary/50 py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">
            {t("howTitle")}
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li
                key={i}
                className="reveal card-lift relative rounded-2xl border border-border-soft bg-card p-6 shadow-card"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Kapanış CTA */}
      <section className="bg-background py-16 sm:py-20">
        <Container>
          <div className="reveal relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-cta sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/25 blur-2xl"
            />
            <div className="relative">
              <h2 className="text-inherit text-3xl font-semibold sm:text-4xl">
                {t("ctaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-primary-foreground/90">
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
          </div>
        </Container>
      </section>
    </>
  );
}
