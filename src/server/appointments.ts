"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth, requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

function str(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

// ── Müsaitlik (admin) ─────────────────────────────────────────────
export async function addAvailabilitySlot(formData: FormData) {
  await requireRole("ADMIN", "COUNSELOR");
  const startRaw = str(formData.get("startsAt"));
  const duration = Number(str(formData.get("durationMinutes")) || "50");
  if (!startRaw) return;

  const startsAt = new Date(startRaw);
  const endsAt = new Date(startsAt.getTime() + duration * 60_000);
  await prisma.availabilitySlot.create({ data: { startsAt, endsAt } });
  revalidatePath("/[locale]/(admin)/admin/appointments", "page");
}

export async function deleteAvailabilitySlot(id: string) {
  await requireRole("ADMIN", "COUNSELOR");
  await prisma.availabilitySlot.delete({ where: { id } });
  revalidatePath("/[locale]/(admin)/admin/appointments", "page");
}

// ── Randevu talebi (danışan) ──────────────────────────────────────
export async function requestAppointment(locale: string, formData: FormData) {
  const user = await requireAuth();
  const slotId = str(formData.get("slotId"));
  const pricingId = str(formData.get("pricingId"));
  const note = str(formData.get("note"));
  if (!slotId || !pricingId) redirect(`/${locale}/booking`);

  const [slot, pricing] = await Promise.all([
    prisma.availabilitySlot.findUnique({ where: { id: slotId } }),
    prisma.pricing.findUnique({ where: { id: pricingId } }),
  ]);
  if (!slot || slot.isBooked || !pricing) redirect(`/${locale}/booking`);

  const endsAt = new Date(
    slot.startsAt.getTime() + pricing.durationMinutes * 60_000,
  );
  const amount = Number(pricing.amount);

  const appointment = await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        clientId: user.id,
        slotId: slot.id,
        startsAt: slot.startsAt,
        endsAt,
        type: pricing.sessionType,
        status: "REQUESTED",
        clientNote: note || null,
        ...(amount > 0
          ? {
              payment: {
                create: {
                  amount: pricing.amount,
                  currency: pricing.currency,
                  status: "PENDING",
                },
              },
            }
          : {}),
      },
    });
    await tx.availabilitySlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });
    return appt;
  });

  redirect(`/${locale}/booking/${appointment.id}`);
}

// ── Randevu yönetimi (admin) ──────────────────────────────────────
export async function confirmPaymentAndAppointment(
  appointmentId: string,
  formData: FormData,
) {
  const staff = await requireRole("ADMIN", "COUNSELOR");
  const whatsappRef = str(formData.get("whatsappRef"));

  await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { appointmentId },
      data: {
        status: "PAID",
        whatsappRef: whatsappRef || null,
        confirmedAt: new Date(),
        confirmedById: staff.id,
      },
    });
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED" },
    });
  });
  revalidatePath("/[locale]/(admin)/admin/appointments", "page");
}

export async function confirmAppointment(appointmentId: string) {
  await requireRole("ADMIN", "COUNSELOR");
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/[locale]/(admin)/admin/appointments", "page");
}

export async function setVideoLink(appointmentId: string, formData: FormData) {
  await requireRole("ADMIN", "COUNSELOR");
  const url = str(formData.get("videoRoomUrl"));
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { videoRoomUrl: url || null },
  });
  revalidatePath("/[locale]/(admin)/admin/appointments", "page");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "COMPLETED" | "CANCELLED" | "NO_SHOW",
) {
  await requireRole("ADMIN", "COUNSELOR");
  const appt = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
  // İptalde slotu tekrar açığa çıkar
  if (status === "CANCELLED" && appt.slotId) {
    await prisma.availabilitySlot.update({
      where: { id: appt.slotId },
      data: { isBooked: false },
    });
  }
  revalidatePath("/[locale]/(admin)/admin/appointments", "page");
}

// ── Danışan iptali ────────────────────────────────────────────────
export async function cancelMyAppointment(appointmentId: string) {
  const user = await requireAuth();
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!appt || appt.clientId !== user.id) return;
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });
  if (appt.slotId) {
    await prisma.availabilitySlot.update({
      where: { id: appt.slotId },
      data: { isBooked: false },
    });
  }
  revalidatePath("/[locale]/(dashboard)/dashboard", "page");
}
