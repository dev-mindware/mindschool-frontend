"use client";
import { formatDate } from "@/utils";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Button,
  ButtonSubmit,
  FormSelect,
  FormTextarea,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { useStudentHealth } from "@/hooks/school/use-health";
import { useModal } from "@/stores/modal/use-modal-store";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { optionalPersonNameSchema, optionalPhoneNumberSchema, optionalSafeTextSchema } from "@/schemas";

const MODAL_ID = "health-profile";
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const healthProfileSchema = z.object({
  blood_type: z.enum(["", ...BLOOD]),
  medications: optionalSafeTextSchema(300, 2, "A medicação habitual"),
  allergies: optionalSafeTextSchema(500, 2, "As alergias"),
  chronic_conditions: optionalSafeTextSchema(500, 2, "As doenças crónicas"),
  emergency_contact_name: optionalPersonNameSchema(3, 150, "O contacto de emergência"),
  emergency_contact_phone: optionalPhoneNumberSchema,
  notes: optionalSafeTextSchema(1000, 2, "As observações clínicas"),
});

type HealthProfileInput = z.input<typeof healthProfileSchema>;
type HealthProfileData = z.infer<typeof healthProfileSchema>;

const EMPTY: HealthProfileInput = {
  blood_type: "",
  allergies: "",
  chronic_conditions: "",
  medications: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

/** Ficha clínica do aluno (grupo sanguíneo, alergias, doenças crónicas, medicação, contacto de emergência). */
export function HealthProfileModal({ studentId }: { studentId: string | null }) {
  const { open, closeModal } = useModal();
  const { data, isLoading, forbidden, save } = useStudentHealth(studentId ?? undefined);
  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<HealthProfileInput, unknown, HealthProfileData>({
    resolver: zodResolver(healthProfileSchema),
    mode: "onChange",
    defaultValues: EMPTY,
  });

  useEffect(() => {
    const r = data?.record;
    const bt = r?.blood_type && BLOOD.includes(r.blood_type as (typeof BLOOD)[number]) ? (r.blood_type as (typeof BLOOD)[number]) : "";
    reset({
      blood_type: bt,
      allergies: r?.allergies ?? "",
      chronic_conditions: r?.chronic_conditions ?? "",
      medications: r?.medications ?? "",
      emergency_contact_name: r?.emergency_contact_name ?? "",
      emergency_contact_phone: r?.emergency_contact_phone ?? "",
      notes: r?.notes ?? "",
    });
  }, [data, studentId, reset]);

  const bloodType = watch("blood_type");
  const allergies = watch("allergies") ?? "";
  const chronicConditions = watch("chronic_conditions") ?? "";
  const notes = watch("notes") ?? "";

  const nul = (v?: string) => (!v || v.trim() === "" ? null : v.trim());
  const onSubmit = (form: HealthProfileData) => {
    save
      .mutateAsync({
        blood_type: nul(form.blood_type),
        allergies: nul(form.allergies),
        chronic_conditions: nul(form.chronic_conditions),
        medications: nul(form.medications),
        emergency_contact_name: nul(form.emergency_contact_name),
        emergency_contact_phone: nul(form.emergency_contact_phone),
        notes: nul(form.notes),
      })
      .then(() => SucessMessage("Ficha clínica guardada."))
      .catch((err) => {
        applyApiFieldErrors(err, setError);
        ErrorMessage(getApiErrorMessage(err, "Não foi possível guardar a ficha."));
      });
  };

  return (
    <Sheet open={Boolean(open[MODAL_ID])} onOpenChange={(next) => !next && closeModal(MODAL_ID)}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader className="p-0">
          <SheetTitle>Ficha clínica</SheetTitle>
          <SheetDescription>
            {forbidden
              ? "O seu perfil não tem acesso às fichas clínicas."
              : isLoading
              ? "A carregar…"
              : "Confidencial: acesso restrito e auditado."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {data && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Grupo sanguíneo"
                value={bloodType}
                onValueChange={(v) => setValue("blood_type", v as HealthProfileInput["blood_type"], { shouldValidate: true, shouldTouch: true })}
                options={BLOOD.map((b) => ({ value: b, label: b }))}
                placeholder="Seleccione o grupo sanguíneo..."
                error={errors.blood_type?.message}
              />
              <Input
                label="Medicação habitual"
                maxLength={300}
                placeholder="Ex.: Paracetamol SOS, Insulina..."
                error={errors.medications?.message}
                {...register("medications")}
              />
              <FormTextarea
                label="Alergias"
                placeholder="Ex.: Penicilina, amendoim, pólen, marisco..."
                value={allergies}
                onChange={(v) => setValue("allergies", v, { shouldValidate: true, shouldTouch: true })}
                rows={2}
                maxLength={500}
                error={errors.allergies?.message}
              />
              <FormTextarea
                label="Doenças crónicas"
                placeholder="Ex.: Asma brônquica, diabetes tipo 1, epilepsia..."
                value={chronicConditions}
                onChange={(v) => setValue("chronic_conditions", v, { shouldValidate: true, shouldTouch: true })}
                rows={2}
                maxLength={500}
                error={errors.chronic_conditions?.message}
              />
              <Input
                label="Contacto de emergência"
                startIcon="User"
                maxLength={150}
                placeholder="Ex.: Maria dos Santos"
                error={errors.emergency_contact_name?.message}
                {...register("emergency_contact_name")}
              />
              <Input
                label="Telefone de emergência"
                startIcon="Phone"
                maxLength={20}
                placeholder="Ex.: +244 923 000 111"
                error={errors.emergency_contact_phone?.message}
                {...register("emergency_contact_phone")}
              />
              <div className="sm:col-span-2">
                <FormTextarea
                  label="Observações clínicas"
                  placeholder="Ex.: Usa óculos graduados; evitar esforços físicos intensos..."
                  value={notes}
                  onChange={(v) => setValue("notes", v, { shouldValidate: true, shouldTouch: true })}
                  rows={2}
                  maxLength={1000}
                  error={errors.notes?.message}
                />
              </div>
              {data.recent_visits.length > 0 && (
                <div className="space-y-1 border-t pt-3 text-sm sm:col-span-2">
                  <p className="font-semibold">Últimos atendimentos</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {data.recent_visits.map((v) => (
                      <li key={v.id}>{formatDate(v.visited_at)} — {v.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => closeModal(MODAL_ID)}>
              {forbidden ? "Fechar" : "Cancelar"}
            </Button>
            {!forbidden && (
              <ButtonSubmit isLoading={save.isPending} disabled={!isValid || save.isPending}>
                Guardar
              </ButtonSubmit>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
