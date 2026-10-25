"use client";

import React, { useMemo, useState } from "react";
import {
  GlobalModal,
  Button,
  FormSelect,
  Icon,
  Input,
  Badge,
  type TimetableSlot,
} from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import type { AcademicSection } from "@/types";
import type { ApiEntry } from "@/services/timetables-service";
import { downloadElementAsPdf } from "@/utils/export-pdf";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";

interface TimetableExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: AcademicSection[];
  activeSectionId?: string;
  entries: ApiEntry[];
  slots: TimetableSlot[];
  academicYear?: string;
}

const WEEKDAY_NAMES = [
  { value: 1, label: "Segunda-Feira", short: "Seg" },
  { value: 2, label: "Terça-Feira", short: "Ter" },
  { value: 3, label: "Quarta-Feira", short: "Qua" },
  { value: 4, label: "Quinta-Feira", short: "Qui" },
  { value: 5, label: "Sexta-Feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

function toMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const [h = 0, m = 0] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function TimetableExportModal({
  isOpen,
  onClose,
  sections,
  activeSectionId,
  entries,
  slots,
  academicYear,
}: TimetableExportModalProps) {
  const { profile, calendar } = useSchoolSettingsStore();

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    activeSectionId || sections[0]?.id || "",
  );
  const [includeSaturday, setIncludeSaturday] = useState<boolean>(true);
  const [periodLabel, setPeriodLabel] = useState<string>("1º Semestre");
  const [courseSubtitle, setCourseSubtitle] = useState<string>("");

  // Sincronizar turma ativa se mudar
  React.useEffect(() => {
    if (activeSectionId) {
      setSelectedSectionId(activeSectionId);
    }
  }, [activeSectionId]);

  const currentSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) || sections[0],
    [sections, selectedSectionId],
  );

  // Inicializar subtítulo do curso baseado na turma
  React.useEffect(() => {
    if (currentSection) {
      const isHigherOrTechnical =
        currentSection.cycle === "UPPER_SECONDARY" ||
        currentSection.classLevel?.toLowerCase().includes("ano") ||
        currentSection.name?.toLowerCase().includes("licenciatura");
      const prefix = isHigherOrTechnical ? "Curso / Licenciatura: " : "Classe / Ciclo: ";
      setCourseSubtitle(`${prefix}${currentSection.name || currentSection.classLevel}`);
    }
  }, [currentSection]);

  // Aulas da turma seleccionada
  const sectionEntries = useMemo(() => {
    if (!currentSection) return [];
    return entries.filter((e) => e.section.id === currentSection.id);
  }, [entries, currentSection]);

  // Dias da semana visíveis (Segunda a Sexta ou Segunda a Sábado)
  const visibleDays = useMemo(() => {
    return includeSaturday ? WEEKDAY_NAMES : WEEKDAY_NAMES.slice(0, 5);
  }, [includeSaturday]);

  // Construir a grelha de intervalos de tempo ordenados
  const timeIntervals = useMemo(() => {
    const intervalsMap = new Map<string, { start: string; end: string; startMin: number; endMin: number }>();

    // 1. Tempos da grelha padrão
    slots
      .filter((s) => s.kind === "aula")
      .forEach((s) => {
        const key = `${s.start}-${s.end}`;
        intervalsMap.set(key, {
          start: s.start,
          end: s.end,
          startMin: toMinutes(s.start),
          endMin: toMinutes(s.end),
        });
      });

    // 2. Horários das aulas já cadastradas (caso haja aulas dinâmicas ou livres)
    sectionEntries.forEach((e) => {
      const key = `${e.start}-${e.end}`;
      if (!intervalsMap.has(key)) {
        intervalsMap.set(key, {
          start: e.start,
          end: e.end,
          startMin: toMinutes(e.start),
          endMin: toMinutes(e.end),
        });
      }
    });

    const list = Array.from(intervalsMap.values());
    list.sort((a, b) => a.startMin - b.startMin);
    return list;
  }, [slots, sectionEntries]);

  // Mapear cada célula [intervalo x dia] com a aula correspondente
  const findEntryForCell = (interval: { start: string; end: string; startMin: number; endMin: number }, weekday: number) => {
    return sectionEntries.find((e) => {
      if (e.weekday !== weekday) return false;
      const eStart = toMinutes(e.start);
      const eEnd = toMinutes(e.end);
      // Coincide exato ou sobrepõe maioritariamente o intervalo
      return (e.start === interval.start && e.end === interval.end) || (eStart <= interval.startMin && eEnd >= interval.endMin);
    });
  };

  // Mapear lista única de disciplinas e professores para a legenda
  const legendItems = useMemo(() => {
    const map = new Map<string, { subject: string; teacher: string }>();
    sectionEntries.forEach((e) => {
      if (!map.has(e.subject.name)) {
        map.set(e.subject.name, {
          subject: e.subject.name,
          teacher: e.teacher.full_name,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [sectionEntries]);

  // Dividir legenda em 2 colunas equilibradas
  const legendColumns = useMemo(() => {
    const mid = Math.ceil(legendItems.length / 2);
    return {
      left: legendItems.slice(0, mid),
      right: legendItems.slice(mid),
    };
  }, [legendItems]);

  const displayYear = academicYear || currentSection?.academicYear || calendar.academicYear || "2026/2027";
  const displayClassLevel = currentSection?.classLevel || "2º Ano";
  const displaySectionName = currentSection?.name || "T2";

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadElementAsPdf("timetable-print-sheet", {
        filename: `Horario_${displayClassLevel.replace(/\s+/g, "_")}_${displaySectionName}_${displayYear.replace(/\//g, "-")}.pdf`,
        orientation: "landscape",
      });
      SucessMessage("Horário transferido em PDF com sucesso!");
    } catch {
      ErrorMessage("Erro ao gerar o ficheiro PDF do horário.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title="Exportar Horário Semanal (PDF)"
      description="Pré-visualize e transfira o horário semanal formatado no padrão institucional"
      className="w-full sm:max-w-5xl"
    >
      <div className="space-y-4">
        {/* Barra de Configurações do Exportador */}
        <div className="p-3 rounded-xl border bg-muted/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-1">
            <FormSelect
              label="Turma"
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              options={sections.map((s) => ({
                value: s.id,
                label: `${s.classLevel} ${s.name} (${s.shift})`,
              }))}
            />
          </div>

          <div>
            <Input
              label="Período Letivo"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              placeholder="Ex: 1º Semestre ou 1.º Trimestre"
            />
          </div>

          <div>
            <Input
              label="Cabeçalho / Curso"
              value={courseSubtitle}
              onChange={(e) => setCourseSubtitle(e.target.value)}
              placeholder="Ex: Licenciatura: Informática..."
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSaturday}
                onChange={(e) => setIncludeSaturday(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
              />
              <span>Incluir Sábado</span>
            </label>
          </div>
        </div>

        {/* Pré-visualização da Folha Imprimível (A4 Paisagem) */}
        <div className="overflow-x-auto rounded-xl border border-border bg-slate-100 p-2 sm:p-4 dark:bg-slate-900/60">
          <div
            id="timetable-print-sheet"
            className="mx-auto w-full max-w-[960px] bg-white p-6 text-black shadow-sm font-sans"
            style={{ minHeight: "560px" }}
          >
            {/* 1. CABEÇALHO INSTITUCIONAL */}
            <div className="flex items-center justify-between pb-4 border-b border-black/20">
              {/* Logotipo à Esquerda */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-black text-white flex items-center justify-center font-black text-xl tracking-tighter shrink-0">
                  {profile.schoolName?.substring(0, 4).toUpperCase() || "ISAF"}
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-sm tracking-tight text-black">
                    {profile.schoolName?.substring(0, 4).toUpperCase() || "ISAF"}
                  </div>
                  <div className="text-[10px] uppercase text-black/70 font-semibold tracking-wide">
                    {profile.schoolName || "Instituto Superior de Administração e Finanças"}
                  </div>
                </div>
              </div>

              {/* Título Central / Direita */}
              <div className="text-right leading-snug">
                <h1 className="text-base font-bold text-black uppercase tracking-tight">
                  {profile.schoolName || "Instituto Superior de Administração e Finanças"}
                </h1>
                <p className="text-xs font-semibold text-black/80 mt-0.5">
                  {courseSubtitle || "Licenciatura: Informática de Gestão Financeira"}
                </p>
              </div>
            </div>

            {/* 2. BARRA DE METADADOS */}
            <div className="flex items-center justify-between text-xs font-bold text-black py-2.5 px-1 border-b border-black">
              <div>
                <span>Ano Académico: </span>
                <span className="font-normal">{displayYear}</span>
              </div>
              <div>{periodLabel}</div>
              <div>{displayClassLevel}</div>
              <div>
                <span>Turma: </span>
                <span>{displaySectionName}</span>
              </div>
            </div>

            {/* 3. GRELHA HORÁRIA PRINCIPAL (ESTILO TABELA RÍGIDA COM BORDAS PRETAS) */}
            <div className="mt-3 overflow-hidden border-2 border-black">
              <table className="w-full border-collapse text-black text-center text-xs">
                <thead>
                  <tr className="bg-slate-100/60 font-bold border-b border-black">
                    <th className="w-20 border-r border-black p-1 text-[11px] text-center font-semibold">
                      Horas
                    </th>
                    {visibleDays.map((d) => (
                      <th
                        key={d.value}
                        className="border-r last:border-r-0 border-black p-1.5 text-center font-bold text-xs"
                      >
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeIntervals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleDays.length + 1}
                        className="p-8 text-center text-black/60 italic text-xs"
                      >
                        Sem tempos de aula configurados nesta turma.
                      </td>
                    </tr>
                  ) : (
                    timeIntervals.map((interval, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 border-black">
                        {/* Coluna de Horas: Horário inicial e final empilhados */}
                        <td className="w-20 border-r border-black py-1.5 px-1 font-mono font-bold text-xs leading-tight bg-slate-50/50">
                          <div>{interval.start}</div>
                          <div className="text-[11px] text-black/80">{interval.end}</div>
                        </td>

                        {/* Células por Dia da Semana */}
                        {visibleDays.map((day) => {
                          const entry = findEntryForCell(interval, day.value);
                          return (
                            <td
                              key={day.value}
                              className="border-r last:border-r-0 border-black p-0 align-top h-14"
                            >
                              {entry ? (
                                <div className="h-full flex flex-col justify-between">
                                  {/* Disciplina */}
                                  <div className="p-1 font-bold text-xs text-black leading-tight flex-1 flex items-center justify-center">
                                    {entry.subject.name}
                                  </div>
                                  {/* Linha separadora e Código da Sala */}
                                  <div className="border-t border-black text-[10px] font-semibold py-0.5 bg-slate-50/80 text-black">
                                    {entry.room?.code || entry.location_label || "—"}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full w-full" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. LEGENDA DE DISCIPLINAS E PROFESSORES (RODAPÉ) */}
            {legendItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-black/40 text-[11px] text-black">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  {/* Coluna Esquerda */}
                  <div className="space-y-1">
                    {legendColumns.left.map((item, i) => (
                      <div key={i} className="flex justify-between items-baseline gap-2">
                        <span className="font-semibold text-black">{item.subject}</span>
                        <span className="text-black/90 font-medium text-right">{item.teacher}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coluna Direita */}
                  <div className="space-y-1">
                    {legendColumns.right.map((item, i) => (
                      <div key={i} className="flex justify-between items-baseline gap-2">
                        <span className="font-semibold text-black">{item.subject}</span>
                        <span className="text-black/90 font-medium text-right">{item.teacher}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <span>
              O horário semanal será gerado e transferido diretamente em formato PDF (A4 Paisagem).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="gap-2 bg-primary text-primary-foreground"
            >
              {isDownloading ? (
                <Icon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon name="Download" className="w-4 h-4" />
              )}
              <span>Baixar PDF</span>
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
          #timetable-print-sheet,
          #timetable-print-sheet * {
            visibility: visible !important;
          }
          #timetable-print-sheet {
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
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </GlobalModal>
  );
}
