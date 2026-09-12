"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
} from "@/components";
import { useTimetableStore } from "@/stores/school/timetable-store";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { DayOfWeek, Shift, TimeSlotDefinition } from "@/types";

interface TimetablePrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  shift: Shift;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 1, label: "2ª Feira" },
  { key: 2, label: "3ª Feira" },
  { key: 3, label: "4ª Feira" },
  { key: 4, label: "5ª Feira" },
  { key: 5, label: "6ª Feira" },
];

export function TimetablePrintModal({
  open,
  onOpenChange,
  classId,
  className,
  shift,
}: TimetablePrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { entries, morningSlots, afternoonSlots } = useTimetableStore();
  const { profile } = useSchoolSettingsStore();

  const classEntries = entries.filter((e) => e.classId === classId);
  const slotsForShift: TimeSlotDefinition[] =
    shift === "MORNING" ? morningSlots : afternoonSlots;

  // Collect unique subjects and teachers for the class
  const legendMap = new Map<string, { subject: string; teacher: string; room: string }>();
  classEntries.forEach((e) => {
    if (!legendMap.has(e.subjectName)) {
      legendMap.set(e.subjectName, {
        subject: e.subjectName,
        teacher: e.teacherName,
        room: e.roomName,
      });
    }
  });
  const legend = Array.from(legendMap.values());

  const shiftLabel =
    shift === "MORNING" ? "Manhã (07:30 - 12:45)" : shift === "AFTERNOON" ? "Tarde (13:00 - 18:15)" : "Noite";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name={"Printer" as any} className="size-4 text-primary" />
            Pré-visualização para Impressão do Horário Escolar
          </DialogTitle>
          <Button onClick={handlePrint} size="sm" className="gap-1.5 mr-6">
            <Icon name={"Printer" as any} className="size-3.5" />
            Imprimir Horário A4
          </Button>
        </DialogHeader>

        {/* Printable Paper Canvas */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 rounded-lg border border-slate-200 shadow-xs space-y-6 font-sans print:p-0 print:border-0 print:shadow-none"
        >
          {/* Official Republic & School Header */}
          <div className="text-center space-y-1 border-b pb-4 border-slate-300">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              REPÚBLICA DE ANGOLA
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              GOVERNO PROVINCIAL DE LUANDA • DIRECÇÃO MUNICIPAL DA EDUCAÇÃO
            </div>
            <div className="text-base font-black uppercase text-slate-900 pt-1">
              {profile.schoolName || "COLÉGIO PRIVADO MINDSCHOOL"}
            </div>
            <div className="text-[11px] text-slate-500">
              {profile.decreeNumber || "Decreto Executivo n.º 148/18"} • NIF: {profile.taxNumber || "5417082910"} • {profile.fullAddress}
            </div>
          </div>

          {/* Timetable Subtitle info */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 bg-slate-100 rounded border border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-700">TURMA:</span>{" "}
              <strong className="text-slate-900 uppercase">{className}</strong>
            </div>
            <div>
              <span className="font-semibold text-slate-700">TURNO:</span>{" "}
              <span className="text-slate-900">{shiftLabel}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">ANO LECTIVO:</span>{" "}
              <span className="text-slate-900">2025 / 2026</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">SALA DE AULAS:</span>{" "}
              <span className="text-slate-900 font-medium">Sala 14 - Bloco B</span>
            </div>
          </div>

          {/* Grid Table */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-200/80 border-b border-slate-300 text-slate-800 font-medium uppercase text-[11px]">
                  <th className="px-3 py-2 text-center w-28 border-r border-slate-300">Horário</th>
                  {DAYS.map((d) => (
                    <th key={d.key} className="px-3 py-2 text-center border-r border-slate-300 last:border-r-0">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {slotsForShift.map((slot: TimeSlotDefinition) => (
                  <tr key={slot.id} className="min-h-[55px]">
                    <td className="px-2 py-2 text-center bg-slate-50 border-r border-slate-300 font-medium text-slate-700">
                      <div className="text-[11px] font-medium">{slot.slotNumber}º Tempo</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </td>
                    {DAYS.map((d) => {
                      const entry = classEntries.find(
                        (e) => e.dayOfWeek === d.key && e.slotNumber === slot.slotNumber
                      );
                      return (
                        <td
                          key={d.key}
                          className="px-2 py-2 border-r border-slate-300 last:border-r-0 align-middle text-center"
                        >
                          {entry ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-slate-900 text-xs leading-tight">
                                {entry.subjectName}
                              </div>
                              <div className="text-[10px] text-slate-600 truncate">
                                {entry.teacherName}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                {entry.roomName}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-300 italic">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subjects & Teachers Legend Table */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
              Quadro de Disciplinas e Corpo Docente
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
              {legend.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                  <span className="font-semibold text-slate-800">{item.subject}:</span>
                  <span className="text-slate-600">{item.teacher} ({item.room})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & Official Stamping Block */}
          <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
            <div className="space-y-10">
              <div className="text-slate-600">O Coordenador Pedagógico</div>
              <div className="border-t border-slate-400 mx-8 pt-1 text-[11px] font-semibold text-slate-800">
                {profile.pedagogicDirectorName || "Profª. Maria Teresa Diogo da Silva"}
              </div>
            </div>
            <div className="space-y-10">
              <div className="text-slate-600">O Director Geral do Colégio</div>
              <div className="border-t border-slate-400 mx-8 pt-1 text-[11px] font-semibold text-slate-800">
                {profile.directorGeneralName || "Dr. Alberto Manuel Domingos"}
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-4">
            Emitido via Sistema Integrado MindSchool em {new Date().toLocaleDateString("pt-PT")}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Icon name={"Printer" as any} className="size-3.5" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
