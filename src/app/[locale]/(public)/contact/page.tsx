import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { getSettings, getSiteContent } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";
import { buildWhatsAppLink } from "@/lib/utils";
import { MessageCircle, Mail } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const settings = await getSettings();
  const content = await getSiteContent("contact.body");
  const body = content ? pickField(content, locale, "value") : "";

  const whatsappLink = settings.whatsappNumber
    ? buildWhatsAppLink(settings.whatsappNumber, t("whatsappMessage"))
    : null;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl space-y-6">
          {body && <p className="text-muted-foreground">{body}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageCircle className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">{t("whatsapp")}</span>
                  <span className="block text-sm text-muted-foreground">
                    +{settings.whatsappNumber}
                  </span>
                </span>
              </a>
            )}

            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">{t("email")}</span>
                  <span className="block text-sm text-muted-foreground">
                    {settings.contactEmail}
                  </span>
                </span>
              </a>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
