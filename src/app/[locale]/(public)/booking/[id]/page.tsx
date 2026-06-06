import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-data";
import { buildWhatsAppLink } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await requireAuth();
  const t = await getTranslations("Booking");
  const tStatus = await getTranslations("AppointmentStatus");

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!appointment || appointment.clientId !== user.id) notFound();

  const settings = await getSettings();
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const dateStr = fmt.format(appointment.startsAt);
  const packageLabel =
    appointment.type === "INTRO"
      ? locale === "tr"
        ? "Tanışma Görüşmesi"
        : "Intro Call"
      : locale === "tr"
        ? "Bireysel Danışmanlık"
        : "Individual Counseling";

  const needsPayment =
    appointment.payment && appointment.payment.status === "PENDING";

  const whatsappLink =
    needsPayment && settings.whatsappNumber
      ? buildWhatsAppLink(
          settings.whatsappNumber,
          t("whatsappMessage", { date: dateStr, package: packageLabel }),
        )
      : null;

  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 pt-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <h1 className="text-2xl font-bold">{t("successTitle")}</h1>
          <p className="text-muted-foreground">{t("successBody")}</p>

          <div className="rounded-lg bg-secondary/40 p-4 text-left text-sm">
            <p>
              <span className="text-muted-foreground">{packageLabel}</span>
            </p>
            <p className="font-medium">{dateStr}</p>
            <p className="mt-2">
              {t("statusLabel")}:{" "}
              <span className="font-medium text-primary">
                {tStatus(appointment.status)}
              </span>
            </p>
          </div>

          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full">
                <MessageCircle className="size-5" />
                {t("whatsappCta")}
              </Button>
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("freeConfirmedNote")}
            </p>
          )}

          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              {t("viewDashboard")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
