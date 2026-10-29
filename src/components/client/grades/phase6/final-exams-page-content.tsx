"use client";

import { formatIsoDay } from "@/utils/format-date";
import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage, InfoMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, Checkbox, ConfirmModal, DataList, EmptyState, FormModal, FormSelect, Icon, Input, StatusLegend, TitleList, type Column } from "@/components";
import { GenericTable } from "@/components/common/generic-table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
type ExamStudentRow = NonNullable<ReturnType<typeof useFinalExam>["exam"]>["students"][number] & { id: string };

function ExamModal({ id }: { id: string | null }) {
  const { exam, enroll, putResults, close } = useFinalExam(id ?? undefined);
  const { open, openModal, closeModal } = useModal();
  const isOpen = Boolean(open["final-exam-detail"]);
  // Motivo comum das ausências justificadas e anulações desta gravação (a API guarda-o como prova).
  const [justification, setJustification] = useState("");
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
      return [{ enrollment_id: s.enrollment_id, status: d.status, justification: d.status === "ausente_justificado" || d.status === "anulado" ? (justification.trim() || "Registado na secretaria") : undefined }];
    });
    if (results.length === 0) return ErrorMessage("Nada para gravar.");
    void putResults.mutateAsync(results).then(() => SucessMessage("Resultados gravados.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));
  };

  const studentRows: ExamStudentRow[] = (exam?.students ?? []).map((s) => ({ ...s, id: s.enrollment_id }));
  const studentColumns: Column<ExamStudentRow>[] = [
    {
      key: "student",
      header: "Estudante",
      render: (_, s) => (
        <div>
          <p className="font-medium">{s.student.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {s.result ? "Inscrito" : s.eligibility?.eligible ? <Badge variant="success">Elegível</Badge> : (s.eligibility?.message ?? "—")}
          </p>
        </div>
      ),
    },
    {
      key: "mfd",
      header: "MFD",
      className: "text-center w-20",
      render: (_, s) => <span className="font-mono">{s.mfd ?? "—"}</span>,
    },
    {
      key: "result",
      header: "Resultado",
      render: (_, s) => {
        const d = drafts[s.enrollment_id];
        if (!s.result || !d) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-2">
            <FormSelect label="" value={d.status} onValueChange={(v) => setDrafts((c) => ({ ...c, [s.enrollment_id]: { ...d, status: v as Draft["status"] } }))} options={RESULT_OPTIONS} disabled={closed} className="flex-1" />
            {d.status === "avaliado" && (
              <div className="w-24">
                <Input label="" type="quantity" min={0} max={20} step={0.1} disabled={closed} value={d.value} onChange={(e) => setDrafts((c) => ({ ...c, [s.enrollment_id]: { ...d, value: e.target.value } }))} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "classification",
      header: "Classificação",
      className: "text-center w-28",
      render: (_, s) => <span className="font-mono font-semibold">{s.effective_classification ?? s.result?.classification ?? "—"}</span>,
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(next) => { if (!next) closeModal("final-exam-detail"); }}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="p-0">
          <SheetTitle>{exam ? `${exam.subject.name} — ${exam.section.class_level} ${exam.section.name} (${CALL_LABEL[exam.call]})` : "Chamada de exame"}</SheetTitle>
          {exam && <SheetDescription>{STATUS_LABEL[exam.status]}</SheetDescription>}
        </SheetHeader>

        {exam && (
          <div className="space-y-4 text-sm">
            {!closed && (
              <p className="text-xs text-muted-foreground">
                «Inscrever todos os elegíveis» inscreve só quem cumpre as regras desta chamada (ver a legenda na página) e pode repetir-se. Os resultados gravam-se antes de encerrar.
              </p>
            )}
            {!closed && (
              <Input label="Motivo das ausências justificadas e anulações (fica registado como prova)" value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Ex.: atestado médico entregue a 12/11" />
            )}
            {!closed && (
              <div className="flex flex-wrap gap-2">
                <Can permission="final_exam:write"><Button size="sm" variant="outline" disabled={enroll.isPending} onClick={() => enroll.mutateAsync(undefined).then((r) => (r.enrolled > 0 ? SucessMessage(`${r.enrolled} aluno(s) inscrito(s).`) : InfoMessage("Nenhum aluno foi inscrito: só se inscreve quem já tem a média final das disciplinas (pautas dos três trimestres fechadas) e cumpre as regras desta chamada."))).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Inscrever todos os elegíveis</Button></Can>
                <Can permission="final_exam:results"><Button size="sm" onClick={save} disabled={putResults.isPending || enrolled.length === 0}>Gravar resultados</Button></Can>
                <Can permission="final_exam:write"><Button size="sm" variant="secondary" disabled={close.isPending} onClick={() => openModal("final-exam-close-confirm")}>Encerrar chamada</Button></Can>
                <ConfirmModal
                  id="final-exam-close-confirm"
                  title="Encerrar a chamada"
                  description="Fecha esta chamada de exame."
                  confirmLabel="Encerrar chamada"
                  irreversible
                  isLoading={close.isPending}
                  effects={[
                    "Os resultados lançados ficam definitivos: já não se inscrevem alunos nem se alteram notas desta chamada.",
                    "A classificação final (MFD e exame, pelos pesos das Políticas) passa a contar na proposta de transição dos alunos.",
                    "Quem faltou sem justificação fica sem classificação nesta chamada.",
                  ]}
                  onConfirm={() => close.mutateAsync().then(() => SucessMessage("Chamada encerrada.")).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; })}
                />
              </div>
            )}
            <GenericTable data={studentRows} columns={studentColumns} />
          </div>
        )}

        <SheetFooter className="p-0 pt-4">
          <Button type="button" variant="outline" onClick={() => closeModal("final-exam-detail")}>Fechar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
    { key: "scheduled_date", header: "Data", render: (_, e) => <span className="font-mono text-xs">{formatIsoDay(e.scheduled_date)}</span> },
    { key: "status", header: "Estado", render: (_, e) => <Badge variant="outline">{STATUS_LABEL[e.status]}</Badge> },
    { key: "action", header: "Ação", render: (_, e) => <ButtonOnlyAction data={e} actions={[{ label: "Abrir chamada", icon: "Eye", onClick: (x) => { setOpenId(x.id); openModal("final-exam-detail"); } }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Exames Finais" suTitle="Registo de exames finais, recurso e melhoria de nota.">
        <Can permission="final_exam:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("final-exam-new")}><Icon name="Plus" className="size-4" />Nova chamada</Button></Can>
      </TitleList>

      <StatusLegend
        title="Quem pode fazer cada chamada"
        items={[
          { label: "1.ª chamada", description: "Alunos com MFD igual ou acima do mínimo de admissão da escola (Políticas › Exames Finais)." },
          { label: "2.ª chamada", description: "Só quem faltou à 1.ª com justificação e ainda não foi avaliado." },
          { label: "Recurso", description: "Alunos que ficaram negativos e ainda têm MFD de admissão; só se a escola o tiver ativado nas Políticas." },
          { label: "Melhoria", description: "Alunos já aprovados que querem subir a nota; só vale se a nota nova for maior. Só se a escola a tiver ativado." },
        ]}
      />

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
