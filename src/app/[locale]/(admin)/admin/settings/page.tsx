import { getSettings } from "@/lib/site-data";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { updateSettings } from "../actions";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <AdminPageHeader
        title="Ayarlar"
        description="WhatsApp numarası, iletişim ve genel ayarlar."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form action={updateSettings} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="whatsappNumber">WhatsApp numarası</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="905555555555"
                defaultValue={settings.whatsappNumber ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                Ülke koduyla, başında + olmadan. Ödeme/koordinasyon bu numara
                üzerinden yapılır.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">İletişim e-postası</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="introDurationMinutes">
                Tanışma görüşmesi süresi (dk)
              </Label>
              <Input
                id="introDurationMinutes"
                name="introDurationMinutes"
                type="number"
                defaultValue={settings.introDurationMinutes ?? "15"}
              />
            </div>
            <SubmitButton>Kaydet</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
