"use client";

import { useState, type FormEvent } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { icons } from "lucide-react";
import {
  Can,
  Badge,
  Button,
  Icon,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  TitleList,
} from "@/components";
import { useSchoolSettingsStore } from "@/stores/school";
import { useModal } from "@/stores/modal/use-modal-store";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";
import { getApiErrorMessage } from "@/utils/api-error";
import { DocumentBrandingSettings } from "./document-branding-settings";
import { nifError } from "@/lib/nif";

type Profile = ReturnType<typeof useSchoolSettingsStore.getState>["profile"];

const MODAL_ID = "settings-institution";

function InfoSection({
  icon,
  title,
  badge,
  rows,
}: {
  icon: keyof typeof icons;
  title: string;
  badge?: string;
  rows: Array<[string, string | undefined]>;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-xs bg-primary/10 text-primary">
            <Icon name={icon} className="size-4" />
          </span>
          {title}
        </h3>
        {badge && (
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            {badge}
          </Badge>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Dados institucionais da escola (homologação MED, localização, contactos e direção): leitura limpa, edição em Sheet. */
export function SchoolInstitutionalSettings() {
  const { profile, updateProfile } = useSchoolSettingsStore();
  const { save } = useSchoolProfile();
  const { open, openModal, closeModal } = useModal();
  const [f, setF] = useState<Profile>({ ...profile });
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF((p) => ({ ...p, [k]: v }));

  const isSheetOpen = Boolean(open[MODAL_ID]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.schoolName?.trim() || save.isPending) return;
    try {
      await save.mutateAsync(f);
      updateProfile(f);
      SucessMessage("Dados institucionais atualizados.");
      closeModal(MODAL_ID);
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível guardar os dados."));
    }
  };

  return (
    <div className="space-y-6">
      <TitleList
        title="Dados Institucionais"
        suTitle="Informações legais e regulamentares usadas na emissão de certidões, mapas estatísticos e pautas."
      >
        <Can permission="school:update">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setF({ ...profile });
              openModal(MODAL_ID);
            }}
          >
            <Icon name="Pencil" className="size-4" />
            Editar dados
          </Button>
        </Can>
      </TitleList>

      <Separator />

      <div className="space-y-6">
        <InfoSection
          icon="Scale"
          title="Enquadramento legal"
          badge="Decreto Executivo n.º 424/25"
          rows={[
            ["Nome oficial", profile.schoolName],
            ["Código de entidade MED", profile.medRegistrationCode],
            ["Decreto de criação", profile.decreeNumber],
            ["Diário da República", [profile.gazetteSeries, profile.gazetteDate].filter(Boolean).join(" · ")],
            ["Ciclos ministrados", profile.subTitle],
          ]}
        />
        <Separator />
        <InfoSection
          icon="MapPin"
          title="Localização e contactos"
          rows={[
            ["Província", profile.province],
            ["Município", profile.municipality],
            ["Distrito / Bairro", profile.communeOrDistrict],
            ["Endereço", profile.fullAddress],
            ["Telefone", profile.phone],
            ["E-mail", profile.email],
            ["NIF", profile.taxNumber],
          ]}
        />
        <Separator />
        <InfoSection
          icon="Users"
          title="Direção escolar homologada"
          rows={[
            ["Diretor(a) Geral", profile.directorGeneralName || "Por definir (use «Editar»)"],
            ["Diretor(a) Pedagógico(a)", profile.pedagogicDirectorName || "Por definir (use «Editar»)"],
          ]}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(v) => !v && closeModal(MODAL_ID)}>
        <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
          <SheetHeader className="p-0">
            <SheetTitle>Dados institucionais</SheetTitle>
            <SheetDescription>
              Estas informações aparecem em certificados, pautas e mapas oficiais.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-1 flex-col gap-6">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Nome oficial da instituição *"
                  startIcon="School"
                  value={f.schoolName}
                  onChange={(e) => set("schoolName", e.target.value)}
                />
              </div>
              <Input
                label="Código de entidade MED"
                value={f.medRegistrationCode}
                onChange={(e) => set("medRegistrationCode", e.target.value)}
              />
              <Input
                label="Decreto executivo de criação"
                value={f.decreeNumber}
                onChange={(e) => set("decreeNumber", e.target.value)}
              />
              <Input
                label="Data do Diário da República"
                value={f.gazetteDate}
                onChange={(e) => set("gazetteDate", e.target.value)}
              />
              <Input
                label="Série do Diário da República"
                value={f.gazetteSeries}
                onChange={(e) => set("gazetteSeries", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Ciclos de ensino ministrados"
                  value={f.subTitle ?? ""}
                  onChange={(e) => set("subTitle", e.target.value)}
                />
              </div>
              <Input
                label="Província"
                startIcon="MapPin"
                value={f.province}
                onChange={(e) => set("province", e.target.value)}
              />
              <Input
                label="Município"
                value={f.municipality}
                onChange={(e) => set("municipality", e.target.value)}
              />
              <Input
                label="Distrito urbano / bairro"
                value={f.communeOrDistrict}
                onChange={(e) => set("communeOrDistrict", e.target.value)}
              />
              <Input
                label="NIF da instituição"
                startIcon="Hash"
                value={f.taxNumber}
                error={nifError(f.taxNumber)}
                onChange={(e) => set("taxNumber", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Endereço completo"
                  value={f.fullAddress}
                  onChange={(e) => set("fullAddress", e.target.value)}
                />
              </div>
              <Input
                label="Telefone da secretaria"
                startIcon="Phone"
                value={f.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              <Input
                label="E-mail institucional"
                type="email"
                startIcon="Mail"
                value={f.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <Input
                label="Diretor(a) Geral"
                startIcon="User"
                value={f.directorGeneralName}
                onChange={(e) => set("directorGeneralName", e.target.value)}
              />
              <Input
                label="Diretor(a) Pedagógico(a)"
                startIcon="User"
                value={f.pedagogicDirectorName}
                onChange={(e) => set("pedagogicDirectorName", e.target.value)}
              />
            </div>

            <SheetFooter className="mt-auto flex-row justify-end gap-2 p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => closeModal(MODAL_ID)}
                disabled={save.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!f.schoolName?.trim() || save.isPending}>
                {save.isPending ? "A guardar…" : "Guardar alterações"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <DocumentBrandingSettings />
    </div>
  );
}
