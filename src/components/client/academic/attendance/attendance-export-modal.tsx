"use client";

import React, { useState } from "react";
import { GlobalModal, Button, Icon } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { downloadElementAsPdf } from "@/utils/export-pdf";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { formatDate } from "@/utils";
import { governmentLine, registrationLine } from "@/lib/document-header";

export interface AttendanceStudentRow {
  studentId: string;
  name: string;
  studentNumber?: string;
  status?: "PRESENT" | "ABSENT_JUSTIFIED" | "ABSENT_UNJUSTIFIED" | "LATE" | null;
  note?: string;
}

interface AttendanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  subjectName: string;
  teacherName?: string;
  dateStr: string;
  lessonStart?: string;
  lessonEnd?: string;
  roomCode?: string | null;
  students: AttendanceStudentRow[];
  stats: {
    total: number;
    present: number;
    justified: number;
    unjustified: number;
    classRate: number;
  };
}

const STATUS_TEXT: Record<string, string> = {
  PRESENT: "Presente",
  LATE: "Atraso",
  ABSENT_JUSTIFIED: "Falta Justificada",
  ABSENT_UNJUSTIFIED: "Falta Injustificada",
};

export function AttendanceExportModal({
  isOpen,
  onClose,
  className: turmaName,
  subjectName,
  teacherName,
  dateStr,
  lessonStart,
  lessonEnd,
  roomCode,
  students,
  stats,
}: AttendanceExportModalProps) {
  const { profile, calendar } = useSchoolSettingsStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const displayYear = calendar.academicYear || "";
  const horarioLabel = lessonStart && lessonEnd ? `${lessonStart} – ${lessonEnd}` : "Tempo Normal";

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadElementAsPdf("attendance-official-print-sheet", {
        filename: `Folha_Presencas_${turmaName.replace(/\s+/g, "_")}_${subjectName.replace(/\s+/g, "_")}_${dateStr}.pdf`,
        orientation: "portrait",
      });
      SucessMessage("Folha de presenças transferida em PDF com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF da folha de presença:", err);
      ErrorMessage("Erro ao gerar o ficheiro PDF da folha de presenças.");
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
      title="Exportar Folha Oficial de Presenças (PDF)"
      description="Documento administrativo oficial de registo diário de assiduidade e controlo do ponto letivo."
      className="w-full sm:max-w-5xl"
    >
      <div className="space-y-4">
        {/* Folha Oficial A4 Retrato */}
        <div className="overflow-x-auto rounded-xl border border-border bg-slate-200/70 p-2 sm:p-5 dark:bg-slate-950/80 shadow-inner">
          <div
            id="attendance-official-print-sheet"
            className="mx-auto w-full max-w-[850px] bg-white p-8 text-black shadow-md font-sans"
            style={{ minHeight: "950px", color: "#000000", backgroundColor: "#ffffff" }}
          >
            {/* 1. CABEÇALHO OFICIAL */}
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
                  FOLHA OFICIAL DE REGISTO DE ASSIDUIDADE E PONTO LECTIVO
                </h2>
                <div className="text-[10px] font-bold text-black uppercase tracking-wide">
                  DIÁRIO DE CLASSE • CONTROLO DE FREQUÊNCIA E OCORRÊNCIAS
                </div>
              </div>
            </div>

            {/* 2. GRELHA DE METADADOS DA AULA */}
            <div className="grid grid-cols-4 border-b-2 border-black text-xs font-semibold text-black divide-x divide-black bg-slate-50/50">
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Ano Letivo</span>
                <span className="font-bold text-black text-xs">{displayYear}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Turma</span>
                <span className="font-bold text-black text-xs">{turmaName || "Turma"}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Disciplina</span>
                <span className="font-bold text-black text-xs">{subjectName}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Data da Aula</span>
                <span className="font-bold text-black text-xs">{formatDate(dateStr)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b-2 border-black text-xs font-semibold text-black divide-x divide-black bg-slate-50/30">
              <div className="py-1.5 px-3 text-center">
                <span className="text-[9px] font-bold uppercase text-black/60 mr-1.5">Horário / Tempo:</span>
                <span className="font-mono text-black text-xs">{horarioLabel}</span>
              </div>
              <div className="py-1.5 px-3 text-center">
                <span className="text-[9px] font-bold uppercase text-black/60 mr-1.5">Sala:</span>
                <span className="font-mono text-black text-xs">{roomCode || "Sala 04"}</span>
              </div>
              <div className="py-1.5 px-3 text-center">
                <span className="text-[9px] font-bold uppercase text-black/60 mr-1.5">Docente Regente:</span>
                <span className="text-black text-xs">{teacherName || "Corpo Docente"}</span>
              </div>
            </div>

            {/* 3. TABELA FORMAL DE CHAMADA E PRESENÇAS */}
            <div className="mt-4">
              <table className="w-full border-collapse border-2 border-black text-black text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-black text-center text-[10px]">
                    <th className="border-r border-black p-1.5 w-8 text-center">N.º</th>
                    <th className="border-r border-black p-1.5 w-20 text-center font-mono">Processo</th>
                    <th className="border-r border-black p-1.5 text-left min-w-[200px]">Nome do Estudante</th>
                    <th className="border-r border-black p-1.5 w-32 text-center font-bold">Estado de Presença</th>
                    <th className="border-r border-black p-1.5 text-left min-w-[140px]">Justificação / Ocorrência</th>
                    <th className="p-1.5 w-24 text-center font-bold">Rubrica / Visto</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-black/60 italic text-xs">
                        Nenhum estudante registado na chamada desta turma.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr
                        key={student.studentId || idx}
                        className={`border-b last:border-b-0 border-black ${idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}`}
                      >
                        <td className="border-r border-black py-1.5 px-1 text-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black py-1.5 px-1 text-center font-mono text-[10px] text-black/80">
                          {student.studentNumber || `P-${1000 + idx + 1}`}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 font-semibold text-[11px] uppercase tracking-tight text-black">
                          {student.name}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 text-center text-[10px] font-bold uppercase tracking-tight">
                          {student.status ? (
                            <span
                              className={
                                student.status === "ABSENT_UNJUSTIFIED"
                                  ? "underline font-black text-black"
                                  : "text-black"
                              }
                            >
                              {STATUS_TEXT[student.status] || student.status}
                            </span>
                          ) : (
                            <span className="text-black/50 italic">Não Marcado</span>
                          )}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 text-[10px] text-black/80">
                          {student.note || "—"}
                        </td>
                        <td className="py-1.5 px-1 text-center text-[10px] text-black/30 font-mono">
                          __________
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SÍNTESE ESTATÍSTICA DO TEMPO LECTIVO */}
            <div className="mt-4 border-2 border-black bg-slate-50 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-black border-b border-black pb-1 mb-2">
                RESUMO DE ASSIDUIDADE DO TEMPO LECTIVO
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold text-black divide-x divide-black/30">
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Total de Estudantes</span>
                  <span className="font-black text-sm">{stats.total}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Presentes / Atrasos</span>
                  <span className="font-black text-sm">{stats.present}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Faltas Justificadas</span>
                  <span className="font-black text-sm">{stats.justified}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Faltas Injustificadas</span>
                  <span className="font-black text-sm">{stats.unjustified}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-black/70 uppercase">Taxa de Assiduidade</span>
                  <span className="font-black text-sm">{stats.classRate}%</span>
                </div>
              </div>
            </div>

            {/* 5. TERMO DE HOMOLOGAÇÃO E ASSINATURAS */}
            <div className="mt-3.5 text-justify text-[10px] leading-relaxed text-black indent-4">
              Certifico que a presente folha de chamada e registo de ponto corresponde com absoluta veracidade às presenças, ausências e ocorrências verificadas no tempo letivo acima identificado, em conformidade com o regulamento interno da instituição e normas do Ministério da Educação.
            </div>

            <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-center text-xs text-black">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-black mb-1.5" />
                <span className="font-bold text-[10px] uppercase">O Delegado de Turma</span>
                <span className="text-[9px] text-black/70 mt-0.5">Representação Estudantil</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-black mb-1.5" />
                <span className="font-bold text-[10px] uppercase">O Professor da Disciplina</span>
                <span className="text-[9px] text-black/70 mt-0.5">{teacherName || "Docente Regente"}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-black mb-1.5" />
                <span className="font-bold text-[10px] uppercase">A Coordenação de Turno</span>
                <span className="text-[9px] text-black/70 mt-0.5">{profile.pedagogicDirectorName || "Visto da Direção"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <span>
              A folha oficial de presenças será exportada diretamente em formato PDF (A4 Retrato).
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
              <span>Baixar Folha (PDF)</span>
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #attendance-official-print-sheet,
          #attendance-official-print-sheet * {
            visibility: visible !important;
          }
          #attendance-official-print-sheet {
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
