"use client";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, Checkbox, DataList, EmptyState, FormModal, FormSelect, Icon, Input, TitleList, type Column } from "@/components";
import { useFinalExam, useFinalExams } from "@/hooks/school/use-phase6";
import { CALL_LABEL, type ExamCall, type ExamResultInput } from "@/services/phase6-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const STATUS_LABEL = { agendado: "Agendado", realizado: "Realizado", encerrado: "Encerrado" } as const;
const RESULT_OPTIONS = [{ value: "avaliado", label: "Avaliado" }, { value: "ausente", label: "Ausente" }, { value: "ausente_justificado", label: "Ausente justificado" }, { value: "anulado", label: "Anulado" }];

function NewExamModal() {
  const { assignments, create } = useFinalExams();
  const [assignmentId, setAssignmentId] = useState("");
  const [call, setCall] = useState<ExamCall>("primeira");
  const [national, setNational] = useState(false);
  const [date, setDate] = useState("");
  const a = assignments.find((x) => x.id === assignmentId);

  return (
    <FormModal id="final-exam-new" title="Nova chamada de exame" submitLabel="Criar chamada" isLoading={create.isPending} disabled={!a || !date} onSubmit={() => (a ? create.mutateAsync({ sectionId: a.sectionId, assignmentId: a.id, call, national, scheduledDate: date }).then(() => SucessMessage("Chamada criada.")).catch(fail) : undefined)}>
      <div className="sm:col-span-2"><FormSelect label="Disciplina e turma *" value={assignmentId} onValueChange={setAssignmentId} options={assignments.map((x) => ({ value: x.id, label: `${x.subjectName} — ${x.sectionName}` }))} /></div>
      <FormSelect label="Chamada" value={call} onValueChange={(v) => setCall(v as ExamCall)} options={(Object.keys(CALL_LABEL) as ExamCall[]).map((c) => ({ value: c, label: CALL_LABEL[c] }))} />
      <Input label="Data *" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><Checkbox checked={national} onCheckedChange={(v) => setNational(Boolean(v))} />Exame nacional</label>
    </FormModal>
  );
}

type Draft = { status: ExamResultInput["status"]; value: string };

function ExamModal({ id }: { id: string | null }) {
  const { exam, enroll, putResults, close } = useFinalExam(id ?? undefined);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    if (!exam) return;
    setDrafts(Object.fromEntries(exam.students.filter((s) => s.result).map((s) => [s.enrollment_id, { status: (s.result!.status === "inscrito" ? "avaliado" : s.result!.status) as Draft["status"], value: s.result!.exam_value?.toString() ?? "" }])));
  }, [exam]);

  const closed = exam?.status === "encerrado";
  const enrolled = exam?.students.filter((s) => s.result && s.result.status !== "anulado") ?? [];

  const save = () => {
    const results: ExamResultInput[] = enrolled.flatMap<ExamResultInput>((s) => {
      const d = drafts[s.enrollment_id];
      if (!d) return [];
      if (d.status === "avaliado") return d.value === "" ? [] : [{ enrollment_id: s.enrollment_id, status: "avaliado" as const, numeric_value: Number(d.value) }];
      return [{ enrollment_id: s.enrollment_id, status: d.status, justification: d.status === "ausente_justificado" || d.status === "anulado" ? "Registado na secretaria" : undefined }];
    });
    if (results.length === 0) return ErrorMessage("Nada para gravar.");
    void putResults.mutateAsync(results).then(() => SucessMessage("Resultados gravados.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));
  };

  return (
    <FormModal id="final-exam-detail" title={exam ? `${exam.subject.name} — ${exam.section.class_level} ${exam.section.name} (${CALL_LABEL[exam.call]})` : "Chamada de exame"} description={exam ? STATUS_LABEL[exam.status] : undefined} size="xl" readOnly onSubmit={() => undefined}>
      {exam && (
        <div className="sm:col-span-2 space-y-4 text-sm">
          {!closed && (
            <div className="flex flex-wrap gap-2">
              <Can permission="final_exam:write"><Button size="sm" variant="outline" disabled={enroll.isPending} onClick={() => enroll.mutateAsync(undefined).then((r) => SucessMessage(`${r.enrolled} aluno(s) inscrito(s).`)).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Inscrever todos os elegíveis</Button></Can>
              <Can permission="final_exam:results"><Button size="sm" onClick={save} disabled={putResults.isPending || enrolled.length === 0}>Gravar resultados</Button></Can>
              <Can permission="final_exam:write"><Button size="sm" variant="secondary" disabled={close.isPending} onClick={() => close.mutateAsync().then(() => SucessMessage("Chamada encerrada.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Encerrar chamada</Button></Can>
            </div>
          )}
          <div className="space-y-2">
            {exam.students.map((s) => {
              const d = drafts[s.enrollment_id];
              return (
                <div key={s.enrollment_id} className="grid items-center gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_90px_1.2fr_100px]">
                  <div><p className="font-medium">{s.student.full_name}</p><p className="text-xs text-muted-foreground">{s.result ? "Inscrito" : s.eligibility?.eligible ? <span className="text-emerald-700">Elegível</span> : (s.eligibility?.message ?? "—")}</p></div>
                  <div className="text-center"><p className="text-[11px] uppercase text-muted-foreground">MFD</p><p className="font-mono">{s.mfd ?? "—"}</p></div>
                  <div>
                    {s.result && d ? (
                      <div className="flex gap-2">
                        <FormSelect label="" value={d.status} onValueChange={(v) => setDrafts((c) => ({ ...c, [s.enrollment_id]: { ...d, status: v as Draft["status"] } }))} options={RESULT_OPTIONS} disabled={closed} className="flex-1" />
                        {d.status === "avaliado" && <div className="w-24"><Input label="" type="quantity" min={0} max={20} step={0.1} disabled={closed} value={d.value} onChange={(e) => setDrafts((c) => ({ ...c, [s.enrollment_id]: { ...d, value: e.target.value } }))} /></div>}
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="text-center"><p className="text-[11px] uppercase text-muted-foreground">Classificação</p><p className="font-mono font-semibold">{s.effective_classification ?? s.result?.classification ?? "—"}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </FormModal>
  );
}

type ExamRow = ReturnType<typeof useFinalExams>["exams"][number];

/** Exames finais e nacionais: chamadas (1.ª, 2.ª, recurso, melhoria), inscrição dos elegíveis pela MFD e lançamento de resultados. */
export function FinalExamsPageContent() {
  const { exams, isLoading, forbidden } = useFinalExams();
  const { openModal } = useModal();
  const [openId, setOpenId] = useState<string | null>(null);

  if (forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não tem acesso aos exames finais." />;

  const columns: Column<ExamRow>[] = [
    { key: "subject.name", header: "Disciplina", render: (_, e) => (<div className="flex items-center gap-2"><span className="font-medium">{e.subject.name}</span>{e.national && <Badge variant="secondary">Nacional</Badge>}</div>) },
    { key: "section", header: "Turma", render: (_, e) => `${e.section.class_level} ${e.section.name}` },
    { key: "call", header: "Chamada", render: (_, e) => CALL_LABEL[e.call] },
    { key: "scheduled_date", header: "Data", render: (_, e) => <span className="font-mono text-xs">{e.scheduled_date}</span> },
    { key: "status", header: "Estado", render: (_, e) => <Badge variant="outline">{STATUS_LABEL[e.status]}</Badge> },
    { key: "action", header: "Acção", render: (_, e) => <ButtonOnlyAction data={e} actions={[{ label: "Abrir chamada", icon: "Eye", onClick: (x) => { setOpenId(x.id); openModal("final-exam-detail"); } }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Exames Finais" suTitle="Chamadas por disciplina e turma; a classificação final substitui a MFD na proposta de transição.">
        <Can permission="final_exam:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("final-exam-new")}><Icon name="Plus" className="size-4" />Nova chamada</Button></Can>
      </TitleList>

      <DataList<ExamRow>
        prefix="exames"
        rows={exams}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por disciplina ou turma"
        searchText={(e) => `${e.subject.name} ${e.section.class_level} ${e.section.name}`}
        filters={[
          { key: "chamada", label: "Chamada", icon: "Tag", options: (Object.keys(CALL_LABEL) as ExamCall[]).map((c) => ({ value: c, label: CALL_LABEL[c] })), match: (e, v) => e.call === v },
          { key: "estado", label: "Estado", icon: "CircleDot", options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })), match: (e, v) => e.status === v },
          { key: "nacional", label: "Âmbito", icon: "Flag", options: [{ value: "nacional", label: "Nacional" }, { value: "escola", label: "Da escola" }], match: (e, v) => (v === "nacional" ? e.national : !e.national) },
        ]}
        dateFilters={[{ key: "data", label: "Data", getDate: (e) => e.scheduled_date }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.scheduled_date.localeCompare(b.scheduled_date) }, { value: "disciplina", label: "Disciplina", compare: (a, b) => a.subject.name.localeCompare(b.subject.name) }]}
        emptyTitle="Sem chamadas"
        emptyDescription="Crie a primeira chamada de exame."
        emptyIcon="GraduationCap"
      />

      <NewExamModal />
      <ExamModal id={openId} />
    </div>
  );
}
