import { CrisisBanner } from "@/components/crisis-banner";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CrisisBanner />
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
