import { prisma } from "@/lib/prisma";
import { decryptJSON } from "@/lib/crypto";
import type { AssessmentScores } from "@/lib/assessment/scales";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

const RISK_LABEL: Record<string, string> = {
  LOW: "Düşük",
  MODERATE: "Orta",
  HIGH: "Yüksek",
  CRISIS: "Acil",
};
const RISK_STYLE: Record<string, string> = {
  LOW: "bg-primary/10 text-primary",
  MODERATE: "bg-accent text-accent-foreground",
  HIGH: "bg-destructive/15 text-destructive",
  CRISIS: "bg-destructive text-destructive-foreground",
};

export default async function AdminAssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  const fmt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <AdminPageHeader
        title="Ön Değerlendirmeler"
        description="Danışanların AI ön değerlendirme sonuçları (şifreli saklanır)."
      />
      <div className="space-y-3">
        {assessments.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>
        )}
        {assessments.map((a) => {
          let scores: AssessmentScores | null = null;
          try {
            if (a.scoresEncrypted) scores = decryptJSON(a.scoresEncrypted);
          } catch {
            scores = null;
          }
          const risk = a.riskLevel ?? "LOW";
          return (
            <Card key={a.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {a.user?.name ?? a.user?.email ?? "Anonim"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmt.format(a.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_STYLE[risk]}`}
                  >
                    {RISK_LABEL[risk]}
                  </span>
                </div>
                {scores && (
                  <p className="text-xs text-muted-foreground">
                    GAD-7: {scores.gad7Total}/21 ({scores.gad7Severity}) · PHQ-9:{" "}
                    {scores.phq9Total}/27 ({scores.phq9Severity})
                    {scores.selfHarm && " · ⚠ kendine zarar maddesi"}
                  </p>
                )}
                {a.summary && (
                  <p className="whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                    {a.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
