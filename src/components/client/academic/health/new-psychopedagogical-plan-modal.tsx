"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { FormModal, FormSelect, FormTextarea } from "@/components";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { useHealth } from "@/hooks/school/use-health";
import { CASE_CATEGORY_LABEL, type CaseCategory } from "@/services/health-service";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { safeTextSchema } from "@/schemas";

const newPsychoCaseSchema = z.object({
  studentId: z.string().trim().min(1, "Seleccione o aluno."),
  category: z.enum(["aprendizagem", "comportamento", "emocional", "familiar", "outro"]),
  summary: safeTextSchema(10, 2000, "O resumo da situação"),
});

type NewPsychoCaseInput = z.input<typeof newPsychoCaseSchema>;
type NewPsychoCaseData = z.infer<typeof newPsychoCaseSchema>;

export function NewPsychopedagogicalPlanModal() {
  const { students, openCase } = useHealth();
  const {
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewPsychoCaseInput, unknown, NewPsychoCaseData>({
    resolver: zodResolver(newPsychoCaseSchema),
    mode: "onChange",
    defaultValues: {
      studentId: "",
      category: "aprendizagem",
      summary: "",
    },
  });

  const studentId = watch("studentId");
  const category = watch("category");
  const summary = watch("summary");

  const resetDefaults = () => reset({ studentId: "", category: "aprendizagem", summary: "" });

  const onSubmit = (data: NewPsychoCaseData) =>
    openCase
      .mutateAsync({ studentId: data.studentId, category: data.category, summary: data.summary })
      .then(() => {
        SucessMessage("Caso aberto.");
        resetDefaults();
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError);
        ErrorMessage(getApiErrorMessage(err, "Não foi possível abrir o caso."));
        throw err;
      });

  return (
    <FormModal
      id="health-new-case"
      title="Abrir caso psicopedagógico"
      description="Confidencial: só perfis autorizados acedem aos casos."
      submitLabel="Abrir caso"
      isLoading={openCase.isPending}
      disabled={!isValid || openCase.isPending}
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
        <FormSelect
          label="Categoria *"
          value={category}
          onValueChange={(v) => setValue("category", v as CaseCategory, { shouldValidate: true })}
          options={(Object.keys(CASE_CATEGORY_LABEL) as CaseCategory[]).map((c) => ({ value: c, label: CASE_CATEGORY_LABEL[c] }))}
          error={errors.category?.message}
        />
      </div>
      <FormTextarea
        label="Resumo da situação *"
        value={summary}
        onChange={(v) => setValue("summary", v, { shouldValidate: true, shouldTouch: true })}
        rows={4}
        maxLength={2000}
        error={errors.summary?.message}
        placeholder="Descreva o contexto pedagógico, comportamental ou emocional observado no aluno..."
      />
    </FormModal>
  );
}
