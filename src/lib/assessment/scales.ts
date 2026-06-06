// Doğrulanmış tarama ölçekleri — GAD-7 (anksiyete) ve PHQ-9 (depresyon).
// NOT: Bunlar tanı araçları DEĞİL, taramadır. Skorlama deterministiktir (AI değil).

export type Localized = { tr: string; en: string };

export const RESPONSE_OPTIONS: { value: number; label: Localized }[] = [
  { value: 0, label: { tr: "Hiçbir zaman", en: "Not at all" } },
  { value: 1, label: { tr: "Birkaç gün", en: "Several days" } },
  {
    value: 2,
    label: { tr: "Günlerin yarısından fazlasında", en: "More than half the days" },
  },
  { value: 3, label: { tr: "Neredeyse her gün", en: "Nearly every day" } },
];

export const GAD7: Localized[] = [
  { tr: "Sinirli, kaygılı veya endişeli hissetme", en: "Feeling nervous, anxious, or on edge" },
  { tr: "Endişelenmeyi durduramama veya kontrol edememe", en: "Not being able to stop or control worrying" },
  { tr: "Farklı konularda çok fazla endişelenme", en: "Worrying too much about different things" },
  { tr: "Rahatlamakta zorlanma", en: "Trouble relaxing" },
  { tr: "Yerinde duramayacak kadar huzursuz olma", en: "Being so restless that it's hard to sit still" },
  { tr: "Kolayca sinirlenme veya rahatsız olma", en: "Becoming easily annoyed or irritable" },
  { tr: "Sanki kötü bir şey olacakmış gibi korku hissetme", en: "Feeling afraid as if something awful might happen" },
];

export const PHQ9: Localized[] = [
  { tr: "İşlere karşı ilgi veya zevk duymama", en: "Little interest or pleasure in doing things" },
  { tr: "Kendini üzgün, çökkün veya umutsuz hissetme", en: "Feeling down, depressed, or hopeless" },
  { tr: "Uykuya dalmada/sürdürmede güçlük veya çok fazla uyuma", en: "Trouble falling/staying asleep, or sleeping too much" },
  { tr: "Yorgun hissetme veya enerji düşüklüğü", en: "Feeling tired or having little energy" },
  { tr: "İştahsızlık veya aşırı yeme", en: "Poor appetite or overeating" },
  { tr: "Kendini kötü hissetme; başarısız olduğunu veya kendini/aileni hayal kırıklığına uğrattığını düşünme", en: "Feeling bad about yourself, or that you are a failure or have let yourself/your family down" },
  { tr: "Bir şeylere (okuma, TV) konsantre olmada güçlük", en: "Trouble concentrating on things, such as reading or watching television" },
  { tr: "Başkalarının fark edeceği kadar yavaş hareket etme/konuşma ya da tam tersi aşırı huzursuz olma", en: "Moving/speaking so slowly others could notice, or being fidgety/restless" },
  { tr: "Ölmüş olmanın daha iyi olacağını veya kendine zarar vermeyi düşünme", en: "Thoughts that you would be better off dead, or of hurting yourself" },
];

export type Severity = "minimal" | "mild" | "moderate" | "severe";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRISIS";

export function sum(answers: number[]) {
  return answers.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export function gad7Severity(score: number): Severity {
  if (score >= 15) return "severe";
  if (score >= 10) return "moderate";
  if (score >= 5) return "mild";
  return "minimal";
}

export function phq9Severity(score: number): Severity {
  if (score >= 20) return "severe";
  if (score >= 15) return "moderate";
  if (score >= 10) return "mild";
  return "minimal";
}

export type AssessmentScores = {
  gad7Total: number;
  phq9Total: number;
  gad7Severity: Severity;
  phq9Severity: Severity;
  selfHarm: boolean; // PHQ-9 madde 9 > 0
  riskLevel: RiskLevel;
  crisis: boolean;
};

export function computeScores(
  gad7Answers: number[],
  phq9Answers: number[],
): AssessmentScores {
  const gad7Total = sum(gad7Answers);
  const phq9Total = sum(phq9Answers);
  const gSev = gad7Severity(gad7Total);
  const pSev = phq9Severity(phq9Total);
  const selfHarm = (phq9Answers[8] ?? 0) >= 1;

  let riskLevel: RiskLevel;
  if (selfHarm) riskLevel = "CRISIS";
  else if (gSev === "severe" || pSev === "severe") riskLevel = "HIGH";
  else if (gSev === "moderate" || pSev === "moderate") riskLevel = "MODERATE";
  else riskLevel = "LOW";

  return {
    gad7Total,
    phq9Total,
    gad7Severity: gSev,
    phq9Severity: pSev,
    selfHarm,
    riskLevel,
    crisis: riskLevel === "CRISIS",
  };
}

// Stepped-care yönlendirme (kademeli bakım) önerisi — riske göre.
export function routingKey(risk: RiskLevel): string {
  switch (risk) {
    case "CRISIS":
      return "routingCrisis";
    case "HIGH":
      return "routingHigh";
    case "MODERATE":
      return "routingModerate";
    default:
      return "routingLow";
  }
}

// Kriz metninde serbest metinde aranan riskli ifadeler (kural tabanlı ek güvenlik).
const CRISIS_PATTERNS = [
  /intihar/i,
  /kendime zarar/i,
  /yaşamak istemiyorum/i,
  /ölmek istiyorum/i,
  /canıma kıy/i,
  /suicid/i,
  /kill myself/i,
  /end my life/i,
  /self[-\s]?harm/i,
  /hurt myself/i,
];

export function textIndicatesCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}
