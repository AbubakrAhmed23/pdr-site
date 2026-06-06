import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminAssessmentsPage() {
  return (
    <>
      <AdminPageHeader
        title="Ön Değerlendirmeler"
        description="Danışanların AI ön değerlendirme sonuçları."
      />
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Bu bölüm AI ön değerlendirme özelliğiyle birlikte aktif olacaktır.
        </CardContent>
      </Card>
    </>
  );
}
