"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { icons } from "lucide-react";
import { Can, Badge, Button, Card, CardContent, CardHeader, CardTitle, FormModal, Icon, Input, TitleList } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school";
import { useModal } from "@/stores/modal/use-modal-store";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";
import { getApiErrorMessage } from "@/utils/api-error";

type Profile = ReturnType<typeof useSchoolSettingsStore.getState>["profile"];

function InfoCard({ icon, title, badge, rows }: { icon: keyof typeof icons; title: string; badge?: string; rows: Array<[string, string | undefined]> }) {
  return (
    <Card className="h-full gap-0 py-4">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name={icon} className="size-4" /></span>
          {title}
        </CardTitle>
        {badge && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{badge}</Badge>}
      </CardHeader>
      <CardContent className="px-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => (<div key={k} className="flex flex-col"><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="font-medium">{v || "—"}</dd></div>))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Dados institucionais da escola (homologação MED, localização, contactos e direcção): leitura em cartões, edição em modal. */
export function SchoolInstitutionalSettings() {
  const { profile, updateProfile } = useSchoolSettingsStore();
  const { save } = useSchoolProfile();
  const { openModal } = useModal();
  const [f, setF] = useState<Profile>({ ...profile });
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = () =>
    save.mutateAsync(f)
      .then(() => { updateProfile(f); SucessMessage("Dados institucionais atualizados."); })
      .catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados.")); throw e; });

  return (
    <div className="space-y-6">
      <TitleList title="Dados Institucionais" suTitle="Informações legais e regulamentares usadas na emissão de certidões, mapas estatísticos e pautas.">
        <Can permission="school:update"><Button size="sm" className="gap-2" onClick={() => { setF({ ...profile }); openModal("settings-institution"); }}><Icon name="Pencil" className="size-4" />Editar dados</Button></Can>
      </TitleList>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard icon="Scale" title="Enquadramento legal" badge="Decreto Presidencial 424/25" rows={[
          ["Nome oficial", profile.schoolName], ["Código de entidade MED", profile.medRegistrationCode], ["Decreto de criação", profile.decreeNumber],
          ["Diário da República", `${profile.gazetteSeries ?? ""} · ${profile.gazetteDate ?? ""}`], ["Ciclos ministrados", profile.subTitle],
        ]} />
        <InfoCard icon="MapPin" title="Localização e contactos" rows={[
          ["Província", profile.province], ["Município", profile.municipality], ["Distrito / Bairro", profile.communeOrDistrict], ["Endereço", profile.fullAddress],
          ["Telefone", profile.phone], ["E-mail", profile.email], ["NIF", profile.taxNumber],
        ]} />
        <InfoCard icon="Users" title="Direcção escolar homologada" rows={[["Director(a) Geral", profile.directorGeneralName], ["Director(a) Pedagógico(a)", profile.pedagogicDirectorName]]} />
      </div>

      <FormModal id="settings-institution" title="Dados institucionais" description="Estas informações aparecem em certificados, pautas e mapas oficiais." size="lg" submitLabel="Guardar alterações" isLoading={save.isPending} onSubmit={submit} disabled={!f.schoolName?.trim()}>
        <div className="sm:col-span-2"><Input label="Nome oficial da instituição *" startIcon="School" value={f.schoolName} onChange={(e) => set("schoolName", e.target.value)} /></div>
        <Input label="Código de entidade MED" value={f.medRegistrationCode} onChange={(e) => set("medRegistrationCode", e.target.value)} />
        <Input label="Decreto executivo de criação" value={f.decreeNumber} onChange={(e) => set("decreeNumber", e.target.value)} />
        <Input label="Data do Diário da República" value={f.gazetteDate} onChange={(e) => set("gazetteDate", e.target.value)} />
        <Input label="Série do Diário da República" value={f.gazetteSeries} onChange={(e) => set("gazetteSeries", e.target.value)} />
        <div className="sm:col-span-2"><Input label="Ciclos de ensino ministrados" value={f.subTitle ?? ""} onChange={(e) => set("subTitle", e.target.value)} /></div>
        <Input label="Província" startIcon="MapPin" value={f.province} onChange={(e) => set("province", e.target.value)} />
        <Input label="Município" value={f.municipality} onChange={(e) => set("municipality", e.target.value)} />
        <Input label="Distrito urbano / bairro" value={f.communeOrDistrict} onChange={(e) => set("communeOrDistrict", e.target.value)} />
        <Input label="NIF da instituição" startIcon="Hash" value={f.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} />
        <div className="sm:col-span-2"><Input label="Endereço completo" value={f.fullAddress} onChange={(e) => set("fullAddress", e.target.value)} /></div>
        <Input label="Telefone da secretaria" startIcon="Phone" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        <Input label="E-mail institucional" type="email" startIcon="Mail" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <Input label="Director(a) Geral" startIcon="User" value={f.directorGeneralName} onChange={(e) => set("directorGeneralName", e.target.value)} />
        <Input label="Director(a) Pedagógico(a)" startIcon="User" value={f.pedagogicDirectorName} onChange={(e) => set("pedagogicDirectorName", e.target.value)} />
      </FormModal>
    </div>
  );
}
