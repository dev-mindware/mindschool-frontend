"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { FormModal, FormSelect, FormTextarea } from "@/components";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { useHealth } from "@/hooks/school/use-health";
import { CASE_CATEGORY_LABEL, type CaseCategory } from "@/services/health-service";
import { getApiErrorMessage } from "@/utils/api-error";

export function NewPsychopedagogicalPlanModal() {
  const { students, openCase } = useHealth();
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState<CaseCategory>("aprendizagem");
  const [summary, setSummary] = useState("");

  const submit = () =>
    openCase
      .mutateAsync({ studentId, category, summary: summary.trim() })
      .then(() => { SucessMessage("Caso aberto."); setStudentId(""); setSummary(""); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível abrir o caso.")); throw err; });

  return (
    <FormModal id="health-new-case" title="Abrir caso psicopedagógico" description="Confidencial: só perfis autorizados acedem aos casos." submitLabel="Abrir caso" isLoading={openCase.isPending} disabled={!studentId || !summary.trim()} onSubmit={submit}>
      <div className="sm:col-span-2"><StudentSelect label="Aluno *" students={students} value={studentId} onChange={setStudentId} /></div>
      <div className="sm:col-span-2"><FormSelect label="Categoria *" value={category} onValueChange={(v) => setCategory(v as CaseCategory)} options={(Object.keys(CASE_CATEGORY_LABEL) as CaseCategory[]).map((c) => ({ value: c, label: CASE_CATEGORY_LABEL[c] }))} /></div>
      <FormTextarea label="Resumo da situação *" value={summary} onChange={setSummary} rows={4} />
    </FormModal>
  );
}
