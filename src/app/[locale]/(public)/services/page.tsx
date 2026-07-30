import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getActivePricing, getCounselorProfile } from "@/lib/site-data";
import { pickField, pickArray } from "@/lib/locale-field";
import { formatCurrency, cn } from "@/lib/utils";
import { Clock, Check, Star } from "lucide-react";

// DB içeriğine bağlı: istek anında render (admin düzenlemeleri anında yansır).
export const dynamic = "force-dynamic";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Services");

  const profile = await getCounselorProfile();
  const pricing = await getActivePricing();
  const specialties = profile ? pickArray(profile, locale, "specialties") : [];

  // Ana paket (en yüksek ücretli) "Önerilen" rozetiyle öne çıkarılır.
  const maxAmount = pricing.reduce((max, p) => Math.max(max, Number(p.amount)), 0);
  const featuredId =
    pricing.length > 1 && maxAmount > 0
      ? pricing.find((p) => Number(p.amount) === maxAmount)?.id
      : undefined;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {specialties.length > 0 && (
        <section className="bg-background-alt py-16 sm:py-20">
          <Container>
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("areasTitle")}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((s) => (
                <div
                  key={s}
                  className="reveal card-lift flex items-center gap-3 rounded-xl border border-border-soft bg-card p-4 shadow-card"
                >
                  <span className="icon-gradient flex size-9 shrink-0 items-center justify-center rounded-lg text-primary">
                    <Check className="size-4" />
                  </span>
                  <span className="text-sm font-medium">{s}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-semibold sm:text-3xl">{t("packagesTitle")}</h2>
          <div className="mt-8 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pricing.map((p) => {
              const name = pickField(p, locale, "name");
              const desc = pickField(p, locale, "description");
              const amount = Number(p.amount);
              const featured = p.id === featuredId;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "reveal card-lift relative flex flex-col rounded-2xl bg-card p-7 shadow-card",
                    featured
                      ? "border-2 border-primary/45 shadow-card-hover"
                      : "border border-border-soft",
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-foreground shadow-pill ring-1 ring-accent/45">
                      <Star className="size-3.5 fill-current" />
                      {t("recommended")}
                    </span>
                  )}

                  <h3 className="text-lg font-semibold text-heading">{name}</h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    {t("duration", { minutes: p.durationMinutes })}
                  </p>
                  {desc && (
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  )}
                  <p className="mt-6 font-display text-3xl font-semibold tracking-tight text-heading">
                    {amount === 0
                      ? t("free")
                      : formatCurrency(amount, p.currency, locale)}
                  </p>
                  <Link href="/booking" className="mt-6">
                    <Button
                      className="w-full"
                      variant={featured ? "default" : "outline"}
                    >
                      {t("book")}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-12 text-center text-xs leading-relaxed text-muted-foreground">
            {t("disclaimer")}
          </p>
        </Container>
      </section>
    </>
  );
}
