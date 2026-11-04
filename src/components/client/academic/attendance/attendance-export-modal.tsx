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
      description="Documento administrativo oficial de registo diário de assiduidade e controlo do ponto lectivo."
      size="5xl"
    >
      <div className="space-y-4">
        {/* Folha Oficial A4 Retrato */}
        <div className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-2 shadow-inner sm:p-5">
          <div
            id="attendance-official-print-sheet"
            className="mx-auto w-full max-w-[850px] bg-card p-8 font-sans text-card-foreground border border-border shadow-md print:bg-white print:text-black print:border-black"
            style={{ minHeight: "950px" }}
          >
            {/* 1. CABEÇALHO OFICIAL */}
            <div className="border-b-2 border-border pb-4 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
                REPÚBLICA DE ANGOLA
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                MINISTÉRIO DA EDUCAÇÃO
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {governmentLine(profile, "DIRECÇÃO MUNICIPAL DA EDUCAÇÃO DE")}
              </div>

              <div className="mt-2.5">
                <h1 className="font-serif text-base font-semibold uppercase tracking-tight text-foreground">
                  {profile.schoolName}
                </h1>
                {profile.subTitle && <p className="text-[10px] font-medium uppercase text-muted-foreground">{profile.subTitle}</p>}
                <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{registrationLine(profile)}</p>
              </div>

              <div className="mt-3.5 inline-block border-y-2 border-border px-8 py-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  FOLHA OFICIAL DE REGISTO DE ASSIDUIDADE E PONTO LECTIVO
                </h2>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  DIÁRIO DE CLASSE • CONTROLO DE FREQUÊNCIA E OCORRÊNCIAS
                </div>
              </div>
            </div>

            {/* 2. GRELHA DE METADADOS DA AULA */}
            <div className="grid grid-cols-4 divide-x divide-border border-b-2 border-border bg-muted/40 text-xs font-semibold text-foreground">
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Ano Lectivo</span>
                <span className="text-xs font-semibold text-foreground">{displayYear}</span>
              </div>
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Turma</span>
                <span className="text-xs font-semibold text-foreground">{turmaName || "Turma"}</span>
              </div>
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Disciplina</span>
                <span className="text-xs font-semibold text-foreground">{subjectName}</span>
              </div>
              <div className="px-3 py-2 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Data da Aula</span>
                <span className="text-xs font-semibold text-foreground">{formatDate(dateStr)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border border-b-2 border-border bg-muted/30 text-xs font-semibold text-foreground">
              <div className="px-3 py-1.5 text-center">
                <span className="mr-1.5 text-[9px] font-semibold uppercase text-muted-foreground">Horário / Tempo:</span>
                <span className="font-mono text-xs text-foreground">{horarioLabel}</span>
              </div>
              <div className="px-3 py-1.5 text-center">
                <span className="mr-1.5 text-[9px] font-semibold uppercase text-muted-foreground">Sala:</span>
                <span className="font-mono text-xs text-foreground">{roomCode || "—"}</span>
              </div>
              <div className="px-3 py-1.5 text-center">
                <span className="mr-1.5 text-[9px] font-semibold uppercase text-muted-foreground">Docente Regente:</span>
                <span className="text-xs text-foreground">{teacherName || "—"}</span>
              </div>
            </div>

            {/* 3. TABELA FORMAL DE CHAMADA E PRESENÇAS */}
            <div className="mt-4">
              <table className="w-full border-collapse border-2 border-border text-xs text-foreground">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-center text-[10px] font-semibold">
                    <th className="w-8 border-r border-border p-1.5 text-center">N.º</th>
                    <th className="w-20 border-r border-border p-1.5 text-center font-mono">Processo</th>
                    <th className="min-w-[200px] border-r border-border p-1.5 text-left">Nome do Estudante</th>
                    <th className="w-32 border-r border-border p-1.5 text-center font-semibold">Estado de Presença</th>
                    <th className="min-w-[140px] border-r border-border p-1.5 text-left">Justificação / Ocorrência</th>
                    <th className="w-24 p-1.5 text-center font-semibold">Rubrica / Visto</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs italic text-muted-foreground">
                        Nenhum estudante registado na chamada desta turma.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr
                        key={student.studentId || idx}
                        className={`border-b border-border last:border-b-0 ${idx % 2 === 1 ? "bg-muted/30" : "bg-card"}`}
                      >
                        <td className="border-r border-border px-1 py-1.5 text-center font-mono text-[10px] font-semibold">
                          {idx + 1}
                        </td>
                        <td className="border-r border-border px-1 py-1.5 text-center font-mono text-[10px] text-muted-foreground">
                          {student.studentNumber || "—"}
                        </td>
                        <td className="border-r border-border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-tight text-foreground">
                          {student.name}
                        </td>
                        <td className="border-r border-border px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-tight">
                          {student.status ? (
                            <span
                              className={
                                student.status === "ABSENT_UNJUSTIFIED"
                                  ? "font-semibold text-destructive underline"
                                  : "text-foreground"
                              }
                            >
                              {STATUS_TEXT[student.status] || student.status}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground">Não Marcado</span>
                          )}
                        </td>
                        <td className="border-r border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                          {student.note?.trim() || "—"}
                        </td>
                        <td className="px-1 py-1.5 text-center font-mono text-[10px] text-muted-foreground/40">
                          __________
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SÍNTESE ESTATÍSTICA DO TEMPO LETIVO */}
            <div className="mt-4 border-2 border-border bg-muted/40 p-2.5 rounded-md">
              <div className="mb-2 border-b border-border pb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                RESUMO DE ASSIDUIDADE DO TEMPO LETIVO
              </div>
              <div className="grid grid-cols-5 gap-2 divide-x divide-border text-center text-xs font-semibold text-foreground">
                <div>
                  <span className="block text-[9px] uppercase text-muted-foreground">Total de Estudantes</span>
                  <span className="text-sm font-semibold">{stats.total}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-muted-foreground">Presentes / Atrasos</span>
                  <span className="text-sm font-semibold">{stats.present}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-muted-foreground">Faltas Justificadas</span>
                  <span className="text-sm font-semibold">{stats.justified}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-muted-foreground">Faltas Injustificadas</span>
                  <span className="text-sm font-semibold">{stats.unjustified}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-muted-foreground">Taxa de Assiduidade</span>
                  <span className="text-sm font-semibold">{stats.classRate}%</span>
                </div>
              </div>
            </div>

            {/* 5. TERMO DE HOMOLOGAÇÃO E ASSINATURAS */}
            <div className="mt-3.5 text-justify indent-4 text-[10px] leading-relaxed text-muted-foreground">
              Certifico que a presente folha de chamada e registo de ponto corresponde com absoluta veracidade às presenças, ausências e ocorrências verificadas no tempo lectivo acima identificado, em conformidade com o regulamento interno da instituição e normas do Ministério da Educação.
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 pt-4 text-center text-xs text-foreground">
              <div className="flex flex-col items-center">
                <div className="mb-1.5 w-48 border-b border-border" />
                <span className="text-[10px] font-semibold uppercase">O Delegado de Turma</span>
                <span className="mt-0.5 text-[9px] text-muted-foreground">Representação Estudantil</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1.5 w-48 border-b border-border" />
                <span className="text-[10px] font-semibold uppercase">O Professor da Disciplina</span>
                <span className="mt-0.5 text-[9px] text-muted-foreground">{teacherName || "Docente Regente"}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-1.5 w-48 border-b border-border" />
                <span className="text-[10px] font-semibold uppercase">A Coordenação de Turno</span>
                <span className="mt-0.5 text-[9px] text-muted-foreground">{profile.pedagogicDirectorName || "Visto da Direcção"}</span>
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
