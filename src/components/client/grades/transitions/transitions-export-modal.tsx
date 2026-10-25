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
      SucessMessage("Ata do conselho de notas transferida em PDF com sucesso!");
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
      title="Exportar Ata do Conselho de Notas (PDF)"
      description="Documento administrativo deliberativo de transição escolar e aplicação do Decreto Executivo n.º 424/25."
      className="w-full sm:max-w-5xl"
    >
      <div className="space-y-4">
        {/* Folha Oficial A4 Retrato (Simulação Física) */}
        <div className="overflow-x-auto rounded-xl border border-border bg-slate-200/70 p-2 sm:p-5 dark:bg-slate-950/80 shadow-inner">
          <div
            id="transitions-ata-sheet"
            className="mx-auto w-full max-w-[850px] bg-white p-8 text-black shadow-md font-sans"
            style={{ minHeight: "950px", color: "#000000", backgroundColor: "#ffffff" }}
          >
            {/* 1. CABEÇALHO OFICIAL INSTITUCIONAL */}
            <div className="border-b-2 border-black pb-4 text-center">
              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-black">
                REPÚBLICA DE ANGOLA
              </div>
              <div className="text-[10px] font-semibold uppercase text-black/80 tracking-widest mt-0.5">
                MINISTÉRIO DA EDUCAÇÃO
              </div>
              <div className="text-[10px] uppercase text-black/70 tracking-wide mt-0.5">
                {governmentLine(profile, "DIRECÇÃO MUNICIPAL DA EDUCAÇÃO DE")}
              </div>

              <div className="mt-2.5">
                <h1 className="text-base font-black tracking-tight text-black uppercase font-serif">
                  {profile.schoolName}
                </h1>
                {profile.subTitle && <p className="text-[10px] uppercase text-black/80 font-medium">{profile.subTitle}</p>}
                <p className="text-[9px] text-black/60 font-mono mt-0.5">{registrationLine(profile)}</p>
              </div>

              <div className="mt-3.5 inline-block border-y-2 border-black py-1 px-8">
                <h2 className="text-sm font-black tracking-wider uppercase text-black">
                  ATA DO CONSELHO DE NOTAS E TRANSIÇÃO DE CLASSE
                </h2>
                <div className="text-[10px] font-bold text-black uppercase tracking-wide">
                  APLICAÇÃO DO REGIME GERAL E EXCEPÇÕES DO DECRETO EXECUTIVO N.º 424/25
                </div>
              </div>
            </div>

            {/* 2. BARRA DE METADADOS DA TURMA */}
            <div className="grid grid-cols-4 border-b-2 border-black text-xs font-semibold text-black divide-x divide-black bg-slate-50/50">
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Ano Letivo</span>
                <span className="font-bold text-black text-xs">{displayYear}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Classe / Turma</span>
                <span className="font-bold text-black text-xs">{classLevel} — {sectionName}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Turno</span>
                <span className="font-bold text-black text-xs">{shift === "MORNING" ? "Manhã" : shift === "AFTERNOON" ? "Tarde" : shift || "Diurno"}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Total Avaliados</span>
                <span className="font-bold text-black text-xs">{totalStudents} Alunos</span>
              </div>
            </div>

            {/* 3. TERMO DE REUNIÃO FORMAL */}
            <div className="mt-3.5 text-justify text-[11px] leading-relaxed text-black indent-6">
              Aos {formatDate(new Date())}, nas instalações da instituição escolar <strong>{profile.schoolName || "Colégio Privado MindSchool"}</strong>, reuniu-se em plenário extraordinário o Conselho de Docentes e Equipa Pedagógica da turma <strong>{sectionName}</strong>, sob a presidência da Direção Geral. A sessão teve como finalidade exclusiva a verificação minuciosa do rendimento académico final, a conferência das médias globais e a deliberação soberana sobre a transição de classe dos estudantes, aplicando com total rigor os critérios estabelecidos pelo <strong>Decreto Executivo n.º 424/25</strong> e as faculdades concedidas pelo regime de exceções do Artigo 24.º para o ensino secundário geral.
            </div>

            {/* 4. TABELA FORMAL DE DELIBERAÇÕES */}
            <div className="mt-4">
              <table className="w-full border-collapse border-2 border-black text-black text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-black text-center text-[10px]">
                    <th className="border-r border-black p-1.5 w-8 text-center">N.º</th>
                    <th className="border-r border-black p-1.5 w-20 text-center font-mono">Processo</th>
                    <th className="border-r border-black p-1.5 text-left min-w-[200px]">Nome do Estudante</th>
                    <th className="border-r border-black p-1.5 w-16 text-center font-bold">Média</th>
                    <th className="border-r border-black p-1.5 w-24 text-center font-bold">Deficiências</th>
                    <th className="p-1.5 w-36 text-center font-bold">Deliberação do Conselho</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-black/60 italic text-xs">
                        Nenhum registo de transição disponível para a turma seleccionada.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr
                        key={student.studentId || idx}
                        className={`border-b last:border-b-0 border-black ${idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}`}
                      >
                        <td className="border-r border-black py-1 px-1 text-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black py-1 px-1 text-center font-mono text-[10px] text-black/80">
                          {student.studentNumber || `P-${1000 + idx + 1}`}
                        </td>
                        <td className="border-r border-black py-1 px-2 font-semibold text-[11px] uppercase tracking-tight text-black">
                          {student.studentName}
                        </td>
                        <td className="border-r border-black py-1 px-1 text-center font-mono font-bold text-[11px]">
                          {student.termAverageTotal.toFixed(1)}
                        </td>
                        <td className="border-r border-black py-1 px-1 text-center text-[10px]">
                          {student.failedSubjectsCount === 0 ? (
                            <span className="text-black/60">0 disc.</span>
                          ) : (
                            <span className="font-bold text-black">{student.failedSubjectsCount} disc.</span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-center text-[10px] font-bold uppercase tracking-tight">
                          {student.transitionStatus === "APPROVED" && (
                            <span className="text-black">Transita (Direto)</span>
                          )}
                          {student.transitionStatus === "APPROVED_WITH_CONDITIONS" && (
                            <span className="text-black">Transita (Art. 24.º)</span>
                          )}
                          {student.transitionStatus === "FAILED" && (
                            <span className="text-black font-black">Não Transita</span>
                          )}
                          {(!student.transitionStatus || student.transitionStatus === "PENDING") && (
                            // sem proposta do sistema (pautas por fechar): nunca se inventa um resultado numa acta
                            <span className="text-black">Sem proposta</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. SÍNTESE ESTATÍSTICA DO CONSELHO */}
            <div className="mt-4 border-2 border-black bg-slate-50 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-black border-b border-black pb-1 mb-2">
                APURAMENTO FINAL DO CONSELHO DOCENTE
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold text-black divide-x divide-black/30">
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Aprovados Diretos</span>
                  <span className="font-black text-sm">
                    {stats.directApproval} ({totalStudents > 0 ? ((stats.directApproval / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Exceções Legais (Art. 24.º)</span>
                  <span className="font-black text-sm">
                    {stats.conditionalApproval} ({totalStudents > 0 ? ((stats.conditionalApproval / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Retidos / Não Transitam</span>
                  <span className="font-black text-sm">
                    {stats.failedCount} ({totalStudents > 0 ? ((stats.failedCount / totalStudents) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            {/* 6. TERMO DE ENCERRAMENTO E ASSINATURAS */}
            <div className="mt-3.5 text-justify text-[10px] leading-relaxed text-black indent-4">
              Nada mais havendo a tratar, o Presidente deu por concluída a sessão do Conselho de Avaliação, lavrando-se a presente ata que, após lida perante o corpo docente e aprovada por unanimidade, segue devidamente assinada pelos membros deliberativos e autenticada com o carimbo oficial desta instituição.
            </div>

            <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-center text-xs text-black">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-black mb-1.5" />
                <span className="font-bold text-[10px] uppercase">O Secretário do Conselho</span>
                <span className="text-[9px] text-black/70 mt-0.5">Secretaria Pedagógica</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-black mb-1.5" />
                <span className="font-bold text-[10px] uppercase">O Subdirector Pedagógico</span>
                <span className="text-[9px] text-black/70 mt-0.5">{profile.pedagogicDirectorName || "Coordenação Pedagógica"}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-black mb-1.5" />
                <span className="font-bold text-[10px] uppercase">O Presidente do Conselho</span>
                <span className="text-[9px] text-black/70 mt-0.5">{profile.directorGeneralName || "Diretor Geral"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <span>
              A ata do conselho será exportada diretamente em formato PDF oficial (A4 Retrato).
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
              className="gap-2 bg-primary text-primary-foreground"
            >
              {isDownloading ? (
                <Icon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon name="Download" className="w-4 h-4" />
              )}
              <span>Baixar Ata (PDF)</span>
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
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
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
