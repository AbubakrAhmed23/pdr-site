import { getCurrentUser } from "@/lib/rbac";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <>
      <SiteNavbar user={user ? { name: user.name, role: user.role } : null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
