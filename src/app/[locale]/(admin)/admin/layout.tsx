import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("ADMIN", "COUNSELOR");

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background p-4 md:flex">
        <Link
          href={`/${locale}`}
          className="mb-6 flex items-center gap-2 px-3 font-semibold text-primary"
        >
          <HeartHandshake className="size-6" />
          Yönetim
        </Link>
        <AdminNav locale={locale} />
        <div className="mt-auto px-3 pt-4 text-xs text-muted-foreground">
          {user.name ?? user.email}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-background px-6 py-3 md:hidden">
          <AdminNav locale={locale} />
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
