"use client";

import React, { useState } from "react";
import { useTimetableStore } from "@/stores/school/timetable-store";
import { DayOfWeek, ClassScheduleEntry, TimeSlotDefinition, Shift } from "@/types";
import { Button, Badge, Icon } from "@/components";
import { ScheduleSlotModal } from "./schedule-slot-modal";

interface TimetableGridProps {
  classId: string;
  className: string;
  shift: Shift;
}

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 1, label: "Segunda-feira", short: "Seg" },
  { key: 2, label: "Terça-feira", short: "Ter" },
  { key: 3, label: "Quarta-feira", short: "Qua" },
  { key: 4, label: "Quinta-feira", short: "Qui" },
  { key: 5, label: "Sexta-feira", short: "Sex" },
];

export function TimetableGrid({ classId, className, shift }: TimetableGridProps) {
  const { entries, morningSlots, afternoonSlots, removeSlot } = useTimetableStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotState, setSelectedSlotState] = useState<{
    day: DayOfWeek;
    slot: TimeSlotDefinition;
  } | null>(null);

  const slotsForShift: TimeSlotDefinition[] =
    shift === "MORNING" ? morningSlots : afternoonSlots;

  const classEntries = entries.filter((e) => e.classId === classId);

  const handleOpenAdd = (day: DayOfWeek, slot: TimeSlotDefinition) => {
    setSelectedSlotState({ day, slot });
    setModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (confirm("Deseja remover este tempo lectivo do horário?")) {
      removeSlot(entryId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Grid container */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="w-32 px-4 py-3.5 text-center">Horário / Tempo</th>
              {DAYS.map((day) => (
                <th key={day.key} className="min-w-[180px] px-4 py-3.5 text-center">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {slotsForShift.map((slot) => {
              return (
                <tr key={slot.id} className="hover:bg-muted/10 transition-colors">
                  {/* Slot Header column */}
                  <td className="px-4 py-4 text-center bg-muted/20 border-r border-border font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-foreground">
                        {slot.slotNumber}º Tempo
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  </td>

                  {/* Day Columns */}
                  {DAYS.map((day) => {
                    const entry = classEntries.find(
                      (e) => e.dayOfWeek === day.key && e.slotNumber === slot.slotNumber
                    );

                    return (
                      <td
                        key={day.key}
                        className="px-2.5 py-2.5 border-r border-border last:border-r-0 align-top h-24"
                      >
                        {entry ? (
                          <div
                            onClick={() => handleOpenAdd(day.key, slot)}
                            className="group relative h-full flex flex-col justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-medium text-xs text-primary leading-tight line-clamp-1">
                                  {entry.subjectName}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, entry.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all rounded"
                                  title="Remover tempo"
                                >
                                  <Icon name={"Trash2" as any} className="size-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Icon name={"UserCheck" as any} className="size-3 shrink-0" />
                                <span className="truncate">{entry.teacherName}</span>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-border/40">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 font-normal bg-background/80">
                                <Icon name={"Building2" as any} className="size-2.5 mr-1" />
                                {entry.roomName}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {entry.academicYear}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleOpenAdd(day.key, slot)}
                            className="group h-full min-h-[80px] flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-all text-muted-foreground/40 hover:text-primary"
                          >
                            <Icon name={"Plus" as any} className="size-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] mt-1 font-medium hidden group-hover:inline">
                              Adicionar aula
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            Tempos Alocados: <strong className="text-foreground">{classEntries.length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/40" />
            Tempos Livres: <strong className="text-foreground">{slotsForShift.length * 5 - classEntries.length}</strong>
          </span>
        </div>
        <p className="italic">
          Clique num tempo vazio para programar aula ou num tempo preenchido para alterar/remover.
        </p>
      </div>

      {/* Add / Edit Slot Modal */}
      {selectedSlotState && (
        <ScheduleSlotModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          classId={classId}
          className={className}
          dayOfWeek={selectedSlotState.day}
          slot={selectedSlotState.slot}
        />
      )}
    </div>
  );
}
