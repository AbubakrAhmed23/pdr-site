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
    {
      key: "legal.privacy",
      valueTr:
        "Gizlilik Politikası\n\nKişisel verileriniz yalnızca danışmanlık hizmetinin sunulması amacıyla işlenir ve üçüncü kişilerle paylaşılmaz. Görüşmeler gizli tutulur. Bağlantılar SSL/TLS ile şifrelenir; hassas veriler şifreli olarak saklanır.\n\n(Bu metin bir taslaktır ve yürürlüğe girmeden önce bir hukuk danışmanı tarafından gözden geçirilmelidir.)",
      valueEn:
        "Privacy Policy\n\nYour personal data is processed solely to provide the counseling service and is not shared with third parties. Sessions are kept confidential. Connections are encrypted via SSL/TLS; sensitive data is stored encrypted.\n\n(This text is a draft and should be reviewed by a legal advisor before going live.)",
    },
    {
      key: "legal.kvkk",
      valueTr:
        "KVKK Aydınlatma Metni\n\n6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla; kimlik, iletişim ve sağlıkla ilgili (özel nitelikli) verileriniz, açık rızanıza dayanarak danışmanlık hizmetinin yürütülmesi amacıyla işlenir. Verileriniz gerekli teknik ve idari tedbirlerle korunur. KVKK madde 11 kapsamındaki haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.\n\n(Bu metin bir taslaktır; bir hukuk danışmanı tarafından gözden geçirilmelidir.)",
      valueEn:
        "Data Protection (KVKK) Notice\n\nUnder Turkey's Law No. 6698, as data controller we process your identity, contact and health-related (special-category) data based on your explicit consent, to deliver the counseling service. Your data is protected with appropriate technical and administrative measures. You may contact us to exercise your rights under Article 11.\n\n(This text is a draft and should be reviewed by a legal advisor.)",
    },
    {
      key: "legal.terms",
      valueTr:
        "Kullanım Koşulları\n\nBu platform çevrimiçi psikolojik danışmanlık ve rehberlik hizmeti sunar; tıbbi teşhis, tedavi veya ilaç önerisi içermez. Acil/kriz durumlarında platform uygun değildir; lütfen 112'yi arayın. Randevu ve ödeme koşulları danışma sözleşmesinde belirtilir.\n\n(Bu metin bir taslaktır; bir hukuk danışmanı tarafından gözden geçirilmelidir.)",
      valueEn:
        "Terms of Use\n\nThis platform provides online psychological counseling and guidance; it does not include medical diagnosis, treatment, or medication advice. It is not suitable for emergencies/crises; please call 112. Appointment and payment terms are set out in the counseling agreement.\n\n(This text is a draft and should be reviewed by a legal advisor.)",
    },
    {
      key: "legal.contract",
      valueTr:
        "Çevrimiçi Psikolojik Danışma Sözleşmesi\n\nBu sözleşme, danışan ile psikolojik danışman arasındaki çevrimiçi görüşmelerin çerçevesini belirler: ücret, süre, seans sıklığı, ödeme yöntemi (WhatsApp üzerinden koordinasyon) ve sürecin avantaj/dezavantajları. Görüşmeler gizlidir. Danışman; kendine/başkasına zarar riski, 18 yaş altı, madde kullanımı, ağır kriz veya psikotik tablo durumlarında çevrimiçi danışma vermez ve uygun birime yönlendirir. İlaç/tıbbi öneri verilmez.\n\n(Bu metin bir taslaktır; bir hukuk danışmanı tarafından gözden geçirilmelidir.)",
      valueEn:
        "Online Counseling Agreement\n\nThis agreement sets the framework for online sessions between client and counselor: fee, duration, session frequency, payment method (coordinated via WhatsApp) and the advantages/limitations of the process. Sessions are confidential. The counselor does not provide online counseling in cases of risk of harm to self/others, under 18, substance use, severe crisis or psychosis, and will refer to the appropriate service. No medication/medical advice is given.\n\n(This text is a draft and should be reviewed by a legal advisor.)",
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
