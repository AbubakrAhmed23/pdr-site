import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { savePricing, deletePricing } from "../actions";
import { Trash2 } from "lucide-react";

type Pricing = Awaited<ReturnType<typeof prisma.pricing.findMany>>[number];

function PricingForm({ item }: { item?: Pricing }) {
  return (
    <form action={savePricing} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Ad (TR)</Label>
          <Input name="nameTr" required defaultValue={item?.nameTr ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Ad (EN)</Label>
          <Input name="nameEn" required defaultValue={item?.nameEn ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Açıklama (TR)</Label>
          <Textarea name="descriptionTr" rows={2} defaultValue={item?.descriptionTr ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Açıklama (EN)</Label>
          <Textarea name="descriptionEn" rows={2} defaultValue={item?.descriptionEn ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label>Tür</Label>
          <select
            name="sessionType"
            defaultValue={item?.sessionType ?? "INDIVIDUAL"}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="INDIVIDUAL">Bireysel</option>
            <option value="INTRO">Tanışma</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Ücret</Label>
          <Input name="amount" type="number" step="1" defaultValue={Number(item?.amount ?? 0)} />
        </div>
        <div className="space-y-1.5">
          <Label>Para birimi</Label>
          <Input name="currency" defaultValue={item?.currency ?? "TRY"} />
        </div>
        <div className="space-y-1.5">
          <Label>Süre (dk)</Label>
          <Input name="durationMinutes" type="number" defaultValue={item?.durationMinutes ?? 50} />
        </div>
        <div className="space-y-1.5">
          <Label>Sıra</Label>
          <Input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} />
        Aktif (sitede görünsün)
      </label>
      <div className="flex items-center gap-2">
        <SubmitButton>{item ? "Güncelle" : "Ekle"}</SubmitButton>
        {item && (
          <Button
            type="submit"
            formAction={deletePricing.bind(null, item.id)}
            formNoValidate
            variant="ghost"
            size="sm"
            className="text-destructive"
          >
            <Trash2 className="size-4" /> Sil
          </Button>
        )}
      </div>
    </form>
  );
}

export default async function AdminPricingPage() {
  const pricing = await prisma.pricing.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Fiyatlar"
        description="Seans paketlerini ve ücretleri yönetin."
      />
      <div className="space-y-6">
        {pricing.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-base">{item.nameTr}</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingForm item={item} />
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Yeni paket ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <PricingForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
