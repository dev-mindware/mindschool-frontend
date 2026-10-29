"use client";

import { formatDateTime } from "@/utils";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Can,
  Badge,
  Button,
  ButtonOnlyAction,
  DataList,
  EXCEL_ACCEPT,
  FileUpload,
  FormSelect,
  GenericTable,
  Icon,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  TitleList,
  type Column,
} from "@/components";
import { useImports } from "@/hooks/school/use-admin-school";
import { useExamTargets } from "@/hooks/school/use-online-exams";
import {
  adminSchoolService,
  describeImportResult,
  type ApiImportJob,
  type ImportKind,
} from "@/services/admin-school-service";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { readExcelAsCsv, downloadCsvAsExcel } from "@/utils/excel-import";

const SUMMARY_LABEL: Record<string, string> = {
  total: "Linhas",
  new: "Novas",
  existing: "Já existentes",
  duplicates_in_file: "Duplicadas no ficheiro",
  conflicts: "Em conflito",
  invalid: "Inválidas",
  warnings: "Com avisos",
};

const ROW_STATUS_LABEL: Record<string, string> = {
  new: "Nova",
  existing: "Já existe",
  duplicate_in_file: "Duplicada no ficheiro",
  conflict: "Em conflito",
  invalid: "Inválida",
};

const KIND_LABEL: Record<ImportKind, string> = {
  students: "Alunos e Encarregados de Educação",
  enrollments: "Matrículas & Inscrições",
  grades: "Classificações e Notas da Avaliação",
};

const WIZARD_MODAL_ID = "imports-wizard";

type PreviewRow = {
  id: string;
  line: number;
  status: string;
  errors?: Array<{ field: string; message: string }>;
};

/** Assistente de importação 100% Excel (.xlsx): validar sem gravar, rever grelha e confirmar. */
function ImportWizardModal() {
  const { open, closeModal } = useModal();
  const [kind, setKind] = useState<ImportKind>("students");
  const { validate, commit } = useImports(kind);
  const [job, setJob] = useState<ApiImportJob | null>(null);
  const [file, setFile] = useState<{ name: string; csv: string; rowCount?: number } | null>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const [assignmentId, setAssignmentId] = useState("");
  const [termId, setTermId] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const { assignments, terms } = useExamTargets();
  const assignment = assignments.find((a) => a.id === assignmentId);
  const term = termId || terms[0]?.id || "";

  const isSheetOpen = Boolean(open[WIZARD_MODAL_ID]);

  const assessments = useQuery({
    queryKey: ["import-assessments", assignmentId, term],
    queryFn: async () =>
      (
        await api.get<{ data: Array<{ id: string; type: string; date: string }> }>(
          `/s/sections/${assignment!.sectionId}/subjects/${assignment!.id}/assessments`,
          { params: { term_id: term } }
        )
      ).data.data,
    enabled: kind === "grades" && Boolean(assignment && term),
  });

  const reset = (k: ImportKind) => {
    setKind(k);
    setJob(null);
    setFile(null);
    setPicked(null);
  };

  const handleValidate = (e: FormEvent) => {
    e.preventDefault();
    if (!file || (kind === "grades" && !assessmentId) || validate.isPending) return;
    void validate
      .mutateAsync({
        csv: file.csv,
        filename: file.name,
        assessmentId: kind === "grades" ? assessmentId : undefined,
      })
      .then(setJob)
      .catch((err) => {
        ErrorMessage(getApiErrorMessage(err, "O ficheiro Excel foi recusado."));
      });
  };

  const doCommit = (policy: "all_or_nothing" | "valid_rows_only") =>
    job
      ? commit
          .mutateAsync({ id: job.id, policy })
          .then((j) => {
            setJob(j);
            SucessMessage("Importação concluída com sucesso.");
          })
          .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível confirmar.")))
      : undefined;

  const previewRows: PreviewRow[] = (job?.preview ?? []).map((r) => ({
    id: String(r.line),
    line: r.line,
    status: r.status,
    errors: r.errors,
  }));

  const previewColumns: Column<PreviewRow>[] = [
    {
      key: "line",
      header: "Linha",
      render: (_, r) => <span className="font-mono text-xs font-semibold">Linha {r.line}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, r) => <span className="text-xs">{ROW_STATUS_LABEL[r.status] ?? r.status}</span>,
    },
    {
      key: "errors",
      header: "Observações",
      render: (_, r) => (
        <span className="text-xs text-destructive font-medium">
          {(r.errors ?? []).map((e) => `${e.field}: ${e.message}`).join("; ") || "—"}
        </span>
      ),
    },
  ];

  return (
    <Sheet open={isSheetOpen} onOpenChange={(v) => !v && closeModal(WIZARD_MODAL_ID)}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="p-0">
          <SheetTitle>Nova Importação de Dados (Excel)</SheetTitle>
          <SheetDescription>
            Escolha a categoria, descarregue o modelo Excel, preencha os dados e valide. Nada é gravado na escola até à sua confirmação final.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleValidate} className="flex flex-1 flex-col gap-6">
          <div className="grid grid-cols-1 gap-3.5">
            <FormSelect
              label="Tipo de Importação"
              value={kind}
              onValueChange={(v) => reset(v as ImportKind)}
              options={(Object.keys(KIND_LABEL) as ImportKind[]).map((k) => ({
                value: k,
                label: KIND_LABEL[k],
              }))}
            />

            <div className="flex items-center justify-between rounded-xs border border-border/50 bg-muted/20 p-3">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Folha de Cálculo Modelo (.xlsx)</p>
                <p className="text-[11px] text-muted-foreground">
                  Utilize o modelo oficial formatado com as colunas esperadas pelo sistema.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 h-8 text-xs shrink-0"
                onClick={() =>
                  adminSchoolService
                    .templateCsv(kind)
                    .then((t) => downloadCsvAsExcel(`modelo-${kind}.xlsx`, `Modelo ${KIND_LABEL[kind]}`, t))
                    .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível obter o modelo.")))
                }
              >
                <Icon name="FileSpreadsheet" className="size-4 text-emerald-600" />
                Descarregar Modelo Excel (.xlsx)
              </Button>
            </div>

            {kind === "grades" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  label="Disciplina e Turma"
                  value={assignmentId}
                  onValueChange={(v) => {
                    setAssignmentId(v);
                    setAssessmentId("");
                  }}
                  options={assignments.map((a) => ({
                    value: a.id,
                    label: `${a.subjectName} — ${a.sectionName}`,
                  }))}
                />
                <FormSelect
                  label="Trimestre / Período"
                  value={term}
                  onValueChange={(v) => {
                    setTermId(v);
                    setAssessmentId("");
                  }}
                  options={terms.map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` }))}
                />
                <FormSelect
                  label="Avaliação Formal"
                  value={assessmentId}
                  onValueChange={setAssessmentId}
                  options={(assessments.data ?? []).map((a) => ({
                    value: a.id,
                    label: `${a.type} (${a.date})`,
                  }))}
                  className="sm:col-span-2"
                />
              </div>
            )}

            <FileUpload
              value={picked}
              onChange={(f) => {
                setPicked(f);
                setJob(null);
                if (f) {
                  readExcelAsCsv(f)
                    .then(({ csv, rowCount }) => {
                      setFile({ name: f.name, csv, rowCount });
                    })
                    .catch((err) => {
                      ErrorMessage(err instanceof Error ? err.message : "Erro ao ler ficheiro Excel.");
                      setFile(null);
                    });
                } else {
                  setFile(null);
                }
              }}
              accept={EXCEL_ACCEPT}
              label="Ficheiro Excel (.xlsx / .xls) *"
              hint="Formatos suportados: .XLSX, .XLS · máximo 10 MB"
            />

            {file && file.rowCount !== undefined && (
              <p className="text-xs text-muted-foreground font-mono">
                Folha de cálculo carregada: <strong>{file.name}</strong> ({file.rowCount} linhas de dados detectadas).
              </p>
            )}

            {job && (
              <div className="space-y-3 text-xs rounded-xs border p-3 bg-card">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{STATUS_LABEL[job.status] ?? job.status}</Badge>
                  {Object.entries(job.summary ?? {}).map(([k, v]) => (
                    <Badge key={k} variant="secondary">
                      {SUMMARY_LABEL[k] ?? k}: {String(v)}
                    </Badge>
                  ))}
                </div>
                {job.status !== "committed" && (
                  <p className="text-muted-foreground">
                    Nada foi gravado ainda: isto é só a validação. Linhas «novas» serão criadas; as «já existentes» e os duplicados no ficheiro não são gravados nem atualizados.
                  </p>
                )}

                {job.result && (
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {describeImportResult(job.result)}
                  </p>
                )}

                {previewRows.length > 0 && (
                  <div className="max-h-60 overflow-auto">
                    <GenericTable<PreviewRow> data={previewRows} columns={previewColumns} />
                  </div>
                )}

                {job.status !== "committed" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      disabled={commit.isPending}
                      onClick={() => void doCommit("all_or_nothing")}
                      className="h-8 text-xs"
                    >
                      Confirmar tudo ou nada
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={commit.isPending}
                      onClick={() => void doCommit("valid_rows_only")}
                      className="h-8 text-xs"
                    >
                      Gravar só as linhas válidas
                    </Button>
                  </div>
                )}
                {job.status !== "committed" && (
                  <p className="text-[11px] text-muted-foreground">
                    <strong>Tudo ou nada:</strong> só grava se todas as linhas estiverem correctas (há um limite de linhas por tipo; acima dele use «só as válidas»). <strong>Só as válidas:</strong> grava as correctas e deixa as com erro, que pode descarregar para corrigir e reenviar.
                  </p>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    adminSchoolService
                      .errorsCsv(kind, job.id)
                      .then((t) =>
                        downloadCsvAsExcel(
                          `rejeicoes-${kind}.xlsx`,
                          "Linhas Rejeitadas",
                          t
                        )
                      )
                      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem rejeições registadas.")))
                  }
                >
                  <Icon name="Download" className="size-3.5" />
                  Descarregar Relatório de Rejeições (Excel .xlsx)
                </Button>
              </div>
            )}
          </div>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 p-0">
            <Button type="button" variant="outline" onClick={() => closeModal(WIZARD_MODAL_ID)}>
              Fechar
            </Button>
            <Button
              type="submit"
              disabled={!file || (kind === "grades" && !assessmentId) || validate.isPending}
            >
              {validate.isPending ? "A validar…" : "Validar Ficheiro Excel"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

const STATUS_LABEL: Record<string, string> = {
  validated: "Validada",
  committed: "Concluída",
  rejected: "Rejeitada",
  failed: "Falhada",
};

/** Histórico e assistente de importações 100% em folha de cálculo Excel (.xlsx). */
export function ImportsPageContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { openModal } = useModal();
  const jobs = useQuery({
    queryKey: ["import-jobs", schoolId],
    queryFn: adminSchoolService.jobs,
    enabled: Boolean(schoolId),
    staleTime: 15 * 1000,
  });

  const columns: Column<ApiImportJob>[] = [
    {
      key: "created_at",
      header: "Data",
      render: (_, j) => <span className="font-mono text-xs">{formatDateTime(j.created_at)}</span>,
    },
    {
      key: "policy",
      header: "Política",
      render: (_, j) => (
        <span className="text-xs">
          {j.policy === "all_or_nothing" ? "Tudo ou nada" : "Apenas linhas válidas"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, j) => (
        <Badge variant={j.status === "committed" ? "outline" : "secondary"}>
          {STATUS_LABEL[j.status] ?? j.status}
        </Badge>
      ),
    },
    {
      key: "summary",
      header: "Linhas Processadas",
      render: (_, j) => (
        <span className="text-xs">
          {Object.entries(j.summary ?? {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "result",
      header: "Resultado",
      render: (_, j) =>
        j.result ? (
          <span className="text-xs font-medium">
            {describeImportResult(j.result)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "action",
      header: "Ação",
      render: (_, j) => (
        <ButtonOnlyAction
          data={j}
          actions={[
            {
              label: "Descarregar rejeições (Excel)",
              icon: "FileSpreadsheet",
              onClick: (x) =>
                void adminSchoolService
                  .errorsCsv("students", x.id)
                  .then((t) =>
                    downloadCsvAsExcel(`rejeicoes-job-${x.id.slice(0, 8)}.xlsx`, "Rejeições", t)
                  )
                  .catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem rejeições registadas."))),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Importação de Dados (Excel)"
        suTitle="Importação em massa de alunos, professores e matrículas."
      >
        <Can permission="import:write">
          <Button size="sm" className="gap-2 h-9 text-xs font-semibold" onClick={() => openModal(WIZARD_MODAL_ID)}>
            <Icon name="FileSpreadsheet" className="size-4" />
            Nova Importação (Excel)
          </Button>
        </Can>
      </TitleList>

      <DataList<ApiImportJob>
        prefix="importacoes"
        rows={jobs.data ?? []}
        columns={columns}
        isLoading={jobs.isLoading}
        isError={jobs.isError}
        refetch={() => void jobs.refetch()}
        filters={[
          {
            key: "estado",
            label: "Estado",
            icon: "Tag",
            options: Object.entries(STATUS_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
            match: (j, v) => j.status === v,
          },
          {
            key: "politica",
            label: "Política",
            icon: "ShieldCheck",
            options: [
              { value: "all_or_nothing", label: "Tudo ou nada" },
              { value: "valid_rows_only", label: "Apenas linhas válidas" },
            ],
            match: (j, v) => j.policy === v,
          },
        ]}
        dateFilters={[{ key: "data", label: "Importado", getDate: (j) => j.created_at }]}
        sorts={[
          {
            value: "data",
            label: "Data",
            compare: (a, b) => a.created_at.localeCompare(b.created_at),
          },
        ]}
        emptyTitle="Sem importações registadas"
        emptyDescription="Utilize «Nova Importação (Excel)» para carregar ficheiros .xlsx de estudantes, matrículas ou notas."
        emptyIcon="FileSpreadsheet"
      />

      <ImportWizardModal />
    </div>
  );
}
