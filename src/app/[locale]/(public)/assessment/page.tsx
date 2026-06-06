import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { AssessmentFlow } from "@/components/assessment/assessment-flow";
import { GAD7, PHQ9, RESPONSE_OPTIONS } from "@/lib/assessment/scales";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Assessment");
  const lang = locale === "en" ? "en" : "tr";

  const gad7 = GAD7.map((i) => i[lang]);
  const phq9 = PHQ9.map((i) => i[lang]);
  const options = RESPONSE_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label[lang],
  }));

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-12">
        <AssessmentFlow
          locale={lang}
          gad7={gad7}
          phq9={phq9}
          options={options}
        />
      </Container>
    </>
  );
}
