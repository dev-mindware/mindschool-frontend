"use client";

import React, { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { formatDateTime } from "@/utils";
import { AssessmentTerm, ConsolidatedStudentRow } from "@/types/grade";
import { usePautas } from "@/hooks/school/use-pautas";
import { useTeachingScope } from "@/hooks/school/use-teaching-scope";
import { Button, EmptyState, FeatureGate, Icon, TitleList } from "@/components";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { Badge } from "@/components/ui/badge";
import { LockPautaModal } from "./lock-pauta-modal";
import { ReopenPautaModal } from "./reopen-pauta-modal";
import { PautaExportModal } from "./pauta-export-modal";

const TERM_LABEL: Record<AssessmentTerm, string> = {
  TRIMESTER_1: "1.º Trimestre",
  TRIMESTER_2: "2.º Trimestre",
  TRIMESTER_3: "3.º Trimestre",
};

type PautaStudentRow = ConsolidatedStudentRow & { id: string; index: number };

/** Pauta consolidada de uma turma: matriz alunos × disciplinas, homologação e reabertura. */
export function ConsolidatedPautaPageContent() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const termParam = useSearchParams().get("term");
  const term: AssessmentTerm = termParam && termParam in TERM_LABEL ? (termParam as AssessmentTerm) : "TRIMESTER_2";

  const { isTeacher, canAccessSection, myAssignments, isLoading: isScopeLoading } = useTeachingScope();
  const { pautas, isLoading } = usePautas(term, [sectionId]);
  const pauta = pautas[0];

  const [isLockOpen, setIsLockOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Disciplinas da turma com indicação visual para as disciplinas do docente
  const displaySubjects = useMemo(() => {
    if (pauta?.subjects && pauta.subjects.length > 0) {
      return pauta.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.name.slice(0, 4).toUpperCase(),
        isMySubject: isTeacher && myAssignments.some((a) => a.sectionId === sectionId && a.subjectId === s.id),
      }));
    }
    return [];
  }, [pauta?.subjects, isTeacher, myAssignments, sectionId]);

  const studentsData: PautaStudentRow[] = useMemo(
    () => (pauta?.students ?? []).map((student, idx) => ({ ...student, id: student.studentId, index: idx + 1 })),
    [pauta?.students]
  );

  const columns: Column<PautaStudentRow>[] = useMemo(() => {
    const baseCols: Column<PautaStudentRow>[] = [
      {
        key: "index",
        header: "N.º",
        className: "w-10 text-center",
        render: (_, student) => <span className="font-mono text-muted-foreground">{student.index}</span>,
      },
      {
        key: "studentName",
        header: "Nome do Estudante",
        className: "min-w-[180px]",
        render: (_, student) => (
          <div>
            <div className="font-medium text-foreground text-xs">{student.studentName}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{student.studentNumber}</div>
          </div>
        ),
      },
      ...displaySubjects.map<Column<PautaStudentRow>>((s) => ({
        key: `subj_${s.id}`,
        header: (
          <div className="flex flex-col items-center" title={`${s.name}${s.isMySubject ? " (Sua Disciplina)" : ""}`}>
            <div className={`font-medium truncate max-w-[75px] ${s.isMySubject ? "text-primary font-bold" : "text-foreground"}`}>
              {s.code}
            </div>
            <span className="text-[9px] lowercase font-normal text-muted-foreground">
              {s.isMySubject ? "Sua Cadeira" : "MT"}
            </span>
          </div>
        ),
        className: "text-center min-w-[70px]",
        render: (_, student) => {
          const mt = student.subjects[s.id]?.mt;
          return mt !== undefined ? (
            <span className={`font-mono font-medium ${mt >= 10 ? "text-success" : mt >= 7 ? "text-warning" : "text-destructive"}`}>
              {mt.toFixed(1)}
            </span>
          ) : (
            <span className="text-muted-foreground text-[10px]">—</span>
          );
        },
      })),
      {
        key: "termAverageTotal",
        header: <span className="font-medium text-primary">Média MT</span>,
        className: "text-center w-24",
        render: (_, student) => (
          <span className="font-medium text-foreground">{student.termAverageTotal.toFixed(1)}</span>
        ),
      },
      {
        key: "failedSubjectsCount",
        header: "Deficiências",
        className: "text-center w-24",
        render: (_, student) =>
          student.failedSubjectsCount > 0 ? (
            <Badge variant="destructive">{student.failedSubjectsCount} disc.</Badge>
          ) : (
            <Badge variant="success">0</Badge>
          ),
      },
      {
        key: "transitionStatus",
        header: "Deliberação Proposta",
        className: "text-center min-w-[140px]",
        render: (_, student) => (
          <>
            {student.transitionStatus === "APPROVED" && <Badge variant="success">Aprovado</Badge>}
            {student.transitionStatus === "APPROVED_WITH_CONDITIONS" && (
              <Badge variant="info" title={student.exceptionApplied}>Exceção 7ª/8ª</Badge>
            )}
            {student.transitionStatus === "FAILED" && <Badge variant="destructive">Não transita</Badge>}
          </>
        ),
      },
    ];
    return baseCols;
  }, [displaySubjects]);

  // Se for professor e a turma não lhe estiver atribuída, bloqueia o acesso
  if (!isScopeLoading && isTeacher && !canAccessSection(sectionId)) {
    return (
      <div className="space-y-6">
        <TitleList title="Pauta Consolidada" suTitle="Consulta de pauta e aproveitamento escolar" />
        <EmptyState
          icon="ShieldAlert"
          title="Acesso Não Permitido"
          description="Esta turma não lhe está atribuída. Os professores apenas podem consultar as pautas das turmas em que leccionam."
        />
      </div>
    );
  }

  if (!pauta) {
    return isLoading ? (
      <p className="text-sm text-muted-foreground">A carregar…</p>
    ) : (
      <EmptyState icon="FileX" title="Pauta não encontrada" description="Não existe pauta consolidada para esta turma e trimestre." />
    );
  }

  return (
    <div className="space-y-6">
      <TitleList
        title={`Pauta Consolidada — ${pauta.sectionName}`}
        suTitle={`${TERM_LABEL[pauta.term]} • Ano Letivo ${pauta.academicYear} • Turno: ${pauta.shift} • ${pauta.students.length} Estudantes`}
      >
        <Badge variant={pauta.isClosed ? "default" : "warning"}>
          {pauta.isClosed ? "Fechada e Homologada" : "Em Elaboração"}
        </Badge>
      </TitleList>

      {/* Indicadores Chave da Turma */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xs border bg-muted/20 text-xs">
        <div>
          <span className="text-muted-foreground">Média Geral da Turma:</span>
          <p className="text-base font-bold text-foreground">{pauta.students.some((s) => Object.keys(s.subjects).length) ? `${pauta.averageClassScore.toFixed(1)} / 20` : "—"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Taxa de Aproveitamento:</span>
          <p className="text-base font-bold text-success">{pauta.approvalRate.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Notas em Falta:</span>
          <p className={`text-base font-bold ${pauta.missingGradesCount === 0 ? "text-success" : "text-destructive"}`}>
            {pauta.missingGradesCount === 0 ? "0 (100% Preenchida)" : `${pauta.missingGradesCount} pendentes`}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Estado do Fecho:</span>
          <p className="text-base font-bold text-foreground">{pauta.isClosed ? "Homologada" : "Aguardando Fecho"}</p>
        </div>
      </div>

      {/* Fecho e Auditoria */}
      {pauta.isClosed && pauta.closedBy && (
        <div className="p-3 rounded-xs border border-primary/20 bg-primary/5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Lock" className="h-4 w-4 text-primary" />
            <span>
              Pauta trancada por <strong>{pauta.closedBy}</strong> em {pauta.closedAt ? formatDateTime(pauta.closedAt) : ""}.
            </span>
          </div>
          <FeatureGate permission="pauta:reopen" fallback="hidden">
            <Button variant="outline" size="sm" onClick={() => setIsReopenOpen(true)}>
              <Icon name="RotateCcw" className="h-3.5 w-3.5" />
              Reabrir Pauta (Auditoria)
            </Button>
          </FeatureGate>
        </div>
      )}

      {/* Matriz Cruzada Alunos x Disciplinas */}
      <div id="pauta-geral-table-container" className="space-y-4">
        <GenericTable data={studentsData} columns={columns} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          Documento regulamentado pelo Decreto Executivo n.º 424/25 do Ministério da Educação.
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExportOpen(true)}
            className="gap-2"
          >
            <Icon name="Download" className="h-4 w-4" />
            <span>Baixar Pauta (PDF)</span>
          </Button>
          {!pauta.isClosed && (
            <FeatureGate permission="pauta:close" fallback="hidden">
              <Button size="sm" onClick={() => setIsLockOpen(true)}>
                <Icon name="Lock" className="h-4 w-4" />
                Homologar &amp; Fechar Pauta
              </Button>
            </FeatureGate>
          )}
        </div>
      </div>

      <LockPautaModal isOpen={isLockOpen} onClose={() => setIsLockOpen(false)} pauta={pauta} />
      <ReopenPautaModal isOpen={isReopenOpen} onClose={() => setIsReopenOpen(false)} pauta={pauta} />
      <PautaExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} pauta={pauta} />
    </div>
  );
}
