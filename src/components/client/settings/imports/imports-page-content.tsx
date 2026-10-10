"use client";
import { formatDateTime } from "@/utils";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, DataList, CSV_ACCEPT, FileUpload, FormModal, FormSelect, Icon, TitleList, type Column } from "@/components";
import { useImports } from "@/hooks/school/use-admin-school";
import { useExamTargets } from "@/hooks/school/use-online-exams";
import { adminSchoolService, type ApiImportJob, type ImportKind } from "@/services/admin-school-service";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const KIND_LABEL: Record<ImportKind, string> = { students: "Alunos e encarregados", enrollments: "Matrículas", grades: "Notas de uma avaliação" };

const save = (name: string, text: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};

/** Assistente de importação (CSV em duas fases): validar sem gravar, rever e só depois confirmar. */
function ImportWizardModal() {
  const [kind, setKind] = useState<ImportKind>("students");
  const { validate, commit } = useImports(kind);
  const [job, setJob] = useState<ApiImportJob | null>(null);
  const [file, setFile] = useState<{ name: string; csv: string } | null>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const [assignmentId, setAssignmentId] = useState("");
  const [termId, setTermId] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const { assignments, terms } = useExamTargets();
  const assignment = assignments.find((a) => a.id === assignmentId);
  const term = termId || terms[0]?.id || "";

  const assessments = useQuery({
    queryKey: ["import-assessments", assignmentId, term],
    queryFn: async () => (await api.get<{ data: Array<{ id: string; type: string; date: string }> }>(`/s/sections/${assignment!.sectionId}/subjects/${assignment!.id}/assessments`, { params: { term_id: term } })).data.data,
    enabled: kind === "grades" && Boolean(assignment && term),
  });

  const reset = (k: ImportKind) => { setKind(k); setJob(null); setFile(null); setPicked(null); };
  const doValidate = () => (file ? validate.mutateAsync({ csv: file.csv, filename: file.name, assessmentId: kind === "grades" ? assessmentId : undefined }).then(setJob).catch((e) => { ErrorMessage(getApiErrorMessage(e, "O ficheiro foi recusado.")); throw e; }) : undefined);
  const doCommit = (policy: "all_or_nothing" | "valid_rows_only") => (job ? commit.mutateAsync({ id: job.id, policy }).then((j) => { setJob(j); SucessMessage("Importação concluída."); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível confirmar."))) : undefined);

  return (
    <FormModal id="imports-wizard" title="Nova importação" description="Escolha o tipo, carregue o CSV e valide. Nada é gravado até confirmar." size="lg" keepOpen submitLabel="Validar ficheiro" isLoading={validate.isPending} disabled={!file || (kind === "grades" && !assessmentId)} onSubmit={doValidate}>
      <FormSelect label="Tipo de importação" value={kind} onValueChange={(v) => reset(v as ImportKind)} options={(Object.keys(KIND_LABEL) as ImportKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
      <div className="flex items-end">
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => adminSchoolService.templateCsv(kind).then((t) => save(`modelo-${kind}.csv`, t)).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem modelo.")))}>
          <Icon name="Download" className="size-4" />Descarregar modelo CSV
        </Button>
      </div>

      {kind === "grades" && (
        <>
          <FormSelect label="Disciplina e turma" value={assignmentId} onValueChange={(v) => { setAssignmentId(v); setAssessmentId(""); }} options={assignments.map((a) => ({ value: a.id, label: `${a.subjectName} — ${a.sectionName}` }))} />
          <FormSelect label="Período" value={term} onValueChange={(v) => { setTermId(v); setAssessmentId(""); }} options={terms.map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` }))} />
          <FormSelect label="Avaliação" value={assessmentId} onValueChange={setAssessmentId} options={(assessments.data ?? []).map((a) => ({ value: a.id, label: `${a.type} (${a.date})` }))} className="sm:col-span-2" />
        </>
      )}

      <FileUpload
        className="sm:col-span-2"
        value={picked}
        onChange={(f) => { setPicked(f); setJob(null); if (f) void f.text().then((csv) => setFile({ name: f.name, csv })); else setFile(null); }}
        accept={CSV_ACCEPT}
        label="Ficheiro CSV *"
      />

      {job && (
        <div className="sm:col-span-2 space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{job.status}</Badge>
            {Object.entries(job.summary ?? {}).map(([k, v]) => <Badge key={k} variant="secondary">{k}: {String(v)}</Badge>)}
          </div>
          {job.result && <p className="font-medium text-emerald-700">Criados {job.result.created} • actualizados {job.result.updated} • ignorados {job.result.ignored} • falhados {job.result.failed}</p>}
          {job.preview && job.preview.length > 0 && (
            <div className="max-h-56 space-y-1 overflow-auto rounded-lg border p-2">
              {job.preview.map((r) => (
                <div key={r.line} className="flex gap-3 border-b py-1 last:border-0"><span className="font-mono">L{r.line}</span><span>{r.status}</span><span className="text-destructive">{(r.errors ?? []).map((e) => `${e.field}: ${e.message}`).join("; ")}</span></div>
              ))}
            </div>
          )}
          {job.status !== "committed" && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={commit.isPending} onClick={() => void doCommit("all_or_nothing")}>Confirmar (tudo ou nada)</Button>
              <Button type="button" size="sm" variant="outline" disabled={commit.isPending} onClick={() => void doCommit("valid_rows_only")}>Confirmar só as linhas válidas</Button>
            </div>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={() => adminSchoolService.errorsCsv(kind, job.id).then((t) => save("rejeicoes.csv", t)).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem rejeições.")))}>Descarregar rejeições (CSV)</Button>
        </div>
      )}
    </FormModal>
  );
}

const STATUS_LABEL: Record<string, string> = { validated: "Validada", committed: "Concluída", rejected: "Rejeitada", failed: "Falhada" };

/** Importações da escola: histórico de ficheiros processados e assistente para uma nova importação. */
export function ImportsPageContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { openModal } = useModal();
  const jobs = useQuery({ queryKey: ["import-jobs", schoolId], queryFn: adminSchoolService.jobs, enabled: Boolean(schoolId), staleTime: 15 * 1000 });

  const columns: Column<ApiImportJob>[] = [
    { key: "created_at", header: "Data", render: (_, j) => <span className="font-mono text-xs">{formatDateTime(j.created_at)}</span> },
    { key: "policy", header: "Política", render: (_, j) => <span className="text-xs">{j.policy === "all_or_nothing" ? "Tudo ou nada" : "Só linhas válidas"}</span> },
    { key: "status", header: "Estado", render: (_, j) => <Badge variant={j.status === "committed" ? "outline" : "secondary"}>{STATUS_LABEL[j.status] ?? j.status}</Badge> },
    { key: "summary", header: "Linhas", render: (_, j) => <span className="text-xs">{Object.entries(j.summary ?? {}).map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}</span> },
    { key: "result", header: "Resultado", render: (_, j) => (j.result ? <span className="text-xs">{j.result.created} criados · {j.result.updated} actualizados · {j.result.failed} falhados</span> : "—") },
    { key: "action", header: "Acção", render: (_, j) => <ButtonOnlyAction data={j} actions={[{ label: "Descarregar rejeições", icon: "Download", onClick: (x) => void adminSchoolService.errorsCsv("students", x.id).then((t) => save("rejeicoes.csv", t)).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem rejeições."))) }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Importação de Dados" suTitle="Carregue um CSV, reveja a validação e só depois confirme. Cada importação fica registada e auditada.">
        <Can permission="import:write"><Button size="sm" className="gap-2" onClick={() => openModal("imports-wizard")}><Icon name="Upload" className="size-4" />Nova importação</Button></Can>
      </TitleList>

      <DataList<ApiImportJob>
        prefix="importacoes"
        rows={jobs.data ?? []}
        columns={columns}
        isLoading={jobs.isLoading}
        isError={jobs.isError}
        refetch={() => void jobs.refetch()}
        filters={[
          { key: "estado", label: "Estado", icon: "Tag", options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })), match: (j, v) => j.status === v },
          { key: "politica", label: "Política", icon: "ShieldCheck", options: [{ value: "all_or_nothing", label: "Tudo ou nada" }, { value: "valid_rows_only", label: "Só linhas válidas" }], match: (j, v) => j.policy === v },
        ]}
        dateFilters={[{ key: "data", label: "Importado", getDate: (j) => j.created_at }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }]}
        emptyTitle="Sem importações"
        emptyDescription="Use «Nova importação» para carregar alunos, matrículas ou notas."
        emptyIcon="Upload"
      />

      <ImportWizardModal />
    </div>
  );
}
