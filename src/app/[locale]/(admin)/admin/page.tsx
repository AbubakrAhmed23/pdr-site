import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { CalendarClock, Wallet, Newspaper, ClipboardList } from "lucide-react";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [upcoming, pendingPayments, publishedPosts, assessments] =
    await Promise.all([
      prisma.appointment.count({
        where: { status: { in: ["REQUESTED", "CONFIRMED"] } },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.assessment.count(),
    ]);

  const stats = [
    { label: "Aktif randevu", value: upcoming, icon: CalendarClock, href: "/admin/appointments" },
    { label: "Bekleyen ödeme", value: pendingPayments, icon: Wallet, href: "/admin/appointments" },
    { label: "Yayınlı yazı", value: publishedPosts, icon: Newspaper, href: "/admin/blog" },
    { label: "Ön değerlendirme", value: assessments, icon: ClipboardList, href: "/admin/assessments" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Genel Bakış"
        description="Platformunuzun özeti."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={`/${locale}${s.href}`}>
            <Card className="p-5 transition-colors hover:border-primary">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
