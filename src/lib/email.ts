import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "PDR Danışmanlık <noreply@example.com>";
const resend = apiKey ? new Resend(apiKey) : null;

type Mail = { to: string; subject: string; html: string };

/** E-posta gönderir. RESEND_API_KEY yoksa sessizce loglar (dev/erken aşama). */
async function send({ to, subject, html }: Mail) {
  if (!resend) {
    console.info(`[email:noop] -> ${to} | ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    console.error("[email] gönderim hatası:", err);
  }
}

function layout(body: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
    ${body}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
    <p style="font-size:12px;color:#6b7280">Bu hizmet psikolojik danışmanlık ve rehberlik kapsamındadır.
    Acil durumlarda lütfen 112'yi arayın.</p>
  </div>`;
}

export async function notifyAppointmentRequested(opts: {
  clientEmail: string;
  counselorEmail?: string | null;
  dateLabel: string;
  packageLabel: string;
  needsPayment: boolean;
}) {
  await send({
    to: opts.clientEmail,
    subject: "Randevu talebiniz alındı",
    html: layout(
      `<h2>Randevu talebiniz alındı</h2>
       <p><strong>${opts.packageLabel}</strong><br/>${opts.dateLabel}</p>
       ${
         opts.needsPayment
           ? "<p>Ücretli seansınız için ödeme WhatsApp üzerinden koordine edilecektir.</p>"
           : "<p>Tanışma görüşmeniz onay için danışmana iletildi.</p>"
       }`,
    ),
  });

  if (opts.counselorEmail) {
    await send({
      to: opts.counselorEmail,
      subject: "Yeni randevu talebi",
      html: layout(
        `<h2>Yeni randevu talebi</h2>
         <p><strong>${opts.packageLabel}</strong><br/>${opts.dateLabel}</p>
         <p>Yönetim panelinden onaylayabilirsiniz.</p>`,
      ),
    });
  }
}

export async function notifyAppointmentConfirmed(opts: {
  clientEmail: string;
  dateLabel: string;
  packageLabel: string;
  videoUrl?: string | null;
}) {
  await send({
    to: opts.clientEmail,
    subject: "Randevunuz onaylandı",
    html: layout(
      `<h2>Randevunuz onaylandı</h2>
       <p><strong>${opts.packageLabel}</strong><br/>${opts.dateLabel}</p>
       ${
         opts.videoUrl
           ? `<p><a href="${opts.videoUrl}" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Görüşmeye katıl</a></p>`
           : "<p>Görüşme bağlantısı görüşme saatinden önce paylaşılacaktır.</p>"
       }`,
    ),
  });
}
