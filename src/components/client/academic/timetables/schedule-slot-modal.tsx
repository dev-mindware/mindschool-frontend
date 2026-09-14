"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Icon,
} from "@/components";
import { useTimetableStore } from "@/stores/school";
import { DayOfWeek, DAY_OF_WEEK_LABELS, TimeSlotDefinition } from "@/types";
import { toast } from "sonner";

interface ScheduleSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: DayOfWeek;
  slot: TimeSlotDefinition;
  classId: string;
  className: string;
}

const AVAILABLE_SUBJECTS = [
  { id: "sub-1", name: "Matemática", color: "bg-blue-500/15 border-blue-500/30 text-blue-800" },
  { id: "sub-2", name: "Língua Portuguesa", color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-800" },
  { id: "sub-3", name: "Física", color: "bg-amber-500/15 border-amber-500/30 text-amber-800" },
  { id: "sub-4", name: "Química", color: "bg-primary/15 border-primary/30 text-primary" },
  { id: "sub-5", name: "Biologia", color: "bg-teal-500/15 border-teal-500/30 text-teal-800" },
  { id: "sub-6", name: "História", color: "bg-rose-500/15 border-rose-500/30 text-rose-800" },
  { id: "sub-7", name: "Geografia", color: "bg-indigo-500/15 border-indigo-500/30 text-indigo-800" },
  { id: "sub-8", name: "Língua Inglesa", color: "bg-cyan-500/15 border-cyan-500/30 text-cyan-800" },
  { id: "sub-9", name: "Educação Física", color: "bg-orange-500/15 border-orange-500/30 text-orange-800" },
  { id: "sub-10", name: "Informática & TIC", color: "bg-slate-500/15 border-slate-500/30 text-slate-800" },
];

const AVAILABLE_TEACHERS = [
  { id: "tea-1", name: "Prof. Manuel dos Santos", subject: "Matemática" },
  { id: "tea-2", name: "Profª. Teresa Silva", subject: "Língua Portuguesa" },
  { id: "tea-3", name: "Prof. Alberto Silva", subject: "Física" },
  { id: "tea-4", name: "Profª. Maria Afonso", subject: "Química" },
  { id: "tea-5", name: "Prof. Domingos Kiala", subject: "Biologia" },
  { id: "tea-6", name: "Profª. Ana Gaspar", subject: "História" },
  { id: "tea-7", name: "Prof. Lucas Varela", subject: "Geografia" },
  { id: "tea-8", name: "Prof. John Doe", subject: "Língua Inglesa" },
  { id: "tea-9", name: "Prof. Paulo Cassoma", subject: "Educação Física" },
  { id: "tea-10", name: "Prof. Carlos Kiala", subject: "Informática & TIC" },
];

const AVAILABLE_ROOMS = [
  { id: "room-1", name: "Sala 14 - Bloco B" },
  { id: "room-2", name: "Sala 15 - Bloco B" },
  { id: "room-3", name: "Sala 21 - Bloco A" },
  { id: "room-lab1", name: "Laboratório de Ciências" },
  { id: "room-inf", name: "Laboratório de Informática" },
  { id: "room-court", name: "Quadra Polidesportiva" },
];

export function ScheduleSlotModal({
  isOpen,
  onClose,
  dayOfWeek,
  slot,
  classId,
  className,
}: ScheduleSlotModalProps) {
  const { assignSlot, checkConflict } = useTimetableStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState(AVAILABLE_SUBJECTS[0].id);
  const [selectedTeacherId, setSelectedTeacherId] = useState(AVAILABLE_TEACHERS[0].id);
  const [selectedRoomId, setSelectedRoomId] = useState(AVAILABLE_ROOMS[0].id);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = AVAILABLE_SUBJECTS.find((s) => s.id === selectedSubjectId);
    const teacher = AVAILABLE_TEACHERS.find((t) => t.id === selectedTeacherId);
    const room = AVAILABLE_ROOMS.find((r) => r.id === selectedRoomId);

    if (!subject || !teacher || !room) return;

    // Check conflict first
    const conflict = checkConflict(
      classId,
      dayOfWeek,
      slot.slotNumber,
      teacher.id,
      room.id
    );

    if (conflict.hasConflict) {
      setConflictWarning(conflict.message || "Choque de horário detectado!");
      toast.error(conflict.message);
      return;
    }

    // Assign slot
    assignSlot({
      classId,
      className,
      dayOfWeek,
      slotNumber: slot.slotNumber,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      teacherId: teacher.id,
      teacherName: teacher.name,
      roomId: room.id,
      roomName: room.name,
      shift: slot.shift,
      academicYear: "2025/2026",
    });

    toast.success(`Aula de ${subject.name} alocada com sucesso!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 border bg-background space-y-4">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name="CalendarPlus" className="w-5 h-5 text-primary" />
            Alocar Aula no Horário
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[11px] font-semibold">
              {className}
            </Badge>
            <span>•</span>
            <span className="font-semibold text-foreground">
              {DAY_OF_WEEK_LABELS[dayOfWeek]}
            </span>
            <span>•</span>
            <span>{slot.label}</span>
          </div>
        </DialogHeader>

        {conflictWarning && (
          <div className="p-3 rounded-lg bg-destructive-muted border border-destructive-border text-xs text-destructive flex items-start gap-2">
            <Icon name={"CircleAlert" as any} className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{conflictWarning}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Subject */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Disciplina</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setConflictWarning(null);
              }}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {AVAILABLE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Professor Responsável</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setConflictWarning(null);
              }}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {AVAILABLE_TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Sala de Aula / Instalação</label>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setConflictWarning(null);
              }}
              className="w-full h-8 px-2.5 rounded-md border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {AVAILABLE_ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
              <Icon name="Check" className="w-3.5 h-3.5 mr-1" />
              Confirmar Alocação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
