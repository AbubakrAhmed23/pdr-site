"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePublic } from "@/lib/revalidate";

function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

// ── Danışman profili ──────────────────────────────────────────────
export async function updateProfile(formData: FormData) {
  await requireRole("ADMIN", "COUNSELOR");
  const existing = await prisma.counselorProfile.findFirst();
  const data = {
    titleTr: str(formData.get("titleTr")),
    titleEn: str(formData.get("titleEn")),
    bioTr: str(formData.get("bioTr")),
    bioEn: str(formData.get("bioEn")),
    specialtiesTr: splitList(formData.get("specialtiesTr")),
    specialtiesEn: splitList(formData.get("specialtiesEn")),
    photoUrl: str(formData.get("photoUrl")) || null,
  };
  if (existing) {
    await prisma.counselorProfile.update({ where: { id: existing.id }, data });
  }
  revalidatePublic(["/", "/about", "/services"]);
  revalidatePath("/[locale]/(admin)/admin/content", "page");
}

// ── Genel ayarlar ─────────────────────────────────────────────────
export async function updateSettings(formData: FormData) {
  await requireRole("ADMIN", "COUNSELOR");
  const entries: Record<string, string> = {
    whatsappNumber: str(formData.get("whatsappNumber")).replace(/[^0-9]/g, ""),
    contactEmail: str(formData.get("contactEmail")),
    introDurationMinutes: str(formData.get("introDurationMinutes")) || "15",
  };
  for (const [key, value] of Object.entries(entries)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePublic(["/", "/contact"]);
}

// ── Site içeriği (key/value, çift dilli) ──────────────────────────
export async function updateSiteContent(key: string, formData: FormData) {
  await requireRole("ADMIN", "COUNSELOR");
  await prisma.siteContent.upsert({
    where: { key },
    update: {
      valueTr: str(formData.get("valueTr")),
      valueEn: str(formData.get("valueEn")),
    },
    create: {
      key,
      valueTr: str(formData.get("valueTr")),
      valueEn: str(formData.get("valueEn")),
    },
  });
  revalidatePublic(["/", "/about", "/contact"]);
}

// ── Fiyatlandırma ─────────────────────────────────────────────────
export async function savePricing(formData: FormData) {
  await requireRole("ADMIN", "COUNSELOR");
  const id = str(formData.get("id"));
  const data = {
    nameTr: str(formData.get("nameTr")),
    nameEn: str(formData.get("nameEn")),
    descriptionTr: str(formData.get("descriptionTr")) || null,
    descriptionEn: str(formData.get("descriptionEn")) || null,
    sessionType:
      str(formData.get("sessionType")) === "INTRO" ? "INTRO" : "INDIVIDUAL",
    amount: Number(str(formData.get("amount")) || "0"),
    currency: str(formData.get("currency")) || "TRY",
    durationMinutes: Number(str(formData.get("durationMinutes")) || "50"),
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(str(formData.get("sortOrder")) || "0"),
  } as const;

  if (id) {
    await prisma.pricing.update({ where: { id }, data });
  } else {
    await prisma.pricing.create({ data });
  }
  revalidatePublic(["/", "/services"]);
  revalidatePath("/[locale]/(admin)/admin/pricing", "page");
}

export async function deletePricing(id: string) {
  await requireRole("ADMIN", "COUNSELOR");
  await prisma.pricing.delete({ where: { id } });
  revalidatePublic(["/", "/services"]);
  revalidatePath("/[locale]/(admin)/admin/pricing", "page");
}

// ── Blog ──────────────────────────────────────────────────────────
function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function savePost(formData: FormData) {
  const user = await requireRole("ADMIN", "COUNSELOR");
  const id = str(formData.get("id"));
  const titleTr = str(formData.get("titleTr"));
  const slug = str(formData.get("slug")) || slugify(titleTr);
  const status = str(formData.get("status")) === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const data = {
    slug,
    titleTr,
    titleEn: str(formData.get("titleEn")),
    excerptTr: str(formData.get("excerptTr")) || null,
    excerptEn: str(formData.get("excerptEn")) || null,
    contentTr: str(formData.get("contentTr")),
    contentEn: str(formData.get("contentEn")),
    seoTitleTr: str(formData.get("seoTitleTr")) || null,
    seoTitleEn: str(formData.get("seoTitleEn")) || null,
    seoDescTr: str(formData.get("seoDescTr")) || null,
    seoDescEn: str(formData.get("seoDescEn")) || null,
    status: status as "PUBLISHED" | "DRAFT",
  };

  if (id) {
    const prev = await prisma.blogPost.findUnique({ where: { id } });
    await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          status === "PUBLISHED" && !prev?.publishedAt
            ? new Date()
            : prev?.publishedAt,
      },
    });
  } else {
    await prisma.blogPost.create({
      data: {
        ...data,
        authorId: user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
  }
  revalidatePublic(["/blog", `/blog/${slug}`]);
  revalidatePath("/[locale]/(admin)/admin/blog", "page");
}

export async function deletePost(id: string) {
  await requireRole("ADMIN", "COUNSELOR");
  const post = await prisma.blogPost.findUnique({ where: { id } });
  await prisma.blogPost.delete({ where: { id } });
  if (post) revalidatePublic(["/blog", `/blog/${post.slug}`]);
  revalidatePath("/[locale]/(admin)/admin/blog", "page");
}
