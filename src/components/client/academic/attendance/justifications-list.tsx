"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, DataList, FormModal, Input, type Column } from "@/components";
import { useClassAbsences, useEnrollmentAbsences } from "@/hooks/school/use-absences";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

interface JustificationsListProps {
  classId: string;
}

function AbsencesModal({ enrollmentId, name }: { enrollmentId: string | null; name: string }) {
  const { records, isLoading, justify } = useEnrollmentAbsences(enrollmentId ?? "");
  const [text, setText] = useState<Record<string, string>>({});
  const absences = records.filter((r) => r.status === "falta_injustificada" || r.status === "falta_justificada");

  return (
    <FormModal id="absences-detail" title={`Faltas — ${name}`} description="Converta faltas injustificadas em justificadas, com motivo." size="lg" readOnly onSubmit={() => undefined}>
      <div className="sm:col-span-2 space-y-3 text-sm">
        {isLoading && <p className="text-muted-foreground">A carregar…</p>}
        {!isLoading && absences.length === 0 && <p className="text-muted-foreground">Sem faltas registadas.</p>}
        {absences.map((a) => (
          <div key={a.id} className="grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-[110px_1fr_auto]">
            <div><p className="font-mono text-xs">{a.date}</p>{a.status === "falta_justificada" ? <Badge variant="outline">Justificada</Badge> : <Badge variant="destructive">Injustificada</Badge>}</div>
            {a.status === "falta_justificada" ? <p className="text-muted-foreground">{a.justification}</p> : <Input label="Justificação (mín. 5 caracteres)" value={text[a.id] ?? ""} onChange={(e) => setText((c) => ({ ...c, [a.id]: e.target.value }))} />}
            {a.status !== "falta_justificada" && <Button size="sm" className="h-10" disabled={(text[a.id] ?? "").trim().length < 5 || justify.isPending} onClick={() => justify.mutateAsync({ id: a.id, justification: text[a.id]!.trim() }).then(() => SucessMessage("Falta justificada.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível justificar.")))}>Justificar</Button>}
          </div>
        ))}
      </div>
    </FormModal>
  );
}

/** Justificação de faltas por aluno da turma (secretaria/direcção): converte falta injustificada em justificada, com motivo. */
export function JustificationsList({ classId }: JustificationsListProps) {
  const { data: rows = [], isLoading } = useClassAbsences(classId || undefined);
  const { openModal } = useModal();
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);
  type Row = (typeof rows)[number] & { id: string };
  const data: Row[] = rows.filter((r) => r.unjustified_absences + r.justified_absences > 0).map((r) => ({ ...r, id: r.enrollment_id }));

  const columns: Column<Row>[] = [
    { key: "student.full_name", header: "Aluno", render: (_, r) => <span className="font-medium">{r.student.full_name}</span> },
    { key: "unjustified_absences", header: "Injustificadas", render: (_, r) => <Badge variant={r.unjustified_absences > 0 ? "destructive" : "outline"}>{r.unjustified_absences}</Badge> },
    { key: "justified_absences", header: "Justificadas", render: (_, r) => <Badge variant="outline">{r.justified_absences}</Badge> },
    { key: "action", header: "Ação", render: (_, r) => <ButtonOnlyAction data={r} actions={[{ label: "Ver / justificar faltas", icon: "FileText", onClick: (x) => { setTarget({ id: x.enrollment_id, name: x.student.full_name }); openModal("absences-detail"); } }]} /> },
  ];

  return (
    <>
      <DataList<Row>
        prefix="justificacoes"
        rows={data}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar aluno"
        searchText={(r) => r.student.full_name}
        filters={[{ key: "pendentes", label: "Faltas", icon: "Tag", options: [{ value: "pendentes", label: "Com injustificadas" }, { value: "justificadas", label: "Todas justificadas" }], match: (r, v) => (v === "pendentes" ? r.unjustified_absences > 0 : r.unjustified_absences === 0) }]}
        sorts={[{ value: "injust", label: "Faltas injustificadas", compare: (a, b) => a.unjustified_absences - b.unjustified_absences }, { value: "nome", label: "Nome", compare: (a, b) => a.student.full_name.localeCompare(b.student.full_name) }]}
        emptyTitle="Nenhum aluno com faltas nesta turma"
        emptyIcon="CircleCheck"
      />
      <AbsencesModal enrollmentId={target?.id ?? null} name={target?.name ?? ""} />
    </>
  );
}
