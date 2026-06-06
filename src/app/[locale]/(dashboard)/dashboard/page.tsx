import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-data";
import { buildWhatsAppLink } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cancelMyAppointment } from "@/server/appointments";
import { Video, MessageCircle, CalendarPlus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireAuth();
  const t = await getTranslations("Dashboard");
  const tStatus = await getTranslations("AppointmentStatus");
  const tBooking = await getTranslations("Booking");

  const [appointments, assessments, settings] = await Promise.all([
    prisma.appointment.findMany({
      where: { clientId: user.id },
      orderBy: { startsAt: "desc" },
      include: { payment: true },
    }),
    prisma.assessment.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    }),
    getSettings(),
  ]);

  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("welcome", { name: user.name ?? "" })} />
      <Container className="space-y-10 py-12">
        {/* Randevular */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("myAppointments")}</h2>
            <Link href="/booking">
              <Button size="sm">
                <CalendarPlus className="size-4" />
                {t("bookNew")}
              </Button>
            </Link>
          </div>

          {appointments.length === 0 ? (
            <p className="text-muted-foreground">{t("noAppointments")}</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => {
                const isFuture = appt.startsAt > new Date();
                const canCancel =
                  isFuture &&
                  (appt.status === "REQUESTED" || appt.status === "CONFIRMED");
                const needsPayment = appt.payment?.status === "PENDING";
                const packageLabel =
                  appt.type === "INTRO"
                    ? locale === "tr"
                      ? "Tanışma Görüşmesi"
                      : "Intro Call"
                    : locale === "tr"
                      ? "Bireysel Danışmanlık"
                      : "Individual Counseling";
                const waLink =
                  needsPayment && settings.whatsappNumber
                    ? buildWhatsAppLink(
                        settings.whatsappNumber,
                        tBooking("whatsappMessage", {
                          date: fmt.format(appt.startsAt),
                          package: packageLabel,
                        }),
                      )
                    : null;

                return (
                  <Card key={appt.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                      <div>
                        <p className="font-medium">{packageLabel}</p>
                        <p className="text-sm text-muted-foreground">
                          {fmt.format(appt.startsAt)}
                        </p>
                        <p className="mt-1 text-xs">
                          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                            {tStatus(appt.status)}
                          </span>
                          {appt.payment && (
                            <span className="ml-2 text-muted-foreground">
                              {appt.payment.status === "PAID"
                                ? t("paymentPaid")
                                : t("paymentPending")}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {appt.status === "CONFIRMED" && appt.videoRoomUrl && (
                          <a
                            href={appt.videoRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm">
                              <Video className="size-4" />
                              {t("join")}
                            </Button>
                          </a>
                        )}
                        {waLink && (
                          <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="size-4" />
                              {t("pay")}
                            </Button>
                          </a>
                        )}
                        {canCancel && (
                          <form action={cancelMyAppointment.bind(null, appt.id)}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              type="submit"
                            >
                              {t("cancel")}
                            </Button>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Ön değerlendirmeler */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("assessmentsTitle")}</h2>
            <Link href="/assessment">
              <Button size="sm" variant="outline">
                <Sparkles className="size-4" />
                {t("startAssessment")}
              </Button>
            </Link>
          </div>
          {assessments.length === 0 ? (
            <p className="text-muted-foreground">{t("noAssessments")}</p>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div>
                      <p className="font-medium">
                        {fmt.format(a.createdAt)}
                      </p>
                      {a.summary && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {a.summary}
                        </p>
                      )}
                    </div>
                    {a.riskLevel && (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {a.riskLevel}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Hesap */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t("accountTitle")}</h2>
          <Card>
            <CardContent className="pt-6 text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        </section>
      </Container>
    </>
  );
}
