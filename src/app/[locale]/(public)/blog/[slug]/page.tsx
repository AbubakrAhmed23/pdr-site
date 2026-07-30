import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { getPostBySlug } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = pickField(post, locale, "seoTitle") || pickField(post, locale, "title");
  const description =
    pickField(post, locale, "seoDesc") || pickField(post, locale, "excerpt");
  return { title, description };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const title = pickField(post, locale, "title");
  const content = pickField(post, locale, "content");

  return (
    <Container className="py-16 sm:py-20">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t("backToBlog")}
        </Link>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">
          {title}
        </h1>
        {post.publishedAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            {new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
              dateStyle: "long",
            }).format(post.publishedAt)}
          </p>
        )}
        <div className="mt-8 whitespace-pre-line text-[1.05rem] leading-[1.75] text-foreground">
          {content}
        </div>
      </article>
    </Container>
  );
}
