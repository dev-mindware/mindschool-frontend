"use client";

import React, { useState } from "react";
import { GlobalModal, Button, Icon } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { ConsolidatedPauta, AssessmentTerm } from "@/types/grade";
import { downloadElementAsPdf } from "@/utils/export-pdf";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { formatDate } from "@/utils";
import { governmentLine, registrationLine } from "@/lib/document-header";

interface PautaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pauta: ConsolidatedPauta;
}

const TERM_LABEL: Record<AssessmentTerm, string> = {
  TRIMESTER_1: "1.º Trimestre",
  TRIMESTER_2: "2.º Trimestre",
  TRIMESTER_3: "3.º Trimestre",
};

export function PautaExportModal({ isOpen, onClose, pauta }: PautaExportModalProps) {
  const { profile, calendar } = useSchoolSettingsStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const displayYear = pauta.academicYear || calendar.academicYear || "";
  const displayClassLevel = pauta.classLevel || "7.ª Classe";
  const displaySection = pauta.sectionName || "Turma A";
  const displayShift = ({ manha: "Manhã", tarde: "Tarde", noite: "Noite", integral: "Integral" } as Record<string, string>)[pauta.shift] ?? (pauta.shift || "—");
  const termName = TERM_LABEL[pauta.term] || "Período Letivo";

  // Estatísticas oficiais
  const totalStudents = pauta.students.length;
  // Só contam as propostas do sistema (regra da API): nunca se deduz um resultado a partir do número de negativas.
  const approvedCount = pauta.students.filter((s) => s.transitionStatus === "APPROVED").length;
  const conditionalCount = pauta.students.filter((s) => s.transitionStatus === "APPROVED_WITH_CONDITIONS").length;
  const failedCount = pauta.students.filter((s) => s.transitionStatus === "FAILED").length;
  const pendingCount = totalStudents - approvedCount - conditionalCount - failedCount;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadElementAsPdf("pauta-official-print-sheet", {
        filename: `Pauta_Oficial_${displaySection.replace(/\s+/g, "_")}_${termName.replace(/[^a-z0-9]/gi, "_")}_${displayYear.replace(/\//g, "-")}.pdf`,
        orientation: "landscape",
      });
      SucessMessage("Pauta oficial transferida em PDF com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF da pauta:", err);
      ErrorMessage("Erro ao gerar o ficheiro PDF da pauta oficial.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      size="5xl"
      title="Exportar Pauta Oficial de Aproveitamento (PDF)"
      description="Documento administrativo oficial formatado para impressão e arquivo escolar (A4 Paisagem)."
    >
      <div className="space-y-4">
        {/* Folha de Documento Oficial A4 Paisagem (Simulação Física) */}
        <div className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-2 sm:p-5 shadow-inner">
          <div
            id="pauta-official-print-sheet"
            className="mx-auto w-full min-w-[1050px] max-w-[1180px] bg-card p-8 text-card-foreground border border-border shadow-md font-sans print:bg-white print:text-black print:border-black"
            style={{ minHeight: "720px" }}
          >
            {/* 1. CABEÇALHO OFICIAL INSTITUCIONAL (REPÚBLICA DE ANGOLA) */}
            <div className="border-b-2 border-border pb-4 text-center">
              {/* Insígnia / Brasão e Denominação da República */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-foreground">
                  REPÚBLICA DE ANGOLA
                </div>
                <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest mt-0.5">
                  MINISTÉRIO DA EDUCAÇÃO
                </div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wide mt-0.5">
                  {governmentLine(profile, "DIRECÇÃO MUNICIPAL DA EDUCAÇÃO DE")}
                </div>
              </div>

              {/* Nome Oficial da Escola */}
              <div className="mt-2.5">
                <h1 className="text-lg font-semibold tracking-tight text-foreground uppercase font-serif">
                  {profile.schoolName}
                </h1>
                {profile.subTitle && <p className="text-[10px] uppercase text-muted-foreground font-medium">{profile.subTitle}</p>}
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{registrationLine(profile)}</p>
              </div>

              {/* Título Oficial do Documento */}
              <div className="mt-3.5 inline-block border-y-2 border-border py-1 px-8">
                <h2 className="text-base font-semibold tracking-wider uppercase text-foreground">
                  PAUTA CONSOLIDADA DE APROVEITAMENTO ESCOLAR
                </h2>
                <div className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                  {termName} • REGULAMENTADA PELO DECRETO EXECUTIVO N.º 424/25
                </div>
              </div>
            </div>

            {/* 2. GRELHA DE METADADOS INSTITUCIONAIS */}
            <div className="grid grid-cols-6 border-b-2 border-border text-xs font-semibold text-foreground divide-x divide-border bg-muted/40">
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Ano Lectivo</span>
                <span className="font-semibold text-foreground text-sm">{displayYear}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Classe / Nível</span>
                <span className="font-semibold text-foreground text-sm">{displayClassLevel}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Turma</span>
                <span className="font-semibold text-foreground text-sm">{displaySection}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Turno</span>
                <span className="font-semibold text-foreground text-sm">{displayShift}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Alunos Avaliados</span>
                <span className="font-semibold text-foreground text-sm">{totalStudents}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Homologação</span>
                <span className="font-semibold text-xs uppercase text-foreground">
                  {pauta.isClosed ? "Homologada" : "Provisória"}
                </span>
              </div>
            </div>

            {/* 3. TABELA MATRICIAL DE NOTAS (PADRÃO OFICIAL ANGOLANO) */}
            <div className="mt-3">
              <table className="w-full border-collapse border-2 border-border text-foreground text-xs">
                <thead>
                  <tr className="bg-muted/60 font-semibold border-b border-border text-center text-[10px]">
                    <th rowSpan={2} className="border-r border-border p-1.5 w-9 text-center">
                      N.º
                    </th>
                    <th rowSpan={2} className="border-r border-border p-1.5 w-20 text-center font-mono">
                      N.º Proc.
                    </th>
                    <th rowSpan={2} className="border-r border-border p-1.5 text-left min-w-[200px]">
                      Nome Completo do Estudante
                    </th>
                    {pauta.subjects && pauta.subjects.length > 0 ? (
                      pauta.subjects.map((subj) => (
                        <th
                          key={subj.id}
                          className="border-r border-border p-1 text-center font-semibold min-w-[55px]"
                          title={subj.name}
                        >
                          <div className="truncate max-w-[65px] mx-auto text-[10px]">
                            {(subj.code ?? subj.name.slice(0, 4)).toUpperCase()}
                          </div>
                        </th>
                      ))
                    ) : (
                      <th className="border-r border-border p-1">Disciplinas</th>
                    )}
                    <th rowSpan={2} className="border-r border-border p-1.5 w-16 text-center font-semibold bg-muted/80">
                      Média MT
                    </th>
                    <th rowSpan={2} className="border-r border-border p-1.5 w-14 text-center font-semibold">
                      Def.
                    </th>
                    <th rowSpan={2} className="p-1.5 w-32 text-center font-semibold">
                      Deliberação do Conselho
                    </th>
                  </tr>
                  <tr className="bg-muted/60 font-semibold border-b border-border text-center text-[9px]">
                    {pauta.subjects?.map((subj) => (
                      <th key={subj.id} className="border-r border-border py-0.5 px-1 font-semibold text-muted-foreground">
                        MT
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pauta.students.length === 0 ? (
                    <tr>
                      <td
                        colSpan={(pauta.subjects?.length || 1) + 6}
                        className="p-8 text-center text-muted-foreground italic text-xs"
                      >
                        Nenhum estudante matriculado nesta turma para o período seleccionado.
                      </td>
                    </tr>
                  ) : (
                    pauta.students.map((student, idx) => (
                      <tr
                        key={student.studentId}
                        className={`border-b last:border-b-0 border-border ${idx % 2 === 1 ? "bg-muted/30" : "bg-card"}`}
                      >
                        {/* N.º */}
                        <td className="border-r border-border py-1.5 px-1 text-center font-mono font-semibold text-[11px]">
                          {idx + 1}
                        </td>

                        {/* N.º Processo */}
                        <td className="border-r border-border py-1.5 px-1 text-center font-mono text-[10px] text-muted-foreground">
                          {student.studentNumber || "—"}
                        </td>

                        {/* Nome do Estudante */}
                        <td className="border-r border-border py-1.5 px-2 font-semibold text-[11px] uppercase tracking-tight text-foreground">
                          {student.studentName}
                        </td>

                        {/* Disciplinas x Notas MT */}
                        {pauta.subjects?.map((subj) => {
                          const mt = student.subjects[subj.id]?.mt;
                          const isNegative = mt !== undefined && mt !== null && mt < 10;
                          return (
                            <td
                              key={subj.id}
                              className={`border-r border-border py-1.5 px-1 text-center font-mono text-[11px] ${
                                isNegative ? "font-semibold text-destructive underline decoration-2" : "text-foreground"
                              }`}
                            >
                              {mt !== undefined && mt !== null ? mt.toFixed(1) : "—"}
                            </td>
                          );
                        })}

                        {/* Média MT */}
                        <td className="border-r border-border py-1.5 px-1 text-center font-mono font-semibold text-[11px] bg-muted/50">
                          {Object.keys(student.subjects).length ? student.termAverageTotal.toFixed(1) : "—"}
                        </td>

                        {/* Deficiências */}
                        <td className="border-r border-border py-1.5 px-1 text-center font-mono text-[11px]">
                          {student.failedSubjectsCount > 0 ? (
                            <span className="font-semibold text-foreground">{student.failedSubjectsCount}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>

                        {/* Deliberação */}
                        <td className="py-1.5 px-2 text-center text-[10px] font-semibold uppercase tracking-tight">
                          {student.transitionStatus === "APPROVED" && (
                            <span className="text-success font-semibold">Transita</span>
                          )}
                          {student.transitionStatus === "APPROVED_WITH_CONDITIONS" && (
                            <span className="text-warning font-semibold">Transita (Art. 24.º)</span>
                          )}
                          {student.transitionStatus === "FAILED" && (
                            <span className="text-destructive font-semibold">Não Transita</span>
                          )}
                          {(!student.transitionStatus || student.transitionStatus === "PENDING") && (
                            <span className="text-muted-foreground">Sem proposta</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. QUADRO DE APURAMENTO ESTATÍSTICO (RESUMO DA TURMA) */}
            <div className="mt-4 border-2 border-border bg-muted/40 p-2.5 rounded-md">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground border-b border-border pb-1 mb-2">
                SÍNTESE ESTATÍSTICA DE APROVEITAMENTO DA TURMA
              </div>
              <div className="grid grid-cols-6 gap-2 text-center text-xs font-semibold text-foreground divide-x divide-border">
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Estudantes</span>
                  <span className="font-semibold text-sm">{totalStudents}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Aprovados</span>
                  <span className="font-semibold text-sm">
                    {approvedCount} ({totalStudents > 0 ? ((approvedCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Excepções Art. 24.º</span>
                  <span className="font-semibold text-sm">
                    {conditionalCount} ({totalStudents > 0 ? ((conditionalCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Sem proposta</span>
                  <span className="font-semibold text-sm">
                    {pendingCount} ({totalStudents > 0 ? ((pendingCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Não Transitam</span>
                  <span className="font-semibold text-sm">
                    {failedCount} ({totalStudents > 0 ? ((failedCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Média da Turma</span>
                  <span className="font-semibold text-sm">{pauta.students.some((s) => Object.keys(s.subjects).length) ? `${(pauta.averageClassScore ?? 0).toFixed(1)} / 20` : "—"}</span>
                </div>
              </div>
            </div>

            {/* 5. MENÇÃO LEGAL E TERMO DE HOMOLOGAÇÃO */}
            <div className="mt-4 pt-2 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
              <span>
                Documento administrativo oficial lavrado em conformidade com o <strong>Decreto Executivo n.º 424/25</strong> do Ministério da Educação da República de Angola.
              </span>
              <span>
                Emitido em: {formatDate(new Date())}
              </span>
            </div>

            {/* 6. ESPAÇO FORMAL PARA ASSINATURAS E CARIMBO INSTITUCIONAL */}
            <div className="mt-8 pt-4 grid grid-cols-3 gap-8 text-center text-xs text-foreground">
              {/* Assinatura Pedagógica */}
              <div className="flex flex-col items-center">
                <div className="w-56 border-b border-border mb-1.5" />
                <span className="font-semibold text-[11px] uppercase">O Subdirector Pedagógico</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {profile.pedagogicDirectorName || "Coordenação Pedagógica"}
                </span>
              </div>

              {/* Carimbo da Instituição */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-dashed border-border flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest text-center p-2">
                  Carimbo Oficial / Selo Branco
                </div>
              </div>

              {/* Assinatura Direcção Geral */}
              <div className="flex flex-col items-center">
                <div className="w-56 border-b border-border mb-1.5" />
                <span className="font-semibold text-[11px] uppercase">O Director Geral</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {profile.directorGeneralName || "Direcção da Instituição"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <span>
              A pauta oficial será gerada e transferida em formato PDF pronto para impressão institucional (A4 Paisagem).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Icon name="Printer" className="w-4 h-4" />
              <span>Imprimir</span>
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Icon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon name="Download" className="w-4 h-4" />
              )}
              <span>Baixar Pauta (PDF)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Regras de Impressão Global para A4 Paisagem Estrito */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pauta-official-print-sheet,
          #pauta-official-print-sheet * {
            visibility: visible !important;
          }
          #pauta-official-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 8mm !important;
            background: white !important;
            color: black !important;
            z-index: 9999999 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </GlobalModal>
  );
}
