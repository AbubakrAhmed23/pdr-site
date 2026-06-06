import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deletePost } from "../actions";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default async function AdminBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Yazıları oluşturun, düzenleyin ve yayınlayın."
        action={
          <Link href={`/${locale}/admin/blog/new`}>
            <Button>
              <Plus className="size-4" /> Yeni yazı
            </Button>
          </Link>
        }
      />

      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz yazı yok.</p>
        )}
        {posts.map((post) => (
          <Card key={post.id} className="flex items-center justify-between p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{post.titleTr}</p>
              <p className="text-xs text-muted-foreground">
                /{post.slug} ·{" "}
                <span
                  className={
                    post.status === "PUBLISHED"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {post.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`/${locale}/admin/blog/${post.id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="size-4" /> Düzenle
                </Button>
              </Link>
              <form action={deletePost.bind(null, post.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
