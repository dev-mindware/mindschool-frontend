"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Checkbox, FormModal, FormTextarea } from "@/components";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { useHealth } from "@/hooks/school/use-health";
import { getApiErrorMessage } from "@/utils/api-error";

export function NewClinicVisitModal() {
  const { students, addVisit } = useHealth();
  const [studentId, setStudentId] = useState("");
  const [reason, setReason] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notified, setNotified] = useState(false);

  const submit = () =>
    addVisit
      .mutateAsync({ studentId, reason: reason.trim(), treatment: treatment.trim() || undefined, guardianNotified: notified })
      .then(() => { SucessMessage("Atendimento registado."); setStudentId(""); setReason(""); setTreatment(""); setNotified(false); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível registar o atendimento.")); throw err; });

  return (
    <FormModal id="health-new-visit" title="Novo atendimento na enfermaria" submitLabel="Registar" isLoading={addVisit.isPending} disabled={!studentId || !reason.trim()} onSubmit={submit}>
      <div className="sm:col-span-2"><StudentSelect label="Aluno *" students={students} value={studentId} onChange={setStudentId} /></div>
      <div className="sm:col-span-2">
        <FormTextarea
          label="Motivo do atendimento *"
          placeholder="Ex.: Cefaleia intensa, febre repentina, queda no recreio com escoriações..."
          value={reason}
          onChange={setReason}
          rows={2}
        />
      </div>
      <div className="sm:col-span-2">
        <FormTextarea
          label="Tratamento / procedimento realizado"
          placeholder="Ex.: Aferição de temperatura (38.2°C), aplicação de compressa fria e repouso..."
          value={treatment}
          onChange={setTreatment}
          rows={2}
        />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><Checkbox checked={notified} onCheckedChange={(v) => setNotified(Boolean(v))} />Encarregado de educação já foi avisado</label>
    </FormModal>
  );
}
