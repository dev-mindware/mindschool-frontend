"use client";

import { useDiscardGuard } from "@/components/common/discard-guard";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AcademicSection, Shift, EducationCycle } from "@/types";
import { useAcademicSections, useAcademicYears } from "@/hooks/school/use-academic";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Badge,
  Icon,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { YearSetup } from "./year-setup";

import { quantitySchema } from "@/schemas/helps";

const classSectionFormSchema = z
  .object({
    name: z.string().trim().min(2, "O nome da turma é obrigatório (ex: 10ª A)"),
    classLevel: z.string().min(1, "Selecione o ano de escolaridade"),
    cycle: z.enum(["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY"]),
    shift: z.enum(["MORNING", "AFTERNOON", "EVENING", "DIURNO"]),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    roomNumber: z.string().trim().min(1, "Indique a sala de aulas"),
    capacity: quantitySchema(1, 100, "A lotação da turma"),
    academicYear: z.string().min(1, "Selecione o ano letivo"),
  })
  .superRefine((data, ctx) => {
    if (data.shift !== "DIURNO") {
      if (!data.startTime) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique a hora de início do turno", path: ["startTime"] });
      }
      if (!data.endTime) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique a hora de término do turno", path: ["endTime"] });
      }
      if (data.startTime && data.endTime && data.endTime <= data.startTime) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A hora de término tem de ser depois da hora de início", path: ["endTime"] });
      }
    }
  });

type ClassSectionFormValues = z.infer<typeof classSectionFormSchema>;

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToEdit?: AcademicSection | null;
}

const SHIFT_DEFAULT_TIMES: Record<Shift, { start: string; end: string }> = {
  MORNING: { start: "07:30", end: "12:30" },
  AFTERNOON: { start: "13:00", end: "18:00" },
  EVENING: { start: "18:30", end: "22:00" },
  DIURNO: { start: "07:30", end: "17:30" },
};

const SHIFT_PRESETS: Record<Shift, Array<{ label: string; start: string; end: string }>> = {
  MORNING: [
    { label: "07:00 - 12:00", start: "07:00", end: "12:00" },
    { label: "07:15 - 12:15", start: "07:15", end: "12:15" },
    { label: "07:30 - 12:30", start: "07:30", end: "12:30" },
    { label: "08:00 - 13:00", start: "08:00", end: "13:00" },
  ],
  AFTERNOON: [
    { label: "12:30 - 17:30", start: "12:30", end: "17:30" },
    { label: "13:00 - 18:00", start: "13:00", end: "18:00" },
    { label: "13:15 - 18:15", start: "13:15", end: "18:15" },
    { label: "13:30 - 18:30", start: "13:30", end: "18:30" },
  ],
  EVENING: [
    { label: "17:30 - 21:30", start: "17:30", end: "21:30" },
    { label: "18:00 - 22:00", start: "18:00", end: "22:00" },
    { label: "18:30 - 22:30", start: "18:30", end: "22:30" },
  ],
  DIURNO: [],
};

export function ClassModal({ isOpen, onClose, sectionToEdit }: ClassModalProps) {
  const { save } = useAcademicSections();
  const { years, isLoading: yearsLoading, isError: yearsFailed, refetch: refetchYears } = useAcademicYears();

  const academicYearOptions = useMemo(
    () => (years ?? []).map((y) => ({ value: y.name, label: y.status === "activo" ? `${y.name} (Ativo)` : y.name })),
    [years],
  );

  const activeOrCurrentYear = useMemo(() => years.find((y) => y.status === "activo")?.name ?? years[0]?.name ?? "", [years]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<z.input<typeof classSectionFormSchema>, unknown, ClassSectionFormValues>({
    resolver: zodResolver(classSectionFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      classLevel: "7ª Classe",
      cycle: "LOWER_SECONDARY",
      shift: "MORNING",
      startTime: "07:30",
      endTime: "12:30",
      roomNumber: "Sala 1",
      capacity: 40,
      academicYear: activeOrCurrentYear,
    },
  });
  const discard = useDiscardGuard(isDirty, onClose);

  const selectedCycle = watch("cycle");
  const selectedShift = watch("shift");
  const selectedClassLevel = watch("classLevel");
  const selectedAcademicYear = watch("academicYear");
  const currentStartTime = watch("startTime");
  const currentEndTime = watch("endTime");

  useEffect(() => {
    if (sectionToEdit) {
      reset({
        name: sectionToEdit.name,
        classLevel: sectionToEdit.classLevel,
        cycle: sectionToEdit.cycle,
        shift: sectionToEdit.shift,
        startTime: sectionToEdit.startTime || SHIFT_DEFAULT_TIMES[sectionToEdit.shift]?.start || "07:30",
        endTime: sectionToEdit.endTime || SHIFT_DEFAULT_TIMES[sectionToEdit.shift]?.end || "12:30",
        roomNumber: sectionToEdit.roomNumber || "Sala 1",
        capacity: sectionToEdit.capacity,
        academicYear: sectionToEdit.academicYear || activeOrCurrentYear,
      });
    } else {
      reset({
        name: "",
        classLevel: "7ª Classe",
        cycle: "LOWER_SECONDARY",
        shift: "MORNING",
        startTime: SHIFT_DEFAULT_TIMES.MORNING.start,
        endTime: SHIFT_DEFAULT_TIMES.MORNING.end,
        roomNumber: "Sala 1",
        capacity: 40,
        academicYear: activeOrCurrentYear,
      });
    }
  }, [sectionToEdit, isOpen, reset, activeOrCurrentYear]);

  const onSubmit = async (data: ClassSectionFormValues) => {
    try {
      await save.mutateAsync({
        id: sectionToEdit?.id,
        name: data.name,
        classLevelName: data.classLevel,
        shift: data.shift,
        capacity: data.capacity,
        academicYear: data.academicYear,
        roomNumber: data.roomNumber,
      });
      SucessMessage(sectionToEdit ? "Turma atualizada com sucesso!" : "Nova turma criada com sucesso!");
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao gravar a turma."));
    }
  };

  const cycleOptions = [
    { value: "PRIMARY", label: "Ensino Primário (Iniciação à 6ª)" },
    { value: "LOWER_SECONDARY", label: "Iº Ciclo Secundário (7ª à 9ª)" },
    { value: "UPPER_SECONDARY", label: "IIº Ciclo / Técnico (10ª à 13ª)" },
  ];

  const shiftOptions = [
    { value: "MORNING", label: "Manhã" },
    { value: "AFTERNOON", label: "Tarde" },
    { value: "EVENING", label: "Noite / Pós-laboral" },
    { value: "DIURNO", label: "Diurno (Horário flexível por disciplina)" },
  ];

  const handleShiftChange = (val: Shift) => {
    setValue("shift", val);
    const defaults = SHIFT_DEFAULT_TIMES[val];
    if (defaults) {
      setValue("startTime", defaults.start);
      setValue("endTime", defaults.end);
    }
  };

  const applyTimePreset = (start: string, end: string) => {
    setValue("startTime", start, { shouldValidate: true, shouldDirty: true });
    setValue("endTime", end, { shouldValidate: true, shouldDirty: true });
  };

  const CLASSES_BY_CYCLE: Record<EducationCycle, Array<{ value: string; label: string }>> = {
    PRIMARY: [
      { value: "Iniciação", label: "Classe de Iniciação" },
      { value: "1ª Classe", label: "1ª Classe" },
      { value: "2ª Classe", label: "2ª Classe" },
      { value: "3ª Classe", label: "3ª Classe" },
      { value: "4ª Classe", label: "4ª Classe" },
      { value: "5ª Classe", label: "5ª Classe" },
      { value: "6ª Classe", label: "6ª Classe" },
    ],
    LOWER_SECONDARY: [
      { value: "7ª Classe", label: "7ª Classe" },
      { value: "8ª Classe", label: "8ª Classe" },
      { value: "9ª Classe", label: "9ª Classe" },
    ],
    UPPER_SECONDARY: [
      { value: "10ª Classe", label: "10ª Classe" },
      { value: "11ª Classe", label: "11ª Classe" },
      { value: "12ª Classe", label: "12ª Classe" },
      { value: "13ª Classe", label: "13ª Classe" },
    ],
  };

  const handleCycleChange = (val: EducationCycle) => {
    setValue("cycle", val);
    const available = CLASSES_BY_CYCLE[val] || [];
    if (!available.some((c) => c.value === selectedClassLevel)) {
      setValue("classLevel", available[0]?.value ?? "");
    }
  };

  const currentClassOptions = CLASSES_BY_CYCLE[selectedCycle] || [];
  const currentPresets = SHIFT_PRESETS[selectedShift] || [];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(next) => !next && discard.request()}>
        <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
          <SheetHeader className="p-0">
            <SheetTitle>{sectionToEdit ? "Editar Turma" : "Criar Nova Turma"}</SheetTitle>
            <SheetDescription>
              Configuração de classe, turno letivo dinâmico, sala física e ano letivo
            </SheetDescription>
          </SheetHeader>

          {yearsLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">A carregar os anos letivos…</p>
          ) : years.length === 0 ? (
            <YearSetup loadFailed={yearsFailed} onRetry={() => void refetchYears()} onClose={onClose} />
          ) : (
            <form id="class-modal-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Nome Descritivo da Turma *"
                startIcon="DoorOpen"
                placeholder="Ex: 10ª A, 7ª B, 11ª Informática"
                {...register("name")}
                error={errors.name?.message}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectField
                  label="Ciclo Pedagógico *"
                  value={selectedCycle}
                  options={cycleOptions}
                  onValueChange={(val) => handleCycleChange(val as EducationCycle)}
                />

                <SelectField
                  label="Nível / Classe *"
                  value={selectedClassLevel}
                  options={currentClassOptions}
                  onValueChange={(val) => setValue("classLevel", val)}
                />

                <SelectField
                  label="Turno Letivo *"
                  value={selectedShift}
                  options={shiftOptions}
                  onValueChange={(val) => handleShiftChange(val as Shift)}
                />

                <SelectField
                  label="Ano Letivo *"
                  value={selectedAcademicYear || activeOrCurrentYear}
                  options={academicYearOptions}
                  onValueChange={(val) => setValue("academicYear", val, { shouldValidate: true })}
                />

                <Input
                  label="Sala de Aulas *"
                  startIcon="Building2"
                  placeholder="Ex: Sala 14, Lab 2"
                  {...register("roomNumber")}
                  error={errors.roomNumber?.message}
                />

                <Input
                  type="quantity"
                  min={1}
                  max={100}
                  step={1}
                  label="Capacidade de Alunos *"
                  startIcon="Users"
                  placeholder="40"
                  value={Number(watch("capacity")) || 1}
                  onChange={(e) =>
                    setValue("capacity", Math.max(1, Number(e.target.value) || 1), {
                      shouldValidate: true,
                    })
                  }
                  error={errors.capacity?.message}
                />
                <p className="text-[11px] text-muted-foreground sm:col-span-2">
                  <strong>Capacidade</strong> é o limite de matrículas: cheia, o sistema não matricula mais alunos (os aprovados ficam em lista de espera) e não pode ficar abaixo dos alunos já matriculados.
                </p>
              </div>

              {selectedShift === "DIURNO" ? (
                <div className="space-y-2.5 rounded-xs border border-sky-500/30 bg-sky-500/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
                      <Icon name="CalendarRange" className="size-4 text-sky-600 dark:text-sky-400" />
                      <span>Regime Diurno • Horário Flexível por Disciplina</span>
                    </div>
                    <Badge variant="info" className="text-xs">
                      Definido no Horário Semanal
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    No regime <strong>Diurno</strong>, a turma não segue um horário rígido fixo de turno único. A distribuição de horas é feita individualmente para cada disciplina na criação do <strong>Horário Semanal</strong>, permitindo aulas de manhã ou à tarde.
                  </p>
                  <div className="space-y-1 rounded-xs border border-sky-500/20 bg-background/80 p-2.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Icon name="Lightbulb" className="size-3.5 text-amber-500" />
                      Exemplo de configuração no Horário:
                    </span>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Disciplina 1 — (Segunda-Feira: 07h30–10h30), (Quarta-Feira: 12h30–14h00)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-xs border bg-muted/30 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Icon name="Clock" className="size-4 text-primary" />
                      <span>Horário do Turno (Horas Dinâmicas)</span>
                    </div>
                    {currentStartTime && currentEndTime && (
                      <Badge variant="outline" className="bg-background text-xs">
                        {selectedShift === "MORNING" ? "Manhã" : selectedShift === "AFTERNOON" ? "Tarde" : "Noite"}: {currentStartTime} às {currentEndTime}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      type="time"
                      label="Hora de Início *"
                      startIcon="Clock"
                      {...register("startTime")}
                      error={errors.startTime?.message}
                    />

                    <Input
                      type="time"
                      label="Hora de Término *"
                      startIcon="Clock"
                      {...register("endTime")}
                      error={errors.endTime?.message}
                    />
                  </div>

                  {currentPresets.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Sugestões (clique para aplicar):
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPresets.map((preset) => {
                          const isActive = currentStartTime === preset.start && currentEndTime === preset.end;
                          return (
                            <Button
                              key={preset.label}
                              type="button"
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              onClick={() => applyTimePreset(preset.start, preset.end)}
                              className="h-7 px-2.5 text-xs"
                            >
                              {preset.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <SheetFooter>
                <Button type="button" variant="outline" onClick={discard.request}>
                  Cancelar
                </Button>
                <ButtonSubmit isLoading={isSubmitting}>
                  {sectionToEdit ? "Guardar Alterações" : "Criar Turma"}
                </ButtonSubmit>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
      {discard.dialog}
    </>
  );
}
