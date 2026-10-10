"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { FormModal, FormSelect, FormTextarea, Input } from "@/components";
import { useStudents } from "@/hooks/school/use-students";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { REQUEST_TYPE_LABEL, type ApiRequest, type RequestType } from "@/services/secretary-requests-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

export function NewRequestModal({ onSuccess }: { onSuccess?: (r: ApiRequest) => void }) {
  const { create } = useSecretaryRequests();
  const { students } = useStudents("");
  const { openModal } = useModal();
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<RequestType>("declaracao_matricula");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const submit = () =>
    create
      .mutateAsync({ type, subject: subject.trim() || REQUEST_TYPE_LABEL[type], description: description.trim() || undefined, studentId: studentId || undefined })
      .then((req) => { SucessMessage(`Requerimento aberto. Protocolo: ${req.protocol}`); setSubject(""); setDescription(""); setStudentId(""); onSuccess?.(req); setTimeout(() => openModal("request-slip"), 150); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível abrir o requerimento.")); throw err; });

  return (
    <FormModal id="request-new" title="Novo requerimento" description="O requerimento recebe um número de protocolo e um comprovativo imprimível." submitLabel="Abrir requerimento" isLoading={create.isPending} disabled={subject.trim().length < 3} onSubmit={submit}>
      <div className="sm:col-span-2"><StudentSelect label="Aluno (opcional)" students={students} value={studentId} onChange={setStudentId} /></div>
      <div className="sm:col-span-2"><FormSelect label="Serviço solicitado" value={type} onValueChange={(v) => setType(v as RequestType)} options={(Object.keys(REQUEST_TYPE_LABEL) as RequestType[]).map((t) => ({ value: t, label: REQUEST_TYPE_LABEL[t] }))} /></div>
      <div className="sm:col-span-2"><Input label="Assunto / finalidade *" placeholder="Ex: para abertura de conta bancária" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <FormTextarea label="Observações" value={description} onChange={setDescription} rows={3} />
    </FormModal>
  );
}
