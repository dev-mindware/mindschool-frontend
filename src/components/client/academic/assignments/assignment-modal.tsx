"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSections } from "@/hooks/school/use-sections";
import { useSubjects, useTeachers, useTeacherAssignments } from "@/hooks/school/use-academic";
import { adminSchoolService } from "@/services/admin-school-service";
import {
  fullPersonNameSchema,
  optionalSafeTextSchema,
  quantitySchema,
  requiredEmailSchema,
  validateIdDocumentByType,
} from "@/schemas/helps";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Input,
  Button,
  ButtonSubmit,
  Checkbox,
  Icon,
  Label,
} from "@/components";
import { FormMultiCombobox } from "@/components/common/form-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const TEACHER_QUALIFICATIONS_KEY = "mindschool_teacher_subjects_v1";

function getTeacherQualifications(teacherId: string): string[] {
  if (typeof window === "undefined" || !teacherId) return [];
  try {
    const raw = localStorage.getItem(TEACHER_QUALIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed[teacherId] || [];
  } catch {
    return [];
  }
}

function saveTeacherQualifications(teacherId: string, subjectIds: string[]) {
  if (typeof window === "undefined" || !teacherId) return;
  try {
    const raw = localStorage.getItem(TEACHER_QUALIFICATIONS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    parsed[teacherId] = subjectIds;
    localStorage.setItem(TEACHER_QUALIFICATIONS_KEY, JSON.stringify(parsed));
  } catch {}
}

interface QuickTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (teacherId: string, qualifiedSubjectIds: string[]) => void;
  allSubjects: Array<{ id: string; name: string; code: string }>;
}

const quickTeacherSchema = z.object({
  fullName: fullPersonNameSchema(5, 200, "O nome completo"),
  email: requiredEmailSchema,
  docNumber: z
    .string({ error: "O número do documento é obrigatório." })
    .trim()
    .min(1, "O número do documento é obrigatório.")
    .refine(
      (v) =>
        validateIdDocumentByType(v, "IDENTITY_CARD").valid ||
        validateIdDocumentByType(v, "PASSPORT").valid,
      "Documento inválido. Use BI angolano (ex.: 007849302LA042) ou Passaporte (ex.: N1234567).",
    ),
  qualification: optionalSafeTextSchema(120, 2, "A habilitação académica"),
});

type QuickTeacherFormInput = z.input<typeof quickTeacherSchema>;
type QuickTeacherFormData = z.infer<typeof quickTeacherSchema>;

function QuickTeacherModal({ isOpen, onClose, onCreated, allSubjects }: QuickTeacherModalProps) {
  const queryClient = useQueryClient();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isValid, isSubmitting },
  } = useForm<QuickTeacherFormInput, unknown, QuickTeacherFormData>({
    resolver: zodResolver(quickTeacherSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      docNumber: "",
      qualification: "",
    },
  });

  const resetAll = () => {
    resetForm({ fullName: "", email: "", docNumber: "", qualification: "" });
    setSelectedSubjects([]);
  };

  useEffect(() => {
    if (!isOpen) {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const onSubmit = async (data: QuickTeacherFormData) => {
    try {
      const membership = await adminSchoolService.grant({
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        role: "professor",
        invite: false,
        password: "Mindschool123!",
      });

      const userId = membership.user_id || membership.user?.id || membership.id;
      const teacher = await adminSchoolService.createTeacher({
        userId,
        documentNumber: data.docNumber,
        qualification: data.qualification || undefined,
      });

      const teacherId = teacher.id || membership.id;
      if (selectedSubjects.length > 0) {
        saveTeacherQualifications(teacherId, selectedSubjects);
      }

      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      await queryClient.invalidateQueries({ queryKey: ["teachers-admin"] });

      SucessMessage("Docente registado com sucesso!");
      onCreated(teacherId, selectedSubjects);
      resetAll();
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível registar o docente."));
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title="Registar Novo Docente"
      description="Registo rápido de professor com definição prévia das disciplinas que pode ministrar"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Nome Completo *"
            startIcon="User"
            placeholder="Ex: Manuel António Domingos"
            {...register("fullName")}
            error={errors.fullName?.message}
          />

          <Input
            label="E-mail Institucional *"
            startIcon="Mail"
            type="email"
            placeholder="m.domingos@escola.ao"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="N.º do Documento (BI / Passaporte) *"
            startIcon="IdCard"
            placeholder="Ex: 004829103LA042"
            {...register("docNumber")}
            error={errors.docNumber?.message}
          />

          <Input
            label="Habilitação Académica"
            startIcon="GraduationCap"
            placeholder="Ex: Licenciatura em Matemática"
            {...register("qualification")}
            error={errors.qualification?.message}
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Icon name="BookOpen" className="size-3.5 text-primary" />
              Disciplinas que pode ministrar ({selectedSubjects.length} selecionadas)
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-medium text-primary"
                onClick={() => setSelectedSubjects(allSubjects.map((s) => s.id))}
              >
                Todas
              </Button>
              <span className="text-xs text-muted-foreground">•</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={() => setSelectedSubjects([])}
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-xs border border-border/60 bg-muted/20 p-2.5 sm:grid-cols-2">
            {allSubjects.map((sub) => {
              const isChecked = selectedSubjects.includes(sub.id);
              return (
                <Label
                  key={sub.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xs border p-2 text-xs font-normal transition-colors ${
                    isChecked
                      ? "border-primary/40 bg-primary/5 font-medium text-foreground"
                      : "border-border/40 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => handleToggleSubject(sub.id)} />
                  <span className="truncate">
                    {sub.name} <span className="font-mono text-[10px] opacity-70">({sub.code})</span>
                  </span>
                </Label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} disabled={!isValid || isSubmitting}>
            Registar Docente
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const assignmentSchema = z.object({
  selectedTeacherId: z.string().trim().min(1, "Seleccione o professor docente."),
  selectedSectionIds: z.array(z.string()).min(1, "Seleccione pelo menos uma turma."),
  selectedSubjectIds: z.array(z.string()).min(1, "Seleccione pelo menos uma disciplina."),
  weeklyHours: quantitySchema(1, 40, "A carga horária semanal"),
});

export function AssignmentModal({ isOpen, onClose }: AssignmentModalProps) {
  const { data: sections = [] } = useSections();
  const { allSubjects: subjects } = useSubjects();
  const { data: teachers = [] } = useTeachers();
  const { assign, allAssignments = [] } = useTeacherAssignments();

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number | string>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickTeacherOpen, setIsQuickTeacherOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((p) => (p[k] ? p : { ...p, [k]: true }));

  useEffect(() => {
    if (!isOpen) {
      setTouched({});
    }
  }, [isOpen]);

  const assignmentParsed = useMemo(
    () =>
      assignmentSchema.safeParse({
        selectedTeacherId,
        selectedSectionIds,
        selectedSubjectIds,
        weeklyHours,
      }),
    [selectedTeacherId, selectedSectionIds, selectedSubjectIds, weeklyHours],
  );
  const errOf = (k: string) => {
    if (!touched[k] || assignmentParsed.success) return undefined;
    return assignmentParsed.error.issues.find((i) => i.path[0] === k)?.message;
  };

  useEffect(() => {
    if (!selectedTeacherId) {
      setSelectedSubjectIds([]);
      return;
    }

    const qualified = getTeacherQualifications(selectedTeacherId);
    const historical = allAssignments
      .filter((a) => a.teacherId === selectedTeacherId)
      .map((a) => a.subjectId);

    const merged = Array.from(new Set([...qualified, ...historical]));
    if (merged.length > 0) {
      setSelectedSubjectIds(merged);
    }
  }, [selectedTeacherId, allAssignments]);

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ value: t.id, label: t.full_name })),
    [teachers]
  );

  const handleQuickTeacherCreated = (newTeacherId: string, qualifiedSubjectIds: string[]) => {
    setSelectedTeacherId(newTeacherId);
    if (qualifiedSubjectIds.length > 0) {
      setSelectedSubjectIds(qualifiedSubjectIds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentParsed.success) {
      setTouched({
        selectedTeacherId: true,
        selectedSectionIds: true,
        selectedSubjectIds: true,
        weeklyHours: true,
      });
      ErrorMessage(assignmentParsed.error.issues[0]?.message ?? "Verifique os campos da atribuição.");
      return;
    }
    const d = assignmentParsed.data;

    const totalCombinations = d.selectedSectionIds.length * d.selectedSubjectIds.length;
    setIsSubmitting(true);

    try {
      const calls: Promise<unknown>[] = [];
      for (const sectionId of d.selectedSectionIds) {
        for (const subjectId of d.selectedSubjectIds) {
          calls.push(
            assign.mutateAsync({
              sectionId,
              subjectId,
              teacherId: d.selectedTeacherId,
              weeklyHours: d.weeklyHours,
            })
          );
        }
      }

      await Promise.all(calls);
      SucessMessage(`${totalCombinations} atribuição(ões) lectiva(s) registada(s) com sucesso!`);
      setSelectedSectionIds([]);
      setSelectedSubjectIds([]);
      setTouched({});
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao atribuir o professor às turmas e disciplinas."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GlobalModal
        isOpen={isOpen}
        onClose={onClose}
        canClose
        title="Atribuição Docente (Múltiplas Turmas & Disciplinas)"
        description="Vincule um professor a várias turmas e disciplinas simultâneas no ano letivo"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Professor Docente *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 border-primary/30 text-xs text-primary hover:bg-primary/10"
                onClick={() => setIsQuickTeacherOpen(true)}
              >
                <Icon name="UserPlus" className="size-3.5" />
                Criar Novo Docente
              </Button>
            </div>
            <Select value={selectedTeacherId} onValueChange={(v) => { touch("selectedTeacherId"); setSelectedTeacherId(v); }}>
              <SelectTrigger aria-invalid={Boolean(errOf("selectedTeacherId")) || undefined}>
                <SelectValue placeholder="Selecione o professor para carregar suas disciplinas..." />
              </SelectTrigger>
              <SelectContent>
                {teacherOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errOf("selectedTeacherId") && (
              <p role="alert" className="text-xs text-destructive">
                {errOf("selectedTeacherId")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormMultiCombobox
              label={`Turmas alocadas (${selectedSectionIds.length}) *`}
              values={selectedSectionIds}
              onValuesChange={(v) => { touch("selectedSectionIds"); setSelectedSectionIds(v); }}
              error={errOf("selectedSectionIds")}
              placeholder="Seleccione as turmas..."
              searchPlaceholder="Filtrar turmas..."
              options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name}`, hint: s.shift === "MORNING" ? "Manhã" : s.shift === "AFTERNOON" ? "Tarde" : "Noite" }))}
            />

            <FormMultiCombobox
              label={`Disciplinas (${selectedSubjectIds.length}) *`}
              values={selectedSubjectIds}
              onValuesChange={(v) => { touch("selectedSubjectIds"); setSelectedSubjectIds(v); }}
              error={errOf("selectedSubjectIds")}
              placeholder="Seleccione as disciplinas..."
              searchPlaceholder="Filtrar disciplinas..."
              options={subjects.map((s) => ({ value: s.id, label: s.name, hint: s.code }))}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="w-64">
              <Input
                type="quantity"
                label="Carga Horária Semanal (Tempos/semana) *"
                startIcon="Clock"
                placeholder="4"
                min={1}
                max={40}
                step={1}
                value={weeklyHours}
                onChange={(e) => { touch("weeklyHours"); setWeeklyHours(e.target.value === "" ? "" : Number(e.target.value)); }}
                error={errOf("weeklyHours")}
              />
            </div>

            {selectedSectionIds.length > 0 && selectedSubjectIds.length > 0 && (
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">
                  {selectedSectionIds.length} turma(s) × {selectedSubjectIds.length} disciplina(s)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total de <strong>{selectedSectionIds.length * selectedSubjectIds.length}</strong> atribuição(ões) a registar
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonSubmit
              isLoading={isSubmitting}
              disabled={!assignmentParsed.success || isSubmitting}
            >
              Atribuir Docente
            </ButtonSubmit>
          </div>
        </form>
      </GlobalModal>

      <QuickTeacherModal
        isOpen={isQuickTeacherOpen}
        onClose={() => setIsQuickTeacherOpen(false)}
        onCreated={handleQuickTeacherCreated}
        allSubjects={subjects}
      />
    </>
  );
}
