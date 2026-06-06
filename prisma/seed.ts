import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL ?? "admin@pdr.local";
  const ownerPassword = process.env.OWNER_PASSWORD ?? "admin1234";

  // Site sahibi (psikolojik danışman + yönetici)
  const passwordHash = await bcrypt.hash(ownerPassword, 12);
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: "ADMIN", name: "Ennur Pupuş" },
    create: {
      email: ownerEmail,
      name: "Ennur Pupuş",
      role: "ADMIN",
      passwordHash,
      locale: "TR",
    },
  });

  const profileData = {
    titleTr: "Psikolojik Danışman (PDR)",
    titleEn: "Psychological Counselor (Guidance & Counseling)",
    bioTr:
      "Ben Ennur Pupuş. Kosova kökenliyim. Lise eğitimimi Türkiye Diyanet Vakfı (TDV) bursuyla ŞMK Lisesi'nde tamamladıktan sonra Marmara Üniversitesi Psikolojik Danışmanlık ve Rehberlik (PDR) bölümünde lisans ve yüksek lisans eğitimimi tamamladım. Bireylerin kendilerini daha iyi anlamalarına ve günlük yaşam zorluklarıyla başa çıkmalarına çevrimiçi psikolojik danışmanlık ve rehberlik yoluyla eşlik ediyorum.",
    bioEn:
      "I'm Ennur Pupuş. Originally from Kosovo, I completed my high-school education in Türkiye on a Turkish Religious Foundation (TDV) scholarship at ŞMK High School, and went on to earn my bachelor's and master's degrees in Guidance & Psychological Counseling at Marmara University. Through online counseling and guidance I accompany individuals as they better understand themselves and navigate everyday challenges.",
  };

  await prisma.counselorProfile.upsert({
    where: { userId: owner.id },
    update: profileData,
    create: {
      userId: owner.id,
      ...profileData,
      specialtiesTr: [
        "Bireysel danışmanlık",
        "Kaygı ve stres",
        "İlişki ve iletişim",
        "Öğrenci ve kariyer rehberliği",
      ],
      specialtiesEn: [
        "Individual counseling",
        "Anxiety & stress",
        "Relationships & communication",
        "Student & career guidance",
      ],
    },
  });

  // Genel ayarlar (admin panelden güncellenebilir)
  const settings: Record<string, string> = {
    whatsappNumber: process.env.OWNER_WHATSAPP ?? "905555555555",
    contactEmail: ownerEmail,
    introDurationMinutes: "15",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // Fiyatlandırma paketleri
  const pricing = [
    {
      nameTr: "Tanışma Görüşmesi",
      nameEn: "Intro Call",
      descriptionTr: "15 dakikalık ücretsiz ön görüşme.",
      descriptionEn: "A free 15-minute introductory call.",
      sessionType: "INTRO" as const,
      amount: 0,
      durationMinutes: 15,
      sortOrder: 0,
    },
    {
      nameTr: "Bireysel Danışmanlık",
      nameEn: "Individual Counseling",
      descriptionTr: "50 dakikalık çevrimiçi bireysel danışmanlık seansı.",
      descriptionEn: "A 50-minute online individual counseling session.",
      sessionType: "INDIVIDUAL" as const,
      amount: 1000,
      durationMinutes: 50,
      sortOrder: 1,
    },
  ];
  for (const p of pricing) {
    const existing = await prisma.pricing.findFirst({ where: { nameTr: p.nameTr } });
    if (!existing) await prisma.pricing.create({ data: p });
  }

  // Düzenlenebilir sayfa içerikleri
  const content: { key: string; valueTr: string; valueEn: string }[] = [
    {
      key: "about.body",
      valueTr:
        "Çevrimiçi psikolojik danışmanlık ve rehberlik ile güvenli, gizli ve yargısız bir alanda yanınızdayım.",
      valueEn:
        "With online psychological counseling and guidance, I'm here for you in a safe, confidential and non-judgmental space.",
    },
    {
      key: "contact.body",
      valueTr:
        "Sorularınız için bize ulaşabilirsiniz. Randevu ve ödeme koordinasyonu WhatsApp üzerinden yapılmaktadır.",
      valueEn:
        "Reach out with any questions. Appointment and payment coordination is handled via WhatsApp.",
    },
  ];
  for (const c of content) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: { valueTr: c.valueTr, valueEn: c.valueEn },
      create: c,
    });
  }

  // Örnek blog yazısı
  const slug = "cevrimici-danismanlik-nedir";
  const existingPost = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existingPost) {
    await prisma.blogPost.create({
      data: {
        slug,
        titleTr: "Çevrimiçi Psikolojik Danışmanlık Nedir?",
        titleEn: "What Is Online Psychological Counseling?",
        excerptTr: "Çevrimiçi danışmanlığın nasıl işlediğine ve kimler için uygun olduğuna kısa bir bakış.",
        excerptEn: "A short look at how online counseling works and who it's suitable for.",
        contentTr:
          "Çevrimiçi psikolojik danışmanlık, görüşmelerin video aracılığıyla yapıldığı bir destek biçimidir. Bu yazıda sürecin nasıl işlediğini ve sınırlarını ele alıyoruz.",
        contentEn:
          "Online psychological counseling is a form of support where sessions are held over video. In this post we cover how the process works and its limits.",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: owner.id,
      },
    });
  }

  console.log("✅ Seed tamamlandı. Owner:", ownerEmail);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
