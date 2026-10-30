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
  const horarioLabel = lessonStart && lessonEnd ? `${lessonStart} – ${lessonEnd}` : "—";

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
      size="5xl"
    >
      <div className="space-y-4">
        {/* Folha Oficial A4 Retrato */}
        <div className="overflow-x-auto rounded-xs border border-border bg-slate-200/70 p-2 shadow-inner sm:p-5 dark:bg-slate-950/80">
          <div
            id="attendance-official-print-sheet"
            className="mx-auto w-full max-w-[850px] bg-white p-8 font-sans text-black shadow-md"
            style={{ minHeight: "950px", color: "#000000", backgroundColor: "#ffffff" }}
          >
            {/* 1. CABEÇALHO OFICIAL */}
            <div className="border-b-2 border-black pb-4 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-black">
                REPÚBLICA DE ANGOLA
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-black/80">
                MINISTÉRIO DA EDUCAÇÃO
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-black/70">
                {governmentLine(profile, "DIRECÇÃO MUNICIPAL DA EDUCAÇÃO DE")}
              </div>

              <div className="mt-2.5">
                <h1 className="font-serif text-base font-black uppercase tracking-tight text-black">
                  {profile.schoolName}
                </h1>
                {profile.subTitle && <p className="text-[10px] font-medium uppercase text-black/80">{profile.subTitle}</p>}
                <p className="mt-0.5 font-mono text-[9px] text-black/60">{registrationLine(profile)}</p>
              </div>

              <div className="mt-3.5 inline-block border-y-2 border-black px-8 py-1">
                <h2 className="text-sm font-black uppercase tracking-wider text-black">
                  FOLHA OFICIAL DE REGISTO DE ASSIDUIDADE E PONTO LETIVO
                </h2>
                <div className="text-[10px] font-bold uppercase tracking-wide text-black">
                  DIÁRIO DE CLASSE • CONTROLO DE FREQUÊNCIA E OCORRÊNCIAS
                </div>
              </div>
            </div>

            {/* 2. GRELHA DE METADADOS DA AULA */}
            <div className="grid grid-cols-4 divide-x divide-black border-b-2 border-black bg-slate-50/50 text-xs font-semibold text-black">
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Ano Letivo</span>
                <span className="text-xs font-bold text-black">{displayYear}</span>
              </div>
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Turma</span>
                <span className="text-xs font-bold text-black">{turmaName || "Turma"}</span>
              </div>
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Disciplina</span>
                <span className="text-xs font-bold text-black">{subjectName}</span>
              </div>
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-bold uppercase text-black/60">Data da Aula</span>
                <span className="text-xs font-bold text-black">{formatDate(dateStr)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-black border-b-2 border-black bg-slate-50/30 text-xs font-semibold text-black">
              <div className="px-3 py-1.5 text-center">
                <span className="mr-1.5 text-[9px] font-bold uppercase text-black/60">Horário / Tempo:</span>
                <span className="font-mono text-xs text-black">{horarioLabel}</span>
              </div>
              <div className="px-3 py-1.5 text-center">
                <span className="mr-1.5 text-[9px] font-bold uppercase text-black/60">Sala:</span>
                <span className="font-mono text-xs text-black">{roomCode || "—"}</span>
              </div>
              <div className="px-3 py-1.5 text-center">
                <span className="mr-1.5 text-[9px] font-bold uppercase text-black/60">Docente Regente:</span>
                <span className="text-xs text-black">{teacherName || "—"}</span>
              </div>
            </div>

            {/* 3. TABELA FORMAL DE CHAMADA E PRESENÇAS */}
            <div className="mt-4">
              <table className="w-full border-collapse border-2 border-black text-xs text-black">
                <thead>
                  <tr className="border-b border-black bg-slate-100 text-center text-[10px] font-bold">
                    <th className="w-8 border-r border-black p-1.5 text-center">N.º</th>
                    <th className="w-20 border-r border-black p-1.5 text-center font-mono">Processo</th>
                    <th className="min-w-[200px] border-r border-black p-1.5 text-left">Nome do Estudante</th>
                    <th className="w-32 border-r border-black p-1.5 text-center font-bold">Estado de Presença</th>
                    <th className="min-w-[140px] border-r border-black p-1.5 text-left">Justificação / Ocorrência</th>
                    <th className="w-24 p-1.5 text-center font-bold">Rubrica / Visto</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs italic text-black/60">
                        Nenhum estudante registado na chamada desta turma.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr
                        key={student.studentId || idx}
                        className={`border-b border-black last:border-b-0 ${idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}`}
                      >
                        <td className="border-r border-black px-1 py-1.5 text-center font-mono text-[10px] font-bold">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black px-1 py-1.5 text-center font-mono text-[10px] text-black/80">
                          {student.studentNumber || "—"}
                        </td>
                        <td className="border-r border-black px-2 py-1.5 text-[11px] font-semibold uppercase tracking-tight text-black">
                          {student.name}
                        </td>
                        <td className="border-r border-black px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-tight">
                          {student.status ? (
                            <span
                              className={
                                student.status === "ABSENT_UNJUSTIFIED"
                                  ? "font-black text-black underline"
                                  : "text-black"
                              }
                            >
                              {STATUS_TEXT[student.status] || student.status}
                            </span>
                          ) : (
                            <span className="italic text-black/50">Não Marcado</span>
                          )}
                        </td>
                        <td className="border-r border-black px-2 py-1.5 text-[10px] text-black/80">
                          {student.note?.trim() || "—"}
                        </td>
                        <td className="px-1 py-1.5 text-center font-mono text-[10px] text-black/30">
                          __________
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SÍNTESE ESTATÍSTICA DO TEMPO LETIVO */}
            <div className="mt-4 border-2 border-black bg-slate-50 p-2.5">
              <div className="mb-2 border-b border-black pb-1 text-[10px] font-bold uppercase tracking-wider text-black">
                RESUMO DE ASSIDUIDADE DO TEMPO LETIVO
              </div>
              <div className="grid grid-cols-5 gap-2 divide-x divide-black/30 text-center text-xs font-semibold text-black">
                <div>
                  <span className="block text-[9px] uppercase text-black/70">Total de Estudantes</span>
                  <span className="text-sm font-black">{stats.total}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-black/70">Presentes / Atrasos</span>
                  <span className="text-sm font-black">{stats.present}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-black/70">Faltas Justificadas</span>
                  <span className="text-sm font-black">{stats.justified}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-black/70">Faltas Injustificadas</span>
                  <span className="text-sm font-black">{stats.unjustified}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-black/70">Taxa de Assiduidade</span>
                  <span className="text-sm font-black">{stats.classRate}%</span>
                </div>
              </div>
            </div>

            {/* 5. TERMO DE HOMOLOGAÇÃO E ASSINATURAS */}
            <div className="mt-3.5 text-justify indent-4 text-[10px] leading-relaxed text-black">
              Certifico que a presente folha de chamada e registo de ponto corresponde com absoluta veracidade às presenças, ausências e ocorrências verificadas no tempo letivo acima identificado, em conformidade com o regulamento interno da instituição e normas do Ministério da Educação.
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 pt-4 text-center text-xs text-black">
              <div className="flex flex-col items-center">
                <div className="mb-1.5 w-48 border-b border-black" />
                <span className="text-[10px] font-bold uppercase">O Delegado de Turma</span>
                <span className="mt-0.5 text-[9px] text-black/70">Representação Estudantil</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1.5 w-48 border-b border-black" />
                <span className="text-[10px] font-bold uppercase">O Professor da Disciplina</span>
                <span className="mt-0.5 text-[9px] text-black/70">{teacherName || "Docente Regente"}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1.5 w-48 border-b border-black" />
                <span className="text-[10px] font-bold uppercase">A Coordenação de Turno</span>
                <span className="mt-0.5 text-[9px] text-black/70">{profile.pedagogicDirectorName || "Visto da Direção"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="Info" className="size-4 text-primary" />
            <span>
              A folha oficial de presenças será exportada diretamente em formato PDF (A4 Retrato).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-1.5">
              <Icon name="Printer" className="size-4" />
              <span>Imprimir</span>
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-1.5"
            >
              {isDownloading ? (
                <Icon name="Loader2" className="size-4 animate-spin" />
              ) : (
                <Icon name="Download" className="size-4" />
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
