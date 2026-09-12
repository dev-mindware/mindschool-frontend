"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Icon,
} from "@/components";
import { useSchoolSettingsStore } from "@/stores/school";
import { toast } from "sonner";

export function SchoolInstitutionalSettings() {
  const { profile, updateProfile } = useSchoolSettingsStore();
  const [formData, setFormData] = useState({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateProfile(formData);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Dados institucionais do Colégio atualizados com sucesso!");
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Icon name="GraduationCap" className="w-5 h-5 text-primary" />
            Dados Institucionais & Homologação MED
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Informações legais e regulamentares para emissão de certidões, mapas estatísticos e pautas
          </p>
        </div>
        <Button type="submit" disabled={isSaving} size="sm" className="h-8 text-xs font-semibold">
          <Icon name="Save" className="w-3.5 h-3.5 mr-1.5" />
          {isSaving ? "A guardar..." : "Guardar Alterações"}
        </Button>
      </div>

      {/* Official MED Legal Framework Card */}
      <Card className="border shadow-none bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="Scale" className="w-4 h-4 text-primary" />
              Enquadramento Legal & Diário da República
            </CardTitle>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              Decreto Presidencial 424/25
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 sm:col-span-2">
            <label className="font-medium text-foreground">Nome Oficial da Instituição</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Código de Entidade MED</label>
            <input
              type="text"
              value={formData.medRegistrationCode}
              onChange={(e) => setFormData({ ...formData, medRegistrationCode: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-mono font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Decreto Executivo de Criação</label>
            <input
              type="text"
              value={formData.decreeNumber}
              onChange={(e) => setFormData({ ...formData, decreeNumber: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Data Diário da República</label>
            <input
              type="text"
              value={formData.gazetteDate}
              onChange={(e) => setFormData({ ...formData, gazetteDate: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Série Diário da República</label>
            <input
              type="text"
              value={formData.gazetteSeries}
              onChange={(e) => setFormData({ ...formData, gazetteSeries: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="font-medium text-foreground">Subtítulo / Ciclos de Ensino Ministrados</label>
            <input
              type="text"
              value={formData.subTitle || ""}
              onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location and Contacts Card */}
      <Card className="border shadow-none bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="MapPin" className="w-4 h-4 text-primary" />
            Localização Geográfica & Contactos Oficiais
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Província</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Município</label>
            <input
              type="text"
              value={formData.municipality}
              onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Distrito Urbano / Bairro</label>
            <input
              type="text"
              value={formData.communeOrDistrict}
              onChange={(e) => setFormData({ ...formData, communeOrDistrict: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="font-medium text-foreground">Endereço Completo</label>
            <input
              type="text"
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Telefone da Secretaria</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">E-mail Institucional</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">NIF da Instituição</label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-mono font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Homologated Direction Card */}
      <Card className="border shadow-none bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="Users" className="w-4 h-4 text-primary" />
            Direção Escolar Homologada
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Nome do Diretor(a) Geral</label>
            <input
              type="text"
              value={formData.directorGeneralName}
              onChange={(e) => setFormData({ ...formData, directorGeneralName: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
            <p className="text-[10px] text-muted-foreground">Figura oficial assinante dos certificados e diplomas de honra.</p>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Nome do Diretor(a) Pedagógico(a)</label>
            <input
              type="text"
              value={formData.pedagogicDirectorName}
              onChange={(e) => setFormData({ ...formData, pedagogicDirectorName: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
            <p className="text-[10px] text-muted-foreground">Responsável pela homologação e fecho oficial das pautas trimestrais.</p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
