"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Checkbox, FormModal, FormTextarea } from "@/components";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { useHealth } from "@/hooks/school/use-health";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { optionalSafeTextSchema, safeTextSchema } from "@/schemas";

const newClinicVisitSchema = z.object({
  studentId: z.string().trim().min(1, "Seleccione o aluno."),
  reason: safeTextSchema(5, 500, "O motivo do atendimento"),
  treatment: optionalSafeTextSchema(500, 2, "O tratamento / procedimento"),
  guardianNotified: z.boolean(),
});

type NewClinicVisitInput = z.input<typeof newClinicVisitSchema>;
type NewClinicVisitData = z.infer<typeof newClinicVisitSchema>;

export function NewClinicVisitModal() {
  const { students, addVisit } = useHealth();
  const {
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewClinicVisitInput, unknown, NewClinicVisitData>({
    resolver: zodResolver(newClinicVisitSchema),
    mode: "onChange",
    defaultValues: {
      studentId: "",
      reason: "",
      treatment: "",
      guardianNotified: false,
    },
  });

  const studentId = watch("studentId");
  const reason = watch("reason");
  const treatment = watch("treatment") ?? "";
  const notified = watch("guardianNotified");

  const resetDefaults = () => reset({ studentId: "", reason: "", treatment: "", guardianNotified: false });

  const onSubmit = (data: NewClinicVisitData) =>
    addVisit
      .mutateAsync({
        studentId: data.studentId,
        reason: data.reason,
        treatment: data.treatment || undefined,
        guardianNotified: data.guardianNotified,
      })
      .then(() => {
        SucessMessage("Atendimento registado.");
        resetDefaults();
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError);
        ErrorMessage(getApiErrorMessage(err, "Não foi possível registar o atendimento."));
        throw err;
      });

  return (
    <FormModal
      id="health-new-visit"
      title="Novo atendimento na enfermaria"
      submitLabel="Registar"
      isLoading={addVisit.isPending}
      disabled={!isValid || addVisit.isPending}
      onClose={resetDefaults}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="sm:col-span-2">
        <StudentSelect
          label="Aluno *"
          students={students}
          value={studentId}
          onChange={(v) => setValue("studentId", v, { shouldValidate: true, shouldTouch: true })}
          error={errors.studentId?.message}
        />
      </div>
      <div className="sm:col-span-2">
        <FormTextarea
          label="Motivo do atendimento *"
          placeholder="Ex.: Cefaleia intensa, febre repentina, queda no recreio com escoriações..."
          value={reason}
          onChange={(v) => setValue("reason", v, { shouldValidate: true, shouldTouch: true })}
          rows={2}
          maxLength={500}
          error={errors.reason?.message}
        />
      </div>
      <div className="sm:col-span-2">
        <FormTextarea
          label="Tratamento / procedimento realizado"
          placeholder="Ex.: Aferição de temperatura (38.2°C), aplicação de compressa fria e repouso..."
          value={treatment}
          onChange={(v) => setValue("treatment", v, { shouldValidate: true, shouldTouch: true })}
          rows={2}
          maxLength={500}
          error={errors.treatment?.message}
        />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <Checkbox checked={notified} onCheckedChange={(v) => setValue("guardianNotified", Boolean(v), { shouldValidate: true })} />
        Encarregado de educação já foi avisado
      </label>
    </FormModal>
  );
}
