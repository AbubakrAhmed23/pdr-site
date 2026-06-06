import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, encryptJSON } from "@/lib/crypto";
import {
  computeScores,
  routingKey,
  textIndicatesCrisis,
} from "@/lib/assessment/scales";
import {
  anthropic,
  ASSESSMENT_MODEL,
  systemPrompt,
  userPrompt,
  fallbackSummary,
} from "@/lib/assessment/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

function crisisMessage(locale: string) {
  if (locale === "en") {
    return `Thank you for your honesty — what you shared matters, and you are not alone.

Your answers suggest you may be going through a very difficult time, possibly including thoughts of harming yourself. This online pre-assessment is not the right tool for a crisis.

Please reach out for immediate support now:
• Call 112 (emergency services) right away.
• Go to the nearest hospital emergency department.
• Talk to someone you trust and let them stay with you.

If you can, please don't stay alone right now. Help is available, and things can get better with the right support.`;
  }
  return `Bunları paylaştığınız için teşekkür ederiz — hissettikleriniz önemli ve yalnız değilsiniz.

Yanıtlarınız, şu anda çok zor bir dönemden geçiyor olabileceğinizi, hatta kendinize zarar verme düşünceleriniz olabileceğini gösteriyor. Bu çevrimiçi ön değerlendirme, bir kriz durumu için uygun bir araç değildir.

Lütfen hemen destek alın:
• Vakit kaybetmeden 112 Acil Servis'i arayın.
• En yakın hastanenin acil servisine başvurun.
• Güvendiğiniz birine durumu anlatın ve yanınızda kalmasını isteyin.

Mümkünse şu an yalnız kalmayın. Destek mümkün ve doğru yardımla işler iyileşebilir.`;
}

export async function POST(req: Request) {
  let body: {
    locale?: string;
    gad7?: number[];
    phq9?: number[];
    concern?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "tr";
  const gad7 = (body.gad7 ?? []).map(Number).slice(0, 7);
  const phq9 = (body.phq9 ?? []).map(Number).slice(0, 9);
  const concern = String(body.concern ?? "");
  if (gad7.length < 7 || phq9.length < 9) {
    return new Response("incomplete answers", { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const base = computeScores(gad7, phq9);
  const crisis = base.crisis || textIndicatesCrisis(concern);
  const riskLevel = crisis ? "CRISIS" : base.riskLevel;
  const scores = { ...base, riskLevel, crisis };

  const assessment = await prisma.assessment.create({
    data: {
      userId,
      locale: locale === "en" ? "EN" : "TR",
      status: "COMPLETED",
      riskLevel,
      routing: routingKey(riskLevel),
      scoresEncrypted: encryptJSON(scores),
      transcriptEncrypted: concern ? encrypt(concern) : null,
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      const push = (t: string) => {
        full += t;
        controller.enqueue(encoder.encode(t));
      };
      try {
        if (crisis) {
          push(crisisMessage(locale));
        } else if (anthropic) {
          const aiStream = await anthropic.messages.create({
            model: ASSESSMENT_MODEL,
            max_tokens: 700,
            system: [
              {
                type: "text",
                text: systemPrompt(locale),
                cache_control: { type: "ephemeral" },
              },
            ],
            messages: [
              { role: "user", content: userPrompt(scores, concern, locale) },
            ],
            stream: true,
          });
          for await (const event of aiStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              push(event.delta.text);
            }
          }
        } else {
          // Yedek: API anahtarı yokken kelime kelime akıt (gerçek zamanlı his).
          const text = fallbackSummary(scores, locale);
          for (const chunk of text.match(/\S+\s*|\n+/g) ?? [text]) {
            push(chunk);
            await new Promise((r) => setTimeout(r, 12));
          }
        }
      } catch {
        push(
          locale === "tr"
            ? "\n\n(Özet oluşturulurken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.)"
            : "\n\n(There was a problem generating the summary. Please try again later.)",
        );
      } finally {
        try {
          await prisma.assessment.update({
            where: { id: assessment.id },
            data: { summary: full.slice(0, 4000) },
          });
        } catch {
          // yoksay
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Risk-Level": riskLevel,
      "X-Crisis": crisis ? "1" : "0",
      "X-Assessment-Id": assessment.id,
    },
  });
}
