import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getActivePricing, getCounselorProfile } from "@/lib/site-data";
import { pickField, pickArray } from "@/lib/locale-field";
import { formatCurrency } from "@/lib/utils";
import { Clock, Check } from "lucide-react";

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

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-12 sm:py-16">
        {specialties.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold">{t("areasTitle")}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <Check className="size-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium">{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold">{t("packagesTitle")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pricing.map((p) => {
              const name = pickField(p, locale, "name");
              const desc = pickField(p, locale, "description");
              const amount = Number(p.amount);
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <h3 className="font-semibold">{name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    {t("duration", { minutes: p.durationMinutes })}
                  </p>
                  {desc && (
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">
                      {desc}
                    </p>
                  )}
                  <p className="mt-4 text-2xl font-bold text-foreground">
                    {amount === 0
                      ? t("free")
                      : formatCurrency(amount, p.currency, locale)}
                  </p>
                  <Link href="/booking" className="mt-4">
                    <Button className="w-full">{t("book")}</Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          {t("disclaimer")}
        </p>
      </Container>
    </>
  );
}
