import Anthropic from "@anthropic-ai/sdk";
import type { AssessmentScores } from "./scales";

export const ASSESSMENT_MODEL = "claude-sonnet-4-6";

const apiKey = process.env.ANTHROPIC_API_KEY;
export const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

/**
 * Katı güvenlik kuralları içeren sistem promptu.
 * AI: tanı koymaz, ilaç/tedavi önermez; bu bir taramadır, teşhis değildir.
 */
export function systemPrompt(locale: string): string {
  const lang = locale === "en" ? "English" : "Turkish";
  return `You support an online PSYCHOLOGICAL COUNSELING & GUIDANCE practice. The counselor holds a Guidance & Counseling (PDR) degree and is NOT a clinical psychologist, psychiatrist, or medical doctor.

Your job: write a brief, warm, plain-language reflection of a person's self-report screening (GAD-7 anxiety and PHQ-9 depression scales) and gently guide next steps.

HARD RULES — never violate:
- You are NOT a doctor. You do NOT and CANNOT diagnose. Never state or imply the person "has" a disorder.
- This is a SCREENING, not a diagnosis. Say so explicitly, once.
- Never suggest, name, or imply any medication or medical/clinical treatment.
- Do not promise outcomes or use alarming language.
- Offer only general, low-risk wellbeing suggestions (e.g. sleep, routine, breathing, talking to someone) framed as self-care, not treatment.
- Encourage seeking appropriate professional support, and invite a free intro call with the counselor.
- Be respectful, non-judgmental, hopeful.

Write ONLY in ${lang}. Keep it 120–180 words, in short paragraphs. End with one sentence reminding this is not a diagnosis.`;
}

export function userPrompt(
  scores: AssessmentScores,
  concern: string,
  locale: string,
): string {
  const lang = locale === "en" ? "English" : "Turkish";
  return `Self-report screening results:
- GAD-7 (anxiety) total: ${scores.gad7Total}/21 (severity: ${scores.gad7Severity})
- PHQ-9 (depression) total: ${scores.phq9Total}/27 (severity: ${scores.phq9Severity})
- Overall stepped-care level: ${scores.riskLevel}

The person also wrote (may be empty): """${concern.slice(0, 1500)}"""

Write the supportive reflection in ${lang} following all the hard rules. Acknowledge what they shared, reflect the screening gently, give 2–3 concrete general self-care suggestions matched to the severity, and warmly invite a free intro call.`;
}

/** API anahtarı yoksa kullanılan deterministik, güvenli yedek özet. */
export function fallbackSummary(
  scores: AssessmentScores,
  locale: string,
): string {
  const tr = locale !== "en";
  const sev = scores.riskLevel;
  if (tr) {
    const intro =
      "Paylaştıklarınız için teşekkür ederiz. Aşağıdaki değerlendirme bir tarama sonucudur; bir teşhis değildir.";
    const body: Record<string, string> = {
      HIGH: "Yanıtlarınız, son dönemde belirgin düzeyde zorlanma yaşıyor olabileceğinizi gösteriyor. Bu yükü tek başınıza taşımak zorunda değilsiniz; bir profesyonelle konuşmak iyi gelebilir.",
      MODERATE:
        "Yanıtlarınız, orta düzeyde bir zorlanma yaşıyor olabileceğinizi gösteriyor. Bu duyguları ciddiye almanız değerli ve destek almak faydalı olabilir.",
      LOW: "Yanıtlarınız şu an belirgin bir zorlanma işareti vermiyor. Yine de kendinizi gözlemlemeye ve ihtiyaç duyduğunuzda destek aramaya devam edebilirsiniz.",
    };
    const tips =
      "Bu süreçte uyku düzenine özen göstermek, gün içinde kısa nefes/dinlenme molaları vermek ve güvendiğiniz biriyle konuşmak iyi gelebilir.";
    const cta =
      "Dilerseniz ücretsiz bir tanışma görüşmesiyle başlayabilir, sürecin size uygun olup olmadığını birlikte değerlendirebiliriz.";
    const note = "Unutmayın: bu sonuç bir teşhis değil, yalnızca bir ön değerlendirmedir.";
    return `${intro}\n\n${body[sev === "CRISIS" ? "HIGH" : sev]}\n\n${tips}\n\n${cta}\n\n${note}`;
  }
  const intro =
    "Thank you for sharing. The reflection below is a screening result, not a diagnosis.";
  const body: Record<string, string> = {
    HIGH: "Your answers suggest you may be experiencing a notable level of distress recently. You don't have to carry this alone; talking with a professional may help.",
    MODERATE:
      "Your answers suggest a moderate level of distress. Taking these feelings seriously is valuable, and support could help.",
    LOW: "Your answers don't currently indicate notable distress. You can keep checking in with yourself and reach out for support whenever you need.",
  };
  const tips =
    "It may help to protect your sleep routine, take short breathing/rest breaks during the day, and talk with someone you trust.";
  const cta =
    "If you'd like, you can start with a free intro call so we can assess together whether this process is right for you.";
  const note = "Remember: this result is a pre-assessment, not a diagnosis.";
  return `${intro}\n\n${body[sev === "CRISIS" ? "HIGH" : sev]}\n\n${tips}\n\n${cta}\n\n${note}`;
}
