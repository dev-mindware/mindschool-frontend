"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, DataList, EmptyState, FormModal, ListSkeleton, Textarea, type Column } from "@/components";
import { useClassAbsences, useEnrollmentAbsences } from "@/hooks/school/use-absences";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formalReasonSchema } from "@/schemas";

const justificationSchema = formalReasonSchema(5, 500, "A justificação");

interface JustificationsListProps {
  classId: string;
}

function AbsencesModal({ enrollmentId, name }: { enrollmentId: string | null; name: string }) {
  const { records, isLoading, justify } = useEnrollmentAbsences(enrollmentId ?? "");
  const [text, setText] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const absences = records.filter((r) => r.status === "falta_injustificada" || r.status === "falta_justificada");

  return (
    <FormModal id="absences-detail" title={`Faltas — ${name}`} description="Converta faltas injustificadas em justificadas, com motivo." size="lg" readOnly onSubmit={() => undefined}>
      <div className="sm:col-span-2 space-y-3 text-sm">
        {isLoading && <ListSkeleton rows={3} cols={3} />}
        {!isLoading && absences.length === 0 && (
          <EmptyState
            icon="CircleCheck"
            title="Sem faltas registadas"
            description="Este aluno não possui faltas pendentes ou justificadas no sistema."
          />
        )}
        {absences.map((a) => {
          const raw = text[a.id] ?? "";
          const parsed = justificationSchema.safeParse({ reason: raw });
          const errorMsg = touched[a.id] && !parsed.success ? parsed.error.issues[0]?.message : undefined;
          return (
            <div key={a.id} className="grid items-end gap-3 rounded-xs border p-3 sm:grid-cols-[110px_1fr_auto]">
              <div><p className="font-mono text-xs">{a.date}</p>{a.status === "falta_justificada" ? <Badge variant="outline">Justificada</Badge> : <Badge variant="destructive">Injustificada</Badge>}</div>
              {a.status === "falta_justificada" ? (
                <p className="text-muted-foreground">{a.justification}</p>
              ) : (
                <Textarea
                  label="Justificação (mín. 5 caracteres) *"
                  placeholder="Ex.: Atestado médico hospitalar ou motivo de saúde devidamente comprovado..."
                  rows={2}
                  maxLength={500}
                  value={raw}
                  error={errorMsg}
                  onChange={(e) => {
                    const val = e.target.value;
                    setText((c) => ({ ...c, [a.id]: val }));
                    setTouched((t) => ({ ...t, [a.id]: true }));
                  }}
                />
              )}
              {a.status !== "falta_justificada" && (
                <Button
                  size="sm"
                  className="h-10"
                  disabled={!parsed.success || justify.isPending}
                  onClick={() => {
                    if (!parsed.success) {
                      setTouched((t) => ({ ...t, [a.id]: true }));
                      return;
                    }
                    justify
                      .mutateAsync({ id: a.id, justification: parsed.data.reason })
                      .then(() => {
                        SucessMessage("Falta justificada.");
                        setText((c) => {
                          const next = { ...c };
                          delete next[a.id];
                          return next;
                        });
                        setTouched((t) => {
                          const next = { ...t };
                          delete next[a.id];
                          return next;
                        });
                      })
                      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível justificar.")));
                  }}
                >
                  Justificar
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </FormModal>
  );
}

/** Justificação de faltas por aluno da turma (secretaria/direcção): converte falta injustificada em justificada, com motivo. */
export function JustificationsList({ classId }: JustificationsListProps) {
  const { data: rows = [], isLoading, isError, error } = useClassAbsences(classId || undefined);
  const { openModal } = useModal();
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);
  const isForbidden = (error as any)?.response?.status === 403;

  if (isForbidden) {
    return (
      <div className="rounded-xs border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <p className="text-sm font-semibold text-foreground">Sem permissão para justificar faltas</p>
        <p className="mt-1 text-xs text-muted-foreground">
          A justificação de faltas está reservada ao director de turma e à secretaria da escola.
        </p>
      </div>
    );
  }
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
        prefix="justifications"
        rows={data}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar aluno"
        searchText={(r) => r.student.full_name}
        filters={[{ key: "pending", label: "Faltas", icon: "Tag", options: [{ value: "pending", label: "Com injustificadas" }, { value: "justified", label: "Todas justificadas" }], match: (r, v) => (v === "pending" ? r.unjustified_absences > 0 : r.unjustified_absences === 0) }]}
        sorts={[{ value: "unjustified", label: "Faltas injustificadas", compare: (a, b) => a.unjustified_absences - b.unjustified_absences }, { value: "name", label: "Nome", compare: (a, b) => a.student.full_name.localeCompare(b.student.full_name) }]}
        emptyTitle="Nenhum aluno com faltas nesta turma"
        emptyIcon="CircleCheck"
      />
      <AbsencesModal enrollmentId={target?.id ?? null} name={target?.name ?? ""} />
    </>
  );
}
