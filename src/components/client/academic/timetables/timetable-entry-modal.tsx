"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  FormSelect,
  Button,
  ButtonSubmit,
  Badge,
  Icon,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { timeHHMMSchema } from "@/schemas/helps";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { useTimetables } from "@/hooks/school/use-timetables";
import {
  timetablesService,
  WEEKDAY,
  type ApiEntry,
  type ApiRoom,
  type Shift,
} from "@/services/timetables-service";
import type { AcademicSection, Subject, TeacherAssignment } from "@/types";
import type { ApiTeacher } from "@/services/academic-service";
import { cn } from "@/lib/utils";
import { useEntitled } from "@/hooks/common/use-entitled";

interface TimetableEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetableId: string;
  entryToEdit?: ApiEntry | null;
  defaultSectionId?: string;
  defaultWeekday?: number;
  defaultSlot?: number;
  defaultStart?: string;
  defaultEnd?: string;
  sections: AcademicSection[];
  subjects: Subject[];
  teachers: ApiTeacher[];
  rooms: ApiRoom[];
  assignments: TeacherAssignment[];
  existingEntries: ApiEntry[];
}

const WEEKDAYS = [
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

const SHIFT_MAP: Record<string, Shift> = {
  MORNING: "manha",
  AFTERNOON: "tarde",
  EVENING: "noite",
  DIURNO: "diurno",
  manha: "manha",
  tarde: "tarde",
  noite: "noite",
  diurno: "diurno",
};

function toMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const [h = 0, m = 0] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const timetableEntrySchema = z
  .object({
    sectionId: z.string().trim().min(1, "Seleccione a turma."),
    weekday: z.number().int().min(1).max(6),
    timeMode: z.enum(["dynamic", "slots"]),
    startTime: z.string().trim(),
    endTime: z.string().trim(),
    firstSlot: z.number().int().min(1),
    span: z.number().int().min(1).max(2),
    subjectId: z.string().trim().min(1, "Seleccione a disciplina."),
    teacherId: z.string().trim().min(1, "Seleccione o professor responsável."),
  })
  .superRefine((data, ctx) => {
    if (data.timeMode === "dynamic") {
      const startCheck = timeHHMMSchema("A hora de início").safeParse(data.startTime);
      if (!startCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startTime"],
          message: startCheck.error.issues[0]?.message ?? "Indique a hora de início.",
        });
      }
      const endCheck = timeHHMMSchema("A hora de término").safeParse(data.endTime);
      if (!endCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: endCheck.error.issues[0]?.message ?? "Indique a hora de término.",
        });
      }
      if (startCheck.success && endCheck.success && toMinutes(endCheck.data) <= toMinutes(startCheck.data)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "A hora de término deve ser posterior à hora de início.",
        });
      }
    }
  });

export function TimetableEntryModal({
  isOpen,
  onClose,
  timetableId,
  entryToEdit,
  defaultSectionId,
  defaultWeekday = 1,
  defaultSlot = 1,
  defaultStart,
  defaultEnd,
  sections,
  subjects,
  teachers,
  rooms,
  assignments,
  existingEntries,
}: TimetableEntryModalProps) {
  const { addLesson, updateLesson, slotsFor } = useTimetables(timetableId);

  const [sectionId, setSectionId] = useState<string>(defaultSectionId || sections[0]?.id || "");
  const [weekday, setWeekday] = useState<number>(defaultWeekday);
  const [timeMode, setTimeMode] = useState<"dynamic" | "slots">("dynamic");
  const [startTime, setStartTime] = useState<string>(defaultStart || "07:30");
  const [endTime, setEndTime] = useState<string>(defaultEnd || "08:30");
  const [firstSlot, setFirstSlot] = useState<number>(defaultSlot);
  const [span, setSpan] = useState<number>(1);
  const [subjectId, setSubjectId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((p) => (p[k] ? p : { ...p, [k]: true }));
  const roomsEnabled = useEntitled({ feature: "rooms" });

  useEffect(() => {
    if (isOpen) {
      setTouched({});
      if (entryToEdit) {
        setSectionId(entryToEdit.section.id);
        setWeekday(entryToEdit.weekday);
        if (entryToEdit.first_slot != null) {
          setTimeMode("slots");
          setFirstSlot(entryToEdit.first_slot);
          setSpan(entryToEdit.span || 1);
        } else {
          setTimeMode("dynamic");
        }
        setStartTime(entryToEdit.start);
        setEndTime(entryToEdit.end);
        const matchingSub = subjects.find(
          (s) => s.name.toLowerCase() === entryToEdit.subject.name.toLowerCase(),
        );
        setSubjectId(matchingSub?.id || "");
        setTeacherId(entryToEdit.teacher.id);
        setRoomId(entryToEdit.room?.id || "");
      } else {
        if (defaultSectionId) setSectionId(defaultSectionId);
        if (defaultWeekday) setWeekday(defaultWeekday);
        if (defaultSlot) setFirstSlot(defaultSlot);
        if (defaultStart) setStartTime(defaultStart);
        if (defaultEnd) setEndTime(defaultEnd);
        setTimeMode(defaultSlot ? "slots" : "dynamic");
        setSpan(1);
        setSubjectId("");
        setTeacherId("");
        setRoomId("");
      }
    }
  }, [isOpen, entryToEdit, defaultSectionId, defaultWeekday, defaultSlot, defaultStart, defaultEnd, subjects]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === sectionId) || sections[0],
    [sections, sectionId],
  );

  const availableSlots = useMemo(() => {
    if (!selectedSection) return [];
    const rawSlots = slotsFor(selectedSection.shift);
    let lessonIndex = 0;
    return rawSlots
      .filter((s) => s.kind === "aula")
      .map((s) => {
        lessonIndex++;
        return {
          position: s.position,
          slotNumber: s.position,
          lessonNo: lessonIndex,
          start: s.start,
          end: s.end,
          label: `${lessonIndex}.º Tempo (${s.start} – ${s.end})`,
        };
      });
  }, [selectedSection, slotsFor]);

  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.some((s) => s.position === firstSlot)) {
      const first = availableSlots[0];
      if (first) {
        setFirstSlot(first.position);
        if (!defaultStart) setStartTime(first.start);
        if (!defaultEnd) setEndTime(first.end);
      }
    }
  }, [availableSlots, firstSlot, defaultStart, defaultEnd]);

  const onSlotSelect = (val: number) => {
    setFirstSlot(val);
    const target = availableSlots.find((s) => s.position === val);
    if (target) {
      setStartTime(target.start);
      const rawSlots = selectedSection ? slotsFor(selectedSection.shift) : [];
      const endSlot = rawSlots.find((s) => s.position === val + span - 1);
      setEndTime(endSlot?.end || target.end);
    }
  };

  const handleAddDuration = (durationMinutes: number) => {
    const startMin = toMinutes(startTime);
    const newEndMin = Math.min(startMin + durationMinutes, 23 * 60 + 59);
    setEndTime(formatMinutes(newEndMin));
  };

  const canDouble = useMemo(() => {
    if (!selectedSection) return false;
    const rawSlots = slotsFor(selectedSection.shift);
    const nextSlot = rawSlots.find((s) => s.position === firstSlot + 1);
    return nextSlot?.kind === "aula";
  }, [selectedSection, slotsFor, firstSlot]);

  useEffect(() => {
    if (!canDouble && span > 1) {
      setSpan(1);
    }
  }, [canDouble, span]);

  const existingAssignmentForSubject = useMemo(() => {
    if (!sectionId || !subjectId) return null;
    return assignments.find((a) => a.sectionId === sectionId && a.subjectId === subjectId);
  }, [assignments, sectionId, subjectId]);

  useEffect(() => {
    if (existingAssignmentForSubject) {
      setTeacherId(existingAssignmentForSubject.teacherId);
    }
  }, [existingAssignmentForSubject]);

  const { data: suggestedSlots = [] } = useQuery({
    queryKey: ["timetable-free-slots", timetableId, existingAssignmentForSubject?.id, span],
    queryFn: () =>
      timetablesService.freeSlots(timetableId, {
        sectionSubjectId: existingAssignmentForSubject!.id,
        span,
      }),
    enabled: isOpen && Boolean(timetableId) && Boolean(existingAssignmentForSubject?.id),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (selectedSection?.roomNumber && !roomId) {
      const matchingRoom = rooms.find(
        (r) =>
          r.code.toLowerCase() === selectedSection.roomNumber.toLowerCase() ||
          r.name.toLowerCase().includes(selectedSection.roomNumber.toLowerCase()),
      );
      if (matchingRoom) setRoomId(matchingRoom.id);
    }
  }, [selectedSection, rooms, roomId]);

  const currentDurationMin = useMemo(() => {
    if (timeMode === "dynamic") {
      return toMinutes(endTime) - toMinutes(startTime);
    }
    const start = availableSlots.find((s) => s.position === firstSlot);
    if (!start) return 45;
    const rawSlots = selectedSection ? slotsFor(selectedSection.shift) : [];
    const end = rawSlots.find((s) => s.position === firstSlot + span - 1);
    return toMinutes(end?.end || start.end) - toMinutes(start.start);
  }, [timeMode, startTime, endTime, availableSlots, firstSlot, span, selectedSection, slotsFor]);

  const currentSlotInfo = useMemo(() => {
    if (timeMode === "dynamic") {
      if (!startTime || !endTime) return "";
      return `${startTime} às ${endTime}`;
    }
    const start = availableSlots.find((s) => s.position === firstSlot);
    if (!start) return "";
    if (span === 1) return `${start.start} às ${start.end}`;
    const rawSlots = selectedSection ? slotsFor(selectedSection.shift) : [];
    const end = rawSlots.find((s) => s.position === firstSlot + span - 1);
    return `${start.start} às ${end?.end || start.end}`;
  }, [timeMode, startTime, endTime, availableSlots, selectedSection, slotsFor, firstSlot, span]);

  const activeStartMin = useMemo(() => {
    if (timeMode === "dynamic") return toMinutes(startTime);
    const start = availableSlots.find((s) => s.position === firstSlot);
    return start ? toMinutes(start.start) : (firstSlot - 1) * 45 + 450;
  }, [timeMode, startTime, availableSlots, firstSlot]);

  const activeEndMin = useMemo(() => {
    if (timeMode === "dynamic") return toMinutes(endTime);
    const rawSlots = selectedSection ? slotsFor(selectedSection.shift) : [];
    const end = rawSlots.find((s) => s.position === firstSlot + span - 1);
    return end ? toMinutes(end.end) : activeStartMin + span * 45;
  }, [timeMode, endTime, selectedSection, slotsFor, firstSlot, span, activeStartMin]);

  const hasMinuteOverlap = (e: ApiEntry) => {
    if (entryToEdit && e.id === entryToEdit.id) return false;
    if (e.weekday !== weekday) return false;
    const eStart = toMinutes(e.start);
    const eEnd = toMinutes(e.end);
    return activeStartMin < eEnd && eStart < activeEndMin;
  };

  const teacherConflict = useMemo(() => {
    if (!teacherId || !weekday) return null;
    return existingEntries.find((e) => e.teacher.id === teacherId && hasMinuteOverlap(e));
  }, [existingEntries, teacherId, weekday, activeStartMin, activeEndMin, entryToEdit]);

  const sectionConflict = useMemo(() => {
    if (!sectionId || !weekday) return null;
    return existingEntries.find((e) => e.section.id === sectionId && hasMinuteOverlap(e));
  }, [existingEntries, sectionId, weekday, activeStartMin, activeEndMin, entryToEdit]);

  const roomConflict = useMemo(() => {
    if (!roomId || !weekday) return null;
    return existingEntries.find((e) => e.room?.id === roomId && hasMinuteOverlap(e));
  }, [existingEntries, roomId, weekday, activeStartMin, activeEndMin, entryToEdit]);

  const entryParsed = useMemo(
    () =>
      timetableEntrySchema.safeParse({
        sectionId,
        weekday,
        timeMode,
        startTime,
        endTime,
        firstSlot,
        span,
        subjectId,
        teacherId,
      }),
    [sectionId, weekday, timeMode, startTime, endTime, firstSlot, span, subjectId, teacherId],
  );

  const errOf = (k: string, alwaysShow?: boolean) => {
    if ((!touched[k] && !alwaysShow) || entryParsed.success) return undefined;
    return entryParsed.error.issues.find((i) => i.path[0] === k)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryParsed.success) {
      setTouched({
        sectionId: true,
        startTime: true,
        endTime: true,
        subjectId: true,
        teacherId: true,
      });
      ErrorMessage(entryParsed.error.issues[0]?.message ?? "Verifique os campos do horário.");
      return;
    }
    if (sectionConflict) {
      ErrorMessage("Já existe uma aula agendada nesta turma para este dia e horário.");
      return;
    }

    try {
      if (entryToEdit) {
        await updateLesson.mutateAsync({
          entryId: entryToEdit.id,
          sectionId,
          subjectId,
          teacherId,
          weekday,
          startTime: timeMode === "dynamic" ? startTime : undefined,
          endTime: timeMode === "dynamic" ? endTime : undefined,
          firstSlot: timeMode === "slots" ? firstSlot : undefined,
          span: timeMode === "slots" ? span : undefined,
          roomId: roomId || undefined,
          shift: selectedSection?.shift ? SHIFT_MAP[selectedSection.shift] : undefined,
        });
        SucessMessage("Aula atualizada com sucesso no horário!");
      } else {
        await addLesson.mutateAsync({
          sectionId,
          subjectId,
          teacherId,
          weekday,
          startTime: timeMode === "dynamic" ? startTime : undefined,
          endTime: timeMode === "dynamic" ? endTime : undefined,
          firstSlot: timeMode === "slots" ? firstSlot : undefined,
          span: timeMode === "slots" ? span : undefined,
          roomId: roomId || undefined,
          shift: selectedSection?.shift ? SHIFT_MAP[selectedSection.shift] : undefined,
        });
        SucessMessage("Aula agendada com sucesso no horário semanal!");
      }
      onClose();
    } catch (err) {
      ErrorMessage(
        getApiErrorMessage(
          err,
          entryToEdit
            ? "Não foi possível atualizar a aula no horário."
            : "Não foi possível adicionar a aula ao horário.",
        ),
      );
    }
  };

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: `${s.classLevel} ${s.name} (${s.shift})`,
  }));

  const subjectOptions = subjects.map((sub) => ({
    value: sub.id,
    label: sub.isCore ? `★ ${sub.name} (Nuclear)` : sub.name,
  }));

  const teacherOptions = teachers.map((t) => ({
    value: t.id,
    label: t.full_name,
  }));

  const roomOptions = [
    { value: "", label: "Sem sala atribuída" },
    ...rooms
      .filter((r) => r.is_active)
      .map((r) => ({
        value: r.id,
        label: `${r.code} — ${r.name}${r.capacity ? ` (${r.capacity} lug.)` : ""}`,
      })),
  ];

  const slotOptions =
    availableSlots.length > 0
      ? availableSlots.map((s) => ({ value: String(s.position), label: s.label }))
      : [
          { value: "1", label: "1.º Tempo (07:30 – 08:15)" },
          { value: "2", label: "2.º Tempo (08:15 – 09:00)" },
          { value: "4", label: "3.º Tempo (09:15 – 10:00)" },
          { value: "5", label: "4.º Tempo (10:00 – 10:45)" },
          { value: "7", label: "5.º Tempo (11:00 – 11:45)" },
          { value: "8", label: "6.º Tempo (11:45 – 12:30)" },
        ];

  const durationOptions = useMemo(() => {
    if (!canDouble) {
      return [{ value: "1", label: "1 tempo (45 min)" }];
    }
    return [
      { value: "1", label: "1 tempo (45 min)" },
      { value: "2", label: "2 tempos (Bloco Duplo)" },
    ];
  }, [canDouble]);

  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-lg">
        <SheetHeader className="p-0">
          <SheetTitle>
            {entryToEdit ? "Editar Aula no Horário Semanal" : "Adicionar Aula ao Horário Semanal"}
          </SheetTitle>
          <SheetDescription>
            {entryToEdit
              ? "Atualize o dia, as horas, a disciplina, o professor ou a sala"
              : "Seleccione o dia, o período de horas, a disciplina e o professor responsável"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <FormSelect
              label="Turma *"
              value={sectionId}
              options={sectionOptions}
              onValueChange={(v) => { touch("sectionId"); setSectionId(v); }}
              error={errOf("sectionId")}
            />
          </div>

          {/* 1. Dia da Semana (Seleção Visual em Chips) */}
          <div className="space-y-1.5">
            <Label className="flex items-center justify-between text-sm font-medium">
              <span>Dia da Semana *</span>
              <span className="text-xs font-semibold text-primary">{WEEKDAY[weekday]}</span>
            </Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {WEEKDAYS.map((d) => {
                const isSelected = weekday === d.value;
                return (
                  <Button
                    key={d.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setWeekday(d.value)}
                    className={cn(
                      "flex h-auto flex-col items-center justify-center rounded-xs px-1 py-2 text-xs font-medium",
                      isSelected && "font-semibold",
                    )}
                  >
                    <span className="text-sm">{d.short}</span>
                    <span className="text-[10px] opacity-80">{d.label.split("-")[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 2. Período de Horas / Seleção Dinâmica ou por Tempos */}
          <div className="space-y-3 rounded-xs border bg-muted/20 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Icon name="Clock" className="size-4 text-primary" />
                Período de Horas & Duração Letiva
              </span>
              <div className="flex items-center gap-1.5">
                {currentDurationMin > 0 ? (
                  <Badge variant="outline" className="border-primary/30 bg-background font-mono text-xs text-primary">
                    {currentSlotInfo} ({currentDurationMin} min)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Horário Inválido
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-1 rounded-xs border bg-background/80 p-1 text-xs font-medium">
              <Button
                type="button"
                size="sm"
                variant={timeMode === "dynamic" ? "default" : "ghost"}
                onClick={() => setTimeMode("dynamic")}
                className="h-8 flex-1 gap-1.5 text-xs"
              >
                <Icon name="Sparkles" className="size-3.5" />
                <span>Horário Dinâmico</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={timeMode === "slots" ? "default" : "ghost"}
                onClick={() => setTimeMode("slots")}
                className="h-8 flex-1 gap-1.5 text-xs"
              >
                <Icon name="CalendarRange" className="size-3.5" />
                <span>Tempos da Grelha</span>
              </Button>
            </div>

            {timeMode === "dynamic" ? (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Hora de Início *"
                    type="time"
                    value={startTime}
                    onChange={(e) => { touch("startTime"); setStartTime(e.target.value); }}
                    error={errOf("startTime")}
                    required
                  />
                  <Input
                    label="Hora de Término *"
                    type="time"
                    value={endTime}
                    onChange={(e) => { touch("endTime"); setEndTime(e.target.value); }}
                    error={errOf("endTime", Boolean(startTime && endTime && toMinutes(endTime) <= toMinutes(startTime)))}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                    Duração Rápida:
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddDuration(45)}
                    className="h-7 px-2 text-[11px]"
                  >
                    +45m (1 tempo)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddDuration(60)}
                    className="h-7 px-2 text-[11px]"
                  >
                    +60m (1 hora)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddDuration(90)}
                    className="h-7 border-primary/30 px-2 text-[11px] text-primary"
                  >
                    +90m (1h 30m)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddDuration(120)}
                    className="h-7 px-2 text-[11px]"
                  >
                    +120m (2 horas)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <FormSelect
                    label="Tempo Inicial *"
                    value={String(firstSlot)}
                    options={slotOptions}
                    onValueChange={(val) => onSlotSelect(Number(val))}
                  />
                </div>

                <div>
                  <FormSelect
                    label="Duração *"
                    value={String(span)}
                    options={durationOptions}
                    onValueChange={(val) => setSpan(Number(val))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Disciplina e Professor */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FormSelect
                label="Disciplina Curricular *"
                value={subjectId}
                placeholder="Seleccione a disciplina"
                options={subjectOptions}
                onValueChange={(v) => { touch("subjectId"); setSubjectId(v); }}
                error={errOf("subjectId")}
              />
            </div>

            <div>
              <FormSelect
                label="Professor Responsável *"
                value={teacherId}
                placeholder="Seleccione o professor"
                options={teacherOptions}
                onValueChange={(v) => { touch("teacherId"); setTeacherId(v); }}
                error={errOf("teacherId")}
              />
            </div>
          </div>

          {subjectId && (
            <div className="flex items-center gap-2 text-xs">
              {existingAssignmentForSubject ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Icon name="CheckCircle" className="size-3.5" />
                  Professor habitual desta disciplina na turma já atribuído.
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Sparkles" className="size-3.5 text-primary" />
                  Esta disciplina será vinculada à turma e ao professor automaticamente.
                </span>
              )}
            </div>
          )}

          {subjectId && suggestedSlots.length > 0 && (
            <div className="space-y-1.5 rounded-xs border border-primary/20 bg-primary/[0.03] p-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon name="Sparkles" className="size-3.5 text-primary" />
                  Melhores horários sugeridos pela escola
                </span>
                <span className="text-[11px] text-muted-foreground">Clique para aplicar</span>
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {suggestedSlots.slice(0, 4).map((slot, i) => {
                  const isCurrent =
                    weekday === slot.weekday &&
                    (timeMode === "slots"
                      ? firstSlot === slot.first_slot
                      : startTime === slot.start && endTime === slot.end);
                  return (
                    <button
                      key={`${slot.weekday}-${slot.first_slot}-${i}`}
                      type="button"
                      onClick={() => {
                        setWeekday(slot.weekday);
                        const matchingBellSlot = availableSlots.find((s) => s.position === slot.first_slot);
                        if (matchingBellSlot) {
                          setTimeMode("slots");
                          setFirstSlot(slot.first_slot);
                        } else {
                          setTimeMode("dynamic");
                        }
                        setStartTime(slot.start);
                        setEndTime(slot.end);
                        if (slot.recommended_room && roomsEnabled) {
                          setRoomId(slot.recommended_room.id);
                        }
                      }}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-xs border px-2.5 py-1.5 text-left text-xs transition-colors",
                        isCurrent
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04]",
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-1 font-medium">
                        <span>{slot.weekday_label} · {slot.start}–{slot.end}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">{slot.score} pts</Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {slot.recommended_room ? `Sala ${slot.recommended_room.code}` : "Sem sala dedicada"}
                        {slot.reasons[0] ? ` · ${slot.reasons[0]}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Sala de Aulas (Opcional) */}
          {roomsEnabled && (
            <div>
              <FormSelect
                label="Sala de Aulas (Opcional)"
                value={roomId}
                options={roomOptions}
                onValueChange={setRoomId}
              />
            </div>
          )}

          {/* Alertas de Conflito em tempo real */}
          {sectionConflict && (
            <div className="flex items-start gap-2 rounded-xs border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <Icon name="CircleAlert" className="mt-0.5 size-4 shrink-0" />
              <div>
                <strong>Choque de Turma:</strong> A turma já tem uma aula de{" "}
                <strong>{sectionConflict.subject.name}</strong> agendada neste mesmo horário.
              </div>
            </div>
          )}

          {teacherConflict && !sectionConflict && (
            <div className="flex items-start gap-2 rounded-xs border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <Icon name="CircleAlert" className="mt-0.5 size-4 shrink-0" />
              <div>
                <strong>Choque de professor:</strong> O professor selecionado já tem uma aula na turma{" "}
                <strong>{teacherConflict.section.name}</strong> neste mesmo horário. O sistema não deixa gravar: escolha outro tempo ou outro professor.
              </div>
            </div>
          )}

          {roomConflict && (
            <div className="flex items-start gap-2 rounded-xs border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <Icon name="CircleAlert" className="mt-0.5 size-4 shrink-0" />
              <div>
                <strong>Choque de sala:</strong> A sala selecionada já está ocupada por outra turma neste horário. O sistema não deixa gravar: escolha outra sala ou outro tempo.
              </div>
            </div>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonSubmit
              isLoading={addLesson.isPending || updateLesson.isPending}
              disabled={
                !entryParsed.success ||
                Boolean(sectionConflict) ||
                Boolean(teacherConflict) ||
                Boolean(roomConflict) ||
                addLesson.isPending ||
                updateLesson.isPending
              }
            >
              {entryToEdit ? "Guardar Alterações" : "Adicionar ao Horário"}
            </ButtonSubmit>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
