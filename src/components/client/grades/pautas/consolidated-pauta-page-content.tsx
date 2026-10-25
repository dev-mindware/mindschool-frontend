"use client";

import React, { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { formatDateTime } from "@/utils";
import { AssessmentTerm } from "@/types/grade";
import { usePautas } from "@/hooks/school/use-pautas";
import { useTeachingScope } from "@/hooks/school/use-teaching-scope";
import { Button, EmptyState, FeatureGate, Icon, TitleList } from "@/components";
import { Badge } from "@/components/ui/badge";
import { LockPautaModal } from "./lock-pauta-modal";
import { ReopenPautaModal } from "./reopen-pauta-modal";
import { PautaExportModal } from "./pauta-export-modal";

const TERM_LABEL: Record<AssessmentTerm, string> = {
  TRIMESTER_1: "1.º Trimestre",
  TRIMESTER_2: "2.º Trimestre",
  TRIMESTER_3: "3.º Trimestre",
};

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border bg-muted/20 text-xs">
        <div>
          <span className="text-muted-foreground">Média Geral da Turma:</span>
          <p className="text-base font-bold text-foreground">{pauta.averageClassScore.toFixed(1)} / 20</p>
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
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs flex items-center justify-between">
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

      {/* Matriz Cruzada Alunos x Disciplinas (Container Exportável) */}
      <div id="pauta-geral-table-container" className="rounded-lg border bg-card p-4 space-y-4 shadow-xs">
        {/* Cabeçalho Oficial no PDF / Impressão */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Pauta Consolidada — {pauta.sectionName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {TERM_LABEL[pauta.term]} • Ano Letivo {pauta.academicYear} • Turno: {pauta.shift} • {pauta.students.length} Estudantes
            </p>
          </div>
          <div className="text-right text-xs">
            <div className="text-muted-foreground">Média Geral da Turma: <span className="font-bold text-foreground">{(pauta.averageClassScore ?? 0).toFixed(1)}/20</span></div>
            <div className="text-muted-foreground">Taxa de Aproveitamento: <span className="font-bold text-foreground">{(pauta.approvalRate ?? 0).toFixed(1)}%</span></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center sticky left-0 bg-muted/80 z-10">N.º</th>
              <th className="py-2.5 px-3 min-w-[180px] sticky left-10 bg-muted/80 z-10">Nome do Estudante</th>
              {displaySubjects.map((s) => (
                <th
                  key={s.id}
                  className={`py-2.5 px-2 text-center min-w-[70px] border-l border-border/50 ${s.isMySubject ? "bg-primary/10" : ""}`}
                  title={`${s.name}${s.isMySubject ? " (Sua Disciplina)" : ""}`}
                >
                  <div className={`font-medium truncate max-w-[75px] ${s.isMySubject ? "text-primary font-bold" : "text-foreground"}`}>
                    {s.code}
                  </div>
                  <span className="text-[9px] lowercase font-normal text-muted-foreground">
                    {s.isMySubject ? "Sua Cadeira" : "MT"}
                  </span>
                </th>
              ))}
              <th className="py-2.5 px-3 text-center w-24 bg-primary/10 border-l border-border">
                <div className="font-medium text-primary">Média MT</div>
              </th>
              <th className="py-2.5 px-3 text-center w-24 border-l border-border">Deficiências</th>
              <th className="py-2.5 px-3 text-center min-w-[140px] border-l border-border">Deliberação Proposta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pauta.students.map((student, idx) => (
              <tr key={student.studentId} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3 text-center font-mono text-muted-foreground sticky left-0 bg-card z-10">{idx + 1}</td>
                <td className="py-2.5 px-3 sticky left-10 bg-card z-10">
                  <div className="font-medium text-foreground text-xs">{student.studentName}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{student.studentNumber}</div>
                </td>

                {displaySubjects.map((subj) => {
                  const mt = student.subjects[subj.id]?.mt;
                  return (
                    <td
                      key={subj.id}
                      className={`py-2 px-2 text-center border-l border-border/40 font-mono ${subj.isMySubject ? "bg-primary/5 font-semibold" : ""}`}
                    >
                      {mt !== undefined ? (
                        <span className={`font-medium ${mt >= 10 ? "text-success" : mt >= 7 ? "text-warning" : "text-destructive"}`}>
                          {mt.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                  );
                })}

                <td className="py-2.5 px-3 text-center font-medium text-foreground bg-primary/5 border-l border-border">
                  {student.termAverageTotal.toFixed(1)}
                </td>

                <td className="py-2.5 px-3 text-center border-l border-border">
                  {student.failedSubjectsCount > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border border-destructive-border bg-destructive-muted text-destructive">
                      {student.failedSubjectsCount} disc.
                    </span>
                  ) : (
                    <span className="text-success font-medium">0</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-center border-l border-border">
                  {student.transitionStatus === "APPROVED" && <Badge variant="success">Aprovado</Badge>}
                  {student.transitionStatus === "APPROVED_WITH_CONDITIONS" && (
                    <Badge variant="info" title={student.exceptionApplied}>Exceção 7ª/8ª</Badge>
                  )}
                  {student.transitionStatus === "FAILED" && <Badge variant="destructive">Não transita</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="text-[10px] text-muted-foreground border-t pt-2 italic">
          Documento regulamentado pelo Decreto Executivo n.º 424/25 do Ministério da Educação.
        </div>
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
