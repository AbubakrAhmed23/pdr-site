import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { updateProfile, updateSiteContent } from "../actions";

export default async function AdminContentPage() {
  const profile = await prisma.counselorProfile.findFirst();
  const aboutBody = await prisma.siteContent.findUnique({
    where: { key: "about.body" },
  });
  const contactBody = await prisma.siteContent.findUnique({
    where: { key: "contact.body" },
  });

  return (
    <>
      <AdminPageHeader
        title="İçerik & Profil"
        description="Danışman profilinizi ve sayfa metinlerini düzenleyin."
      />

      <div className="space-y-8">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle>Danışman Profili</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="titleTr">Ünvan (TR)</Label>
                  <Input id="titleTr" name="titleTr" defaultValue={profile?.titleTr ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="titleEn">Ünvan (EN)</Label>
                  <Input id="titleEn" name="titleEn" defaultValue={profile?.titleEn ?? ""} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bioTr">Biyografi (TR)</Label>
                  <Textarea id="bioTr" name="bioTr" rows={5} defaultValue={profile?.bioTr ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bioEn">Biyografi (EN)</Label>
                  <Textarea id="bioEn" name="bioEn" rows={5} defaultValue={profile?.bioEn ?? ""} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="specialtiesTr">Uzmanlık alanları (TR)</Label>
                  <Textarea
                    id="specialtiesTr"
                    name="specialtiesTr"
                    rows={4}
                    defaultValue={(profile?.specialtiesTr ?? []).join("\n")}
                  />
                  <p className="text-xs text-muted-foreground">Her satıra bir alan.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialtiesEn">Uzmanlık alanları (EN)</Label>
                  <Textarea
                    id="specialtiesEn"
                    name="specialtiesEn"
                    rows={4}
                    defaultValue={(profile?.specialtiesEn ?? []).join("\n")}
                  />
                  <p className="text-xs text-muted-foreground">One per line.</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="photoUrl">Fotoğraf URL</Label>
                <Input id="photoUrl" name="photoUrl" defaultValue={profile?.photoUrl ?? ""} />
              </div>
              <SubmitButton>Kaydet</SubmitButton>
            </form>
          </CardContent>
        </Card>

        {/* Hakkımda metni */}
        <Card>
          <CardHeader>
            <CardTitle>&quot;Hakkımda&quot; Sayfası Metni</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateSiteContent.bind(null, "about.body")} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="about-tr">Metin (TR)</Label>
                  <Textarea id="about-tr" name="valueTr" rows={5} defaultValue={aboutBody?.valueTr ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="about-en">Metin (EN)</Label>
                  <Textarea id="about-en" name="valueEn" rows={5} defaultValue={aboutBody?.valueEn ?? ""} />
                </div>
              </div>
              <SubmitButton>Kaydet</SubmitButton>
            </form>
          </CardContent>
        </Card>

        {/* İletişim metni */}
        <Card>
          <CardHeader>
            <CardTitle>&quot;İletişim&quot; Sayfası Metni</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateSiteContent.bind(null, "contact.body")} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-tr">Metin (TR)</Label>
                  <Textarea id="contact-tr" name="valueTr" rows={4} defaultValue={contactBody?.valueTr ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-en">Metin (EN)</Label>
                  <Textarea id="contact-en" name="valueEn" rows={4} defaultValue={contactBody?.valueEn ?? ""} />
                </div>
              </div>
              <SubmitButton>Kaydet</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
