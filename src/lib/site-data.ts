import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Tek bir ayar değerini getirir. */
export const getSetting = cache(async (key: string) => {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
});

/** Tüm ayarları anahtar/değer haritası olarak getirir. */
export const getSettings = cache(async () => {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
    string,
    string
  >;
});

/** Çift dilli site içeriği (key/value). */
export const getSiteContent = cache(async (key: string) => {
  return prisma.siteContent.findUnique({ where: { key } });
});

/** Site sahibi danışman profili (ilk profil). */
export const getCounselorProfile = cache(async () => {
  return prisma.counselorProfile.findFirst({
    include: { user: { select: { name: true, email: true } } },
  });
});

/** Aktif fiyatlandırma paketleri. */
export const getActivePricing = cache(async () => {
  return prisma.pricing.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
});

/** Yayınlanmış blog yazıları. */
export const getPublishedPosts = cache(async () => {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({ where: { slug } });
});
