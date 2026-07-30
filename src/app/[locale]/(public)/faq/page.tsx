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
      <Container className="py-16 sm:py-20">
        <dl className="mx-auto max-w-3xl space-y-4">
          {items.map((i) => (
            <div
              key={i}
              className="reveal card-lift rounded-2xl border border-border-soft bg-card p-6 shadow-card sm:p-7"
            >
              <dt className="flex items-start gap-3.5 font-semibold text-heading">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-xs font-semibold text-accent-foreground">
                  {i}
                </span>
                {t(`q${i}` as `q${typeof i}`)}
              </dt>
              <dd className="mt-3 pl-[2.6rem] text-sm leading-relaxed text-muted-foreground">
                {t(`a${i}` as `a${typeof i}`)}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </>
  );
}
