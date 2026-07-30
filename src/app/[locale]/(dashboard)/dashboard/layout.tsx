import { requireAuth } from "@/lib/rbac";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Yetki kontrolü layout'ta yapılır: akış başlamadan önce çalıştığı için
  // oturumsuz ziyaretçi boş iskelet görmeden gerçek HTTP yönlendirmesi alır.
  const user = await requireAuth();
  return (
    <>
      <SiteNavbar user={{ name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
