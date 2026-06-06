import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { getPublishedPosts } from "@/lib/site-data";
import { pickField } from "@/lib/locale-field";
import { ArrowRight } from "lucide-react";

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
      <Container className="py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const title = pickField(post, locale, "title");
              const excerpt = pickField(post, locale, "excerpt");
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary"
                >
                  <h2 className="font-semibold group-hover:text-primary">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t("readMore")} <ArrowRight className="size-4" />
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
