import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPublishedPosts } from "@/lib/site-data";
import { getSiteUrl } from "@/lib/site-url";

// Blog yazılarına bağlı olduğu için istek anında üretilir (build-time DB bağımlılığı yok).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = ["", "/about", "/services", "/faq", "/contact", "/blog"];
  const posts = await getPublishedPosts();

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const post of posts) {
      entries.push({
        url: `${base}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
