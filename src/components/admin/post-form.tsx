import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { savePost } from "@/app/[locale]/(admin)/admin/actions";

type Post = Awaited<ReturnType<typeof prisma.blogPost.findUnique>>;

export function PostForm({ post }: { post?: NonNullable<Post> }) {
  return (
    <form action={savePost} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Başlık & Özet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Başlık (TR)</Label>
              <Input name="titleTr" required defaultValue={post?.titleTr ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Başlık (EN)</Label>
              <Input name="titleEn" required defaultValue={post?.titleEn ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Slug (URL)</Label>
            <Input name="slug" placeholder="otomatik oluşturulur" defaultValue={post?.slug ?? ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Özet (TR)</Label>
              <Textarea name="excerptTr" rows={2} defaultValue={post?.excerptTr ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Özet (EN)</Label>
              <Textarea name="excerptEn" rows={2} defaultValue={post?.excerptEn ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">İçerik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>İçerik (TR)</Label>
            <Textarea name="contentTr" rows={10} required defaultValue={post?.contentTr ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>İçerik (EN)</Label>
            <Textarea name="contentEn" rows={10} required defaultValue={post?.contentEn ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>SEO Başlık (TR)</Label>
              <Input name="seoTitleTr" defaultValue={post?.seoTitleTr ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label>SEO Başlık (EN)</Label>
              <Input name="seoTitleEn" defaultValue={post?.seoTitleEn ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>SEO Açıklama (TR)</Label>
              <Textarea name="seoDescTr" rows={2} defaultValue={post?.seoDescTr ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label>SEO Açıklama (EN)</Label>
              <Textarea name="seoDescEn" rows={2} defaultValue={post?.seoDescEn ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <div className="space-y-1.5">
          <Label>Durum</Label>
          <select
            name="status"
            defaultValue={post?.status ?? "DRAFT"}
            className="flex h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="DRAFT">Taslak</option>
            <option value="PUBLISHED">Yayında</option>
          </select>
        </div>
        <SubmitButton className="mt-6">Kaydet</SubmitButton>
      </div>
    </form>
  );
}
