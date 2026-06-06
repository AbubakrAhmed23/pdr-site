import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Faq");

  const items = [1, 2, 3, 4, 5] as const;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-12 sm:py-16">
        <dl className="mx-auto max-w-3xl space-y-6">
          {items.map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <dt className="font-semibold">{t(`q${i}` as `q${typeof i}`)}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">
                {t(`a${i}` as `a${typeof i}`)}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </>
  );
}
