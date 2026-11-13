"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Textarea,
  TitleList,
} from "@/components";
import { useSchoolSettingsStore } from "@/stores/school";
import { useModal } from "@/stores/modal/use-modal-store";
import { useSchoolProfile } from "@/hooks/school/use-school-profile";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { formatPhone } from "@/utils/format-phone";
import {
  schoolInstitutionalSettingsSchema,
  type SchoolInstitutionalSettingsFormData,
} from "@/schemas";
import { DocumentBrandingSettings } from "./document-branding-settings";
import type { z } from "zod";

type InstitutionalInput = z.input<typeof schoolInstitutionalSettingsSchema>;

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
  const isSheetOpen = Boolean(open[MODAL_ID]);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setError,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<InstitutionalInput, unknown, SchoolInstitutionalSettingsFormData>({
    resolver: zodResolver(schoolInstitutionalSettingsSchema),
    mode: "onChange",
    defaultValues: profile,
  });

  useEffect(() => {
    if (isSheetOpen) {
      reset({
        schoolName: profile.schoolName ?? "",
        medRegistrationCode: profile.medRegistrationCode ?? "",
        decreeNumber: profile.decreeNumber ?? "",
        gazetteDate: profile.gazetteDate ?? "",
        gazetteSeries: profile.gazetteSeries ?? "",
        subTitle: profile.subTitle ?? "",
        province: profile.province ?? "",
        municipality: profile.municipality ?? "",
        communeOrDistrict: profile.communeOrDistrict ?? "",
        fullAddress: profile.fullAddress ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        directorGeneralName: profile.directorGeneralName ?? "",
        pedagogicDirectorName: profile.pedagogicDirectorName ?? "",
      });
      void trigger();
    }
  }, [profile, isSheetOpen, reset, trigger]);

  const onSubmit = async (data: SchoolInstitutionalSettingsFormData) => {
    if (save.isPending) return;
    const merged = { ...profile, ...data };
    try {
      await save.mutateAsync(merged);
      updateProfile(merged);
      SucessMessage("Dados institucionais atualizados.");
      closeModal(MODAL_ID);
    } catch (err) {
      applyApiFieldErrors(err, setError, {
        name: "schoolName",
        med_code: "medRegistrationCode",
        address: "fullAddress",
      });
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
            onClick={() => openModal(MODAL_ID)}
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

          <form onSubmit={rhfHandleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Nome oficial da instituição *"
                  startIcon="School"
                  placeholder="Ex.: Colégio Esperança do Saber"
                  error={errors.schoolName?.message}
                  {...register("schoolName")}
                />
              </div>
              <Input
                label="Código de entidade MED"
                placeholder="Ex.: MED-2026-00123"
                error={errors.medRegistrationCode?.message}
                {...register("medRegistrationCode")}
              />
              <Input
                label="Decreto executivo de criação"
                placeholder="Ex.: Decreto Executivo n.º 45/21"
                error={errors.decreeNumber?.message}
                {...register("decreeNumber")}
              />
              <Input
                label="Data do Diário da República"
                placeholder="Ex.: 15 de Março de 2021"
                error={errors.gazetteDate?.message}
                {...register("gazetteDate")}
              />
              <Input
                label="Série do Diário da República"
                placeholder="Ex.: I Série, n.º 42"
                error={errors.gazetteSeries?.message}
                {...register("gazetteSeries")}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Ciclos de ensino ministrados"
                  placeholder="Ex.: Ensino Primário e I/II Ciclos do Ensino Secundário Geral"
                  error={errors.subTitle?.message}
                  {...register("subTitle")}
                />
              </div>
              <Input
                label="Província"
                startIcon="MapPin"
                placeholder="Ex.: Luanda"
                error={errors.province?.message}
                {...register("province")}
              />
              <Input
                label="Município"
                placeholder="Ex.: Belas"
                error={errors.municipality?.message}
                {...register("municipality")}
              />
              <Input
                label="Distrito urbano / bairro"
                placeholder="Ex.: Kilamba / Quenguela"
                error={errors.communeOrDistrict?.message}
                {...register("communeOrDistrict")}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Endereço completo"
                  rows={2}
                  placeholder="Ex.: Rua Comandante Gika, Bairro Alvalade, Luanda, Angola"
                  error={errors.fullAddress?.message}
                  {...register("fullAddress")}
                />
              </div>
              <Input
                label="Telefone da secretaria"
                type="tel"
                startIcon="Phone"
                placeholder="Ex.: +244 923 000 111"
                error={errors.phone?.message}
                {...register("phone", {
                  onChange: (e) => {
                    e.target.value = formatPhone(e.target.value);
                  },
                })}
              />
              <Input
                label="E-mail institucional"
                type="email"
                startIcon="Mail"
                placeholder="Ex.: secretaria@escola.ao"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Diretor(a) Geral"
                startIcon="User"
                placeholder="Ex.: Dr. Manuel Bento"
                error={errors.directorGeneralName?.message}
                {...register("directorGeneralName")}
              />
              <Input
                label="Diretor(a) Pedagógico(a)"
                startIcon="User"
                placeholder="Ex.: Prof.ª Ana Paula Silva"
                error={errors.pedagogicDirectorName?.message}
                {...register("pedagogicDirectorName")}
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
              <Button type="submit" disabled={!isValid || save.isPending}>
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
