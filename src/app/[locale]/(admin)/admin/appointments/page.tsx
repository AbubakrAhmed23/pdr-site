import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import {
  addAvailabilitySlot,
  deleteAvailabilitySlot,
  confirmPaymentAndAppointment,
  confirmAppointment,
  setVideoLink,
  updateAppointmentStatus,
} from "@/server/appointments";
import { Trash2, Video } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Talep edildi",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  NO_SHOW: "Gelinmedi",
};

export default async function AdminAppointmentsPage() {
  const now = new Date();
  const [openSlots, appointments] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: { isBooked: false, startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.findMany({
      orderBy: { startsAt: "desc" },
      take: 50,
      include: { client: { select: { name: true, email: true } }, payment: true },
    }),
  ]);

  const fmt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <AdminPageHeader
        title="Randevular"
        description="Müsaitlik saatlerinizi tanımlayın ve gelen randevuları yönetin."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Müsaitlik ekleme */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Müsaitlik ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addAvailabilitySlot} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="startsAt">Tarih & saat</Label>
                <Input id="startsAt" name="startsAt" type="datetime-local" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes">Süre (dk)</Label>
                <Input id="durationMinutes" name="durationMinutes" type="number" defaultValue={50} />
              </div>
              <SubmitButton className="w-full">Ekle</SubmitButton>
            </form>

            <div className="mt-5 space-y-2">
              <p className="text-sm font-medium">Açık saatler</p>
              {openSlots.length === 0 && (
                <p className="text-xs text-muted-foreground">Açık saat yok.</p>
              )}
              {openSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  <span>{fmt.format(slot.startsAt)}</span>
                  <form action={deleteAvailabilitySlot.bind(null, slot.id)}>
                    <button className="text-destructive" aria-label="Sil">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Randevu listesi */}
        <div className="space-y-4 lg:col-span-2">
          {appointments.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz randevu yok.</p>
          )}
          {appointments.map((appt) => {
            const isPaid = appt.payment?.status === "PAID";
            const needsPayment = appt.payment?.status === "PENDING";
            const isFree = !appt.payment;
            return (
              <Card key={appt.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {appt.client.name ?? appt.client.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fmt.format(appt.startsAt)} ·{" "}
                        {appt.type === "INTRO" ? "Tanışma" : "Bireysel"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium">
                        {STATUS_LABEL[appt.status]}
                      </span>
                      {appt.payment && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ödeme: {isPaid ? "Ödendi" : "Bekliyor"} ·{" "}
                          {Number(appt.payment.amount)} {appt.payment.currency}
                        </p>
                      )}
                    </div>
                  </div>

                  {appt.clientNote && (
                    <p className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
                      {appt.clientNote}
                    </p>
                  )}

                  {/* İşlemler */}
                  {(appt.status === "REQUESTED" || appt.status === "CONFIRMED") && (
                    <div className="space-y-3 border-t border-border pt-3">
                      {needsPayment && (
                        <form
                          action={confirmPaymentAndAppointment.bind(null, appt.id)}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">WhatsApp ödeme notu</Label>
                            <Input name="whatsappRef" placeholder="ör. dekont no" className="h-9" />
                          </div>
                          <SubmitButton size="sm">Ödendi & Onayla</SubmitButton>
                        </form>
                      )}
                      {isFree && appt.status === "REQUESTED" && (
                        <form action={confirmAppointment.bind(null, appt.id)}>
                          <SubmitButton size="sm">Onayla</SubmitButton>
                        </form>
                      )}

                      <form
                        action={setVideoLink.bind(null, appt.id)}
                        className="flex flex-wrap items-end gap-2"
                      >
                        <div className="flex-1 space-y-1">
                          <Label className="flex items-center gap-1 text-xs">
                            <Video className="size-3" /> Video görüşme linki
                          </Label>
                          <Input
                            name="videoRoomUrl"
                            placeholder="https://..."
                            defaultValue={appt.videoRoomUrl ?? ""}
                            className="h-9"
                          />
                        </div>
                        <SubmitButton size="sm" variant="outline">
                          Kaydet
                        </SubmitButton>
                      </form>

                      <div className="flex flex-wrap gap-2">
                        <form action={updateAppointmentStatus.bind(null, appt.id, "COMPLETED")}>
                          <Button size="sm" variant="ghost">Tamamlandı</Button>
                        </form>
                        <form action={updateAppointmentStatus.bind(null, appt.id, "NO_SHOW")}>
                          <Button size="sm" variant="ghost">Gelinmedi</Button>
                        </form>
                        <form action={updateAppointmentStatus.bind(null, appt.id, "CANCELLED")}>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            İptal et
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
