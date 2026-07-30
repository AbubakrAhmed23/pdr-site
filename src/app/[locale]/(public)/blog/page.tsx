import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { getPublishedPosts } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";
import { ArrowRight } from "lucide-react";

// DB içeriğine bağlı: istek anında render (admin düzenlemeleri anında yansır).
export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Container className="py-16 sm:py-20">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const title = pickField(post, locale, "title");
              const excerpt = pickField(post, locale, "excerpt");
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="reveal card-lift group flex flex-col rounded-2xl border border-border-soft bg-card p-6 shadow-card hover:border-primary/30"
                >
                  <h2 className="text-lg font-semibold transition-colors group-hover:text-primary">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {excerpt}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t("readMore")}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
