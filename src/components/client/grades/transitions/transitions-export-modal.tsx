"use client";

import React, { useState } from "react";
import { GlobalModal, Button, Icon } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { ConsolidatedStudentRow } from "@/types/grade";
import { downloadElementAsPdf } from "@/utils/export-pdf";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { formatDate } from "@/utils";
import { governmentLine, registrationLine } from "@/lib/document-header";

interface TransitionsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  classLevel: string;
  shift: string;
  /** Data do conselho final encerrado a que a ata se refere. */
  councilDate?: string;
  students: ConsolidatedStudentRow[];
  stats: {
    directApproval: number;
    conditionalApproval: number;
    failedCount: number;
  };
}

export function TransitionsExportModal({
  isOpen,
  onClose,
  sectionName,
  classLevel,
  shift,
  councilDate,
  students,
  stats,
}: TransitionsExportModalProps) {
  const { profile, calendar } = useSchoolSettingsStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const displayYear = calendar.academicYear || "";
  const totalStudents = students.length;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadElementAsPdf("transitions-ata-sheet", {
        filename: `Ata_Conselho_Notas_${sectionName.replace(/\s+/g, "_")}_${displayYear.replace(/\//g, "-")}.pdf`,
        orientation: "portrait",
      });
      SucessMessage("Acta do conselho de notas transferida em PDF com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF da ata:", err);
      ErrorMessage("Erro ao gerar o ficheiro PDF da ata oficial.");
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
      title="Exportar Acta do Conselho de Notas (PDF)"
      description="Documento administrativo deliberativo de transição escolar e aplicação do Decreto Executivo n.º 424/25."
    >
      <div className="space-y-4">
        {/* Folha Oficial A4 Retrato (Simulação Física) */}
        <div className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-2 sm:p-5 shadow-inner">
          <div
            id="transitions-ata-sheet"
            className="mx-auto w-full max-w-[850px] bg-card p-8 text-card-foreground border border-border shadow-md font-sans print:bg-white print:text-black print:border-black"
            style={{ minHeight: "950px" }}
          >
            {/* 1. CABEÇALHO OFICIAL INSTITUCIONAL */}
            <div className="border-b-2 border-border pb-4 text-center">
              <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-foreground">
                REPÚBLICA DE ANGOLA
              </div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest mt-0.5">
                MINISTÉRIO DA EDUCAÇÃO
              </div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wide mt-0.5">
                {governmentLine(profile, "DIRECÇÃO MUNICIPAL DA EDUCAÇÃO DE")}
              </div>

              <div className="mt-2.5">
                <h1 className="text-base font-semibold tracking-tight text-foreground uppercase font-serif">
                  {profile.schoolName}
                </h1>
                {profile.subTitle && <p className="text-[10px] uppercase text-muted-foreground font-medium">{profile.subTitle}</p>}
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{registrationLine(profile)}</p>
              </div>

              <div className="mt-3.5 inline-block border-y-2 border-border py-1 px-8">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  ACTA DO CONSELHO DE NOTAS E TRANSIÇÃO DE CLASSE
                </h2>
                <div className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
                  APLICAÇÃO DO REGIME GERAL E EXCEPÇÕES DO DECRETO EXECUTIVO N.º 424/25
                </div>
              </div>
            </div>

            {/* 2. BARRA DE METADADOS DA TURMA */}
            <div className="grid grid-cols-4 border-b-2 border-border text-xs font-semibold text-foreground divide-x divide-border bg-muted/40">
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Ano Lectivo</span>
                <span className="font-semibold text-foreground text-xs">{displayYear}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Classe / Turma</span>
                <span className="font-semibold text-foreground text-xs">{classLevel} — {sectionName}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Turno</span>
                <span className="font-semibold text-foreground text-xs">{shift === "MORNING" ? "Manhã" : shift === "AFTERNOON" ? "Tarde" : shift || "Diurno"}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Total Avaliados</span>
                <span className="font-semibold text-foreground text-xs">{totalStudents} Alunos</span>
              </div>
            </div>

            {/* 3. TERMO DE REUNIÃO FORMAL */}
            <div className="mt-3.5 text-justify text-[11px] leading-relaxed text-foreground indent-6">
              Aos {formatDate(councilDate ?? new Date())}, nas instalações da instituição escolar <strong>{profile.schoolName || "Colégio Privado MindSchool"}</strong>, reuniu-se o Conselho de Docentes e Equipa Pedagógica da turma <strong>{sectionName}</strong>, sob a presidência da Direcção Geral. A sessão teve como finalidade exclusiva a verificação minuciosa do rendimento académico final, a conferência das médias globais e a deliberação soberana sobre a transição de classe dos estudantes, aplicando com total rigor os critérios estabelecidos pelo <strong>Decreto Executivo n.º 424/25</strong> e as faculdades concedidas pelo regime de excepções do Artigo 24.º para o ensino secundário geral.
            </div>

            {/* 4. TABELA FORMAL DE DELIBERAÇÕES */}
            <div className="mt-4">
              <table className="w-full border-collapse border-2 border-border text-foreground text-xs">
                <thead>
                  <tr className="bg-muted/60 font-semibold border-b border-border text-center text-[10px]">
                    <th className="border-r border-border p-1.5 w-8 text-center">N.º</th>
                    <th className="border-r border-border p-1.5 w-20 text-center font-mono">Processo</th>
                    <th className="border-r border-border p-1.5 text-left min-w-[200px]">Nome do Estudante</th>
                    <th className="border-r border-border p-1.5 w-16 text-center font-semibold">Média</th>
                    <th className="border-r border-border p-1.5 w-24 text-center font-semibold">Deficiências</th>
                    <th className="p-1.5 w-36 text-center font-semibold">Deliberação do Conselho</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground italic text-xs">
                        Nenhum registo de transição disponível para a turma seleccionada.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr
                        key={student.studentId || idx}
                        className={`border-b last:border-b-0 border-border ${idx % 2 === 1 ? "bg-muted/30" : "bg-card"}`}
                      >
                        <td className="border-r border-border py-1 px-1 text-center font-mono font-semibold text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="border-r border-border py-1 px-1 text-center font-mono text-[10px] text-muted-foreground">
                          {student.studentNumber || "—"}
                        </td>
                        <td className="border-r border-border py-1 px-2 font-semibold text-[11px] uppercase tracking-tight text-foreground">
                          {student.studentName}
                        </td>
                        <td className="border-r border-border py-1 px-1 text-center font-mono font-semibold text-[11px]">
                          {student.termAverageTotal.toFixed(1)}
                        </td>
                        <td className="border-r border-border py-1 px-1 text-center text-[10px]">
                          {student.failedSubjectsCount === 0 ? (
                            <span className="text-muted-foreground">0 disc.</span>
                          ) : (
                            <span className="font-semibold text-destructive">{student.failedSubjectsCount} disc.</span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-center text-[10px] font-semibold uppercase tracking-tight">
                          {student.transitionStatus === "APPROVED" && (
                            <span className="text-success font-semibold">Transita (Direto)</span>
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

            {/* 5. SÍNTESE ESTATÍSTICA DO CONSELHO */}
            <div className="mt-4 border-2 border-border bg-muted/40 p-2.5 rounded-md">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground border-b border-border pb-1 mb-2">
                APURAMENTO FINAL DO CONSELHO DOCENTE
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold text-foreground divide-x divide-border">
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Aprovados Diretos</span>
                  <span className="font-semibold text-sm">
                    {stats.directApproval} ({totalStudents > 0 ? ((stats.directApproval / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Exceções Legais (Art. 24.º)</span>
                  <span className="font-semibold text-sm">
                    {stats.conditionalApproval} ({totalStudents > 0 ? ((stats.conditionalApproval / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Retidos / Não Transitam</span>
                  <span className="font-semibold text-sm">
                    {stats.failedCount} ({totalStudents > 0 ? ((stats.failedCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            {/* 6. TERMO DE ENCERRAMENTO E ASSINATURAS */}
            <div className="mt-3.5 text-justify text-[10px] leading-relaxed text-muted-foreground indent-4">
              Nada mais havendo a tratar, o Presidente deu por concluída a sessão do Conselho de Avaliação, lavrando-se a presente ata que, após lida perante o corpo docente e aprovada por unanimidade, segue devidamente assinada pelos membros deliberativos e autenticada com o carimbo oficial desta instituição.
            </div>

            <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-center text-xs text-foreground">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-border mb-1.5" />
                <span className="font-semibold text-[10px] uppercase">O Secretário do Conselho</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Secretaria Pedagógica</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-border mb-1.5" />
                <span className="font-semibold text-[10px] uppercase">O Subdirector Pedagógico</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{profile.pedagogicDirectorName || "Coordenação Pedagógica"}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-border mb-1.5" />
                <span className="font-semibold text-[10px] uppercase">O Presidente do Conselho</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{profile.directorGeneralName || "Diretor Geral"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <span>
              A acta do conselho será exportada diretamente em formato PDF oficial (A4 Retrato).
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
              <span>Baixar Acta (PDF)</span>
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #transitions-ata-sheet,
          #transitions-ata-sheet * {
            visibility: visible !important;
          }
          #transitions-ata-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            color: black !important;
            z-index: 9999999 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </GlobalModal>
  );
}
