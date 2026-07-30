import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getCounselorProfile, getSiteContent } from "@/lib/site-data";
import { pickField, pickArray } from "@/lib/locale-field";
import { Check } from "lucide-react";

// DB içeriğine bağlı: istek anında render (admin düzenlemeleri anında yansır).
export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const profile = await getCounselorProfile();
  const aboutContent = await getSiteContent("about.body");

  const title = profile ? pickField(profile, locale, "title") : "";
  const bio = profile ? pickField(profile, locale, "bio") : "";
  const body = aboutContent ? pickField(aboutContent, locale, "value") : "";
  const specialties = profile ? pickArray(profile, locale, "specialties") : [];

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-5 lg:col-span-2">
            {title && (
              /* Alıntı kutusu — terracotta vurgu */
              <p className="rounded-xl border-l-4 border-accent bg-accent-soft/60 px-5 py-4 font-display text-lg font-medium text-accent-foreground">
                {title}
              </p>
            )}
            {body && (
              <p className="leading-relaxed text-muted-foreground">{body}</p>
            )}
            {bio && <p className="leading-relaxed text-muted-foreground">{bio}</p>}
          </div>

          <aside className="space-y-4">
            {specialties.length > 0 && (
              <div className="reveal rounded-2xl border border-border-soft bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold">{t("specialtiesTitle")}</h2>
                <ul className="mt-4 space-y-2.5">
                  {specialties.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <div className="reveal mt-16 rounded-2xl border border-border-soft bg-secondary/50 p-10 text-center shadow-card">
          <h2 className="text-2xl font-semibold">{t("ctaTitle")}</h2>
          <div className="mt-6">
            <Link href="/booking">
              <Button size="lg">{t("cta")}</Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
