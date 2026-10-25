"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GlobalModal,
  SelectField,
  Button,
  ButtonSubmit,
  Badge,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { useTimetables } from "@/hooks/school/use-timetables";
import {
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
  const roomsEnabled = useEntitled({ feature: "rooms" });

  // Sincronizar defaults ou dados de edição ao abrir
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, entryToEdit, defaultSectionId, defaultWeekday, defaultSlot, defaultStart, defaultEnd]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === sectionId) || sections[0],
    [sections, sectionId],
  );

  // Slots de tempo calculados para o turno da turma selecionada
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

  // Se o slot selecionado não existe na lista de slots, ajustar para o primeiro
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

  // Se mudar o slot em modo slots, actualizar os horários dinâmicos de apoio
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

  // Preset de duração rápida no modo dinâmico
  const handleAddDuration = (durationMinutes: number) => {
    const startMin = toMinutes(startTime);
    const newEndMin = Math.min(startMin + durationMinutes, 23 * 60 + 59);
    setEndTime(formatMinutes(newEndMin));
  };

  // Verificar se o slot pode ser duplo (o slot seguinte tem que existir e ser aula, sem intervalo)
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

  // Auto-selecionar professor se a disciplina já estiver atribuída a esta turma
  const existingAssignmentForSubject = useMemo(() => {
    if (!sectionId || !subjectId) return null;
    return assignments.find((a) => a.sectionId === sectionId && a.subjectId === subjectId);
  }, [assignments, sectionId, subjectId]);

  useEffect(() => {
    if (existingAssignmentForSubject) {
      setTeacherId(existingAssignmentForSubject.teacherId);
    }
  }, [existingAssignmentForSubject]);

  // Pré-selecionar sala da turma se não houver sala selecionada
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

  // Cálculo da duração ativa em minutos
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

  // Minutos de início e fim ativos para detecção universal de conflitos
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionId || !subjectId || !teacherId) {
      ErrorMessage("Por favor seleccione a turma, a disciplina e o professor.");
      return;
    }
    if (timeMode === "dynamic") {
      if (!startTime || !endTime) {
        ErrorMessage("Por favor defina a hora de início e a hora de término.");
        return;
      }
      if (toMinutes(endTime) <= toMinutes(startTime)) {
        ErrorMessage("A hora de término deve ser posterior à hora de início.");
        return;
      }
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
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={entryToEdit ? "Editar Aula no Horário Semanal" : "Adicionar Aula ao Horário Semanal"}
      description={
        entryToEdit
          ? "Atualize o dia, as horas, a disciplina, o professor ou a sala"
          : "Seleccione o dia, o período de horas, a disciplina e o professor responsável"
      }
      className="w-full sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Seletor de Turma (se houver mais de uma) */}
        <div>
          <SelectField
            label="Turma *"
            value={sectionId}
            options={sectionOptions}
            onValueChange={setSectionId}
          />
        </div>

        {/* 1. Dia da Semana (Seleção Visual em Chips) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Dia da Semana *</span>
            <span className="text-xs font-semibold text-primary">
              {WEEKDAY[weekday]}
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {WEEKDAYS.map((d) => {
              const isSelected = weekday === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setWeekday(d.value)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-all select-none",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="text-sm">{d.short}</span>
                  <span className="text-[10px] opacity-80">{d.label.split("-")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Período de Horas / Seleção Dinâmica ou por Tempos */}
        <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Icon name="Clock" className="w-4 h-4 text-primary" />
              Período de Horas & Duração Letiva
            </span>
            <div className="flex items-center gap-1.5">
              {currentDurationMin > 0 ? (
                <Badge variant="outline" className="text-xs font-mono bg-background text-primary border-primary/30">
                  {currentSlotInfo} ({currentDurationMin} min)
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Horário Inválido
                </Badge>
              )}
            </div>
          </div>

          {/* Alternador de Modo: Dinâmico / Livre vs. Tempos Padronizados */}
          <div className="flex rounded-lg border bg-background/80 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeMode("dynamic")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5",
                timeMode === "dynamic"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name="Sparkles" className="w-3.5 h-3.5" />
              <span>Horário Dinâmico (Livre)</span>
              <span className="text-[10px] opacity-75 font-mono px-1 rounded bg-black/10 dark:bg-white/10">ex: 07h – 08h30</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeMode("slots")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5",
                timeMode === "slots"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name="CalendarRange" className="w-3.5 h-3.5" />
              <span>Tempos da Grelha (Slots)</span>
            </button>
          </div>

          {timeMode === "dynamic" ? (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Hora de Início *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Hora de Término *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Presets rápidos de duração a partir do início */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground font-medium mr-1">
                  Duração Rápida:
                </span>
                <button
                  type="button"
                  onClick={() => handleAddDuration(45)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-[11px] font-medium transition-colors"
                >
                  +45m (1 tempo)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDuration(60)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-[11px] font-medium transition-colors"
                >
                  +60m (1 hora)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDuration(90)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-[11px] font-medium transition-colors text-primary border-primary/30"
                >
                  +90m (1h 30m)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDuration(120)}
                  className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-[11px] font-medium transition-colors"
                >
                  +120m (2 horas)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <SelectField
                  label="Tempo Inicial *"
                  value={String(firstSlot)}
                  options={slotOptions}
                  onValueChange={(val) => onSlotSelect(Number(val))}
                />
              </div>

              <div>
                <SelectField
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <SelectField
              label="Disciplina Curricular *"
              value={subjectId}
              placeholder="Seleccione a disciplina"
              options={subjectOptions}
              onValueChange={setSubjectId}
            />
          </div>

          <div>
            <SelectField
              label="Professor Responsável *"
              value={teacherId}
              placeholder="Seleccione o professor"
              options={teacherOptions}
              onValueChange={setTeacherId}
            />
          </div>
        </div>

        {/* Notificação contextual de atribuição */}
        {subjectId && (
          <div className="text-xs flex items-center gap-2">
            {existingAssignmentForSubject ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Icon name="CheckCircle" className="w-3.5 h-3.5" />
                Professor habitual desta disciplina na turma já atribuído.
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <Icon name="Sparkles" className="w-3.5 h-3.5 text-primary" />
                Esta disciplina será vinculada à turma e ao professor automaticamente.
              </span>
            )}
          </div>
        )}

        {/* 4. Sala de Aulas (Opcional) */}
        {roomsEnabled && (
          <div>
            <SelectField
              label="Sala de Aulas (Opcional)"
              value={roomId}
              options={roomOptions}
              onValueChange={setRoomId}
            />
          </div>
        )}

        {/* Alertas de Conflito em tempo real */}
        {sectionConflict && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-start gap-2">
            <Icon name="CircleAlert" className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Choque de Turma:</strong> A turma já tem uma aula de{" "}
              <strong>{sectionConflict.subject.name}</strong> agendada neste mesmo horário.
            </div>
          </div>
        )}

        {teacherConflict && !sectionConflict && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-start gap-2">
            <Icon name="CircleAlert" className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Choque de professor:</strong> O professor selecionado já tem uma aula na turma{" "}
              <strong>{teacherConflict.section.name}</strong> neste mesmo horário. O sistema não deixa gravar: escolha outro tempo ou outro professor.
            </div>
          </div>
        )}

        {roomConflict && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-start gap-2">
            <Icon name="CircleAlert" className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Choque de sala:</strong> A sala selecionada já está ocupada por outra turma neste horário. O sistema não deixa gravar: escolha outra sala ou outro tempo.
            </div>
          </div>
        )}

        {/* Rodapé com Botões de Ação */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit
            isLoading={addLesson.isPending || updateLesson.isPending}
            disabled={!sectionId || !subjectId || !teacherId || Boolean(sectionConflict) || Boolean(teacherConflict) || Boolean(roomConflict)}
            className="w-max"
          >
            {entryToEdit ? "Guardar Alterações" : "Adicionar ao Horário"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
