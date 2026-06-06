import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getActivePricing } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";
import { formatCurrency } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { requestAppointment } from "@/server/appointments";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuth();
  const t = await getTranslations("Booking");

  const [pricing, slots] = await Promise.all([
    getActivePricing(),
    prisma.availabilitySlot.findMany({
      where: { isBooked: false, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 60,
    }),
  ]);

  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const action = requestAppointment.bind(null, locale);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-12">
        {slots.length === 0 ? (
          <p className="text-muted-foreground">{t("noSlots")}</p>
        ) : (
          <form action={action} className="mx-auto max-w-2xl space-y-8">
            {/* Paket seçimi */}
            <fieldset className="space-y-3">
              <legend className="mb-2 font-semibold">{t("selectPackage")}</legend>
              {pricing.map((p, i) => {
                const amount = Number(p.amount);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary"
                  >
                    <input
                      type="radio"
                      name="pricingId"
                      value={p.id}
                      defaultChecked={i === 0}
                      required
                    />
                    <span className="flex-1">
                      <span className="block font-medium">
                        {pickField(p, locale, "name")}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {p.durationMinutes} dk
                      </span>
                    </span>
                    <span className="font-semibold text-primary">
                      {amount === 0
                        ? t("free")
                        : formatCurrency(amount, p.currency, locale)}
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {/* Slot seçimi */}
            <fieldset className="space-y-3">
              <legend className="mb-2 font-semibold">{t("selectSlot")}</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot, i) => (
                  <label
                    key={slot.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="slotId"
                      value={slot.id}
                      defaultChecked={i === 0}
                      required
                    />
                    <span>{fmt.format(slot.startsAt)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor="note" className="font-medium">
                {t("note")}
              </label>
              <Textarea id="note" name="note" rows={3} placeholder={t("notePlaceholder")} />
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="consent" required className="mt-1" />
              <span>{t("consent")}</span>
            </label>

            <p className="text-sm text-muted-foreground">{t("paymentNote")}</p>
            <SubmitButton size="lg">{t("submit")}</SubmitButton>
          </form>
        )}
      </Container>
    </>
  );
}
