import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getCounselorProfile, getSiteContent } from "@/lib/site-data";
import { pickField, pickArray } from "@/lib/locale-field";
import { Check } from "lucide-react";

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
      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {title && <p className="text-lg font-medium text-primary">{title}</p>}
            {body && <p className="text-muted-foreground leading-relaxed">{body}</p>}
            {bio && <p className="text-muted-foreground leading-relaxed">{bio}</p>}
          </div>

          <aside className="space-y-4">
            {specialties.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold">{t("specialtiesTitle")}</h2>
                <ul className="mt-4 space-y-2">
                  {specialties.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-16 rounded-2xl bg-secondary/50 p-8 text-center">
          <h2 className="text-xl font-semibold">{t("ctaTitle")}</h2>
          <div className="mt-4">
            <Link href="/booking">
              <Button>{t("cta")}</Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
