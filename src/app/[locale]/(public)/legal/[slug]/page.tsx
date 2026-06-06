import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { getSiteContent } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";

export const dynamic = "force-dynamic";

const SLUGS = ["privacy", "kvkk", "terms", "contract"] as const;
type Slug = (typeof SLUGS)[number];

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!SLUGS.includes(slug as Slug)) notFound();

  const t = await getTranslations("Footer");
  const content = await getSiteContent(`legal.${slug}`);
  const body = content ? pickField(content, locale, "value") : "";

  return (
    <>
      <PageHeader title={t(slug as Slug)} />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">
          {body || "—"}
        </div>
      </Container>
    </>
  );
}
