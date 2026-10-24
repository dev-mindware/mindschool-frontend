"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSections } from "@/hooks/school/use-sections";
import { useSubjects, useTeachers, useTeacherAssignments } from "@/hooks/school/use-academic";
import { adminSchoolService } from "@/services/admin-school-service";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Checkbox,
  Icon,
  Badge,
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

function QuickTeacherModal({ isOpen, onClose, onCreated, allSubjects }: QuickTeacherModalProps) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [qualification, setQualification] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setFullName("");
    setEmail("");
    setDocNumber("");
    setQualification("");
    setSelectedSubjects([]);
  };

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || docNumber.trim().length < 5) {
      ErrorMessage("Preencha o nome completo, e-mail válido e documento (mín. 5 dígitos).");
      return;
    }

    setIsSubmitting(true);
    try {
      const membership = await adminSchoolService.grant({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: "professor",
        invite: false,
        password: "Mindschool123!",
      });

      const userId = membership.user_id || membership.user?.id || membership.id;
      const teacher = await adminSchoolService.createTeacher({
        userId,
        documentNumber: docNumber.trim(),
        qualification: qualification.trim() || undefined,
      });

      const teacherId = teacher.id || membership.id;
      if (selectedSubjects.length > 0) {
        saveTeacherQualifications(teacherId, selectedSubjects);
      }

      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      await queryClient.invalidateQueries({ queryKey: ["teachers-admin"] });

      SucessMessage("Docente registado com sucesso!");
      onCreated(teacherId, selectedSubjects);
      reset();
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível registar o docente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title="Registar Novo Docente"
      description="Registo rápido de professor com definição prévia das disciplinas que pode ministrar"
      className="w-max"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome Completo *"
            startIcon="User"
            placeholder="Ex: Manuel António Domingos"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="E-mail Institucional *"
            startIcon="Mail"
            type="email"
            placeholder="m.domingos@escola.ao"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="N.º do Documento (BI / Passaporte) *"
            startIcon="IdCard"
            placeholder="Ex: 004829103LA042"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
          />

          <Input
            label="Habilitação Académica"
            startIcon="GraduationCap"
            placeholder="Ex: Licenciatura em Matemática"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Icon name="BookOpen" className="size-3.5 text-primary" />
              Disciplinas que pode ministrar ({selectedSubjects.length} selecionadas)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-primary hover:underline font-medium"
                onClick={() => setSelectedSubjects(allSubjects.map((s) => s.id))}
              >
                Todas
              </button>
              <span className="text-xs text-muted-foreground">•</span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => setSelectedSubjects([])}
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allSubjects.map((sub) => {
              const isChecked = selectedSubjects.includes(sub.id);
              return (
                <label
                  key={sub.id}
                  className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                    isChecked ? "border-primary/40 bg-primary/5 text-foreground font-medium" : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => handleToggleSubject(sub.id)} />
                  <span className="truncate">{sub.name} <span className="text-[10px] opacity-70 font-mono">({sub.code})</span></span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
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

export function AssignmentModal({ isOpen, onClose }: AssignmentModalProps) {
  const { data: sections = [] } = useSections();
  const { allSubjects: subjects } = useSubjects();
  const { data: teachers = [] } = useTeachers();
  const { assign, allAssignments = [] } = useTeacherAssignments();

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickTeacherOpen, setIsQuickTeacherOpen] = useState(false);

  // Carregamento automático das disciplinas com base nas qualificações/histórico do professor
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
    if (!selectedTeacherId) {
      ErrorMessage("Por favor, selecione um professor docente.");
      return;
    }
    if (selectedSectionIds.length === 0) {
      ErrorMessage("Por favor, selecione pelo menos uma turma.");
      return;
    }
    if (selectedSubjectIds.length === 0) {
      ErrorMessage("Por favor, selecione pelo menos uma disciplina.");
      return;
    }

    const totalCombinations = selectedSectionIds.length * selectedSubjectIds.length;
    setIsSubmitting(true);

    try {
      const calls: Promise<unknown>[] = [];
      for (const sectionId of selectedSectionIds) {
        for (const subjectId of selectedSubjectIds) {
          calls.push(
            assign.mutateAsync({
              sectionId,
              subjectId,
              teacherId: selectedTeacherId,
              weeklyHours: Number(weeklyHours),
            })
          );
        }
      }

      await Promise.all(calls);
      SucessMessage(`${totalCombinations} atribuição(ões) lectiva(s) registada(s) com sucesso!`);
      setSelectedSectionIds([]);
      setSelectedSubjectIds([]);
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
        description="Vincule um professor a várias turmas e disciplinas simultâneas no ano lectivo"
        className="w-max"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Seleção do Professor com Botão Rápido de Criação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Professor Docente *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setIsQuickTeacherOpen(true)}
              >
                <Icon name="UserPlus" className="size-3.5" />
                Criar Novo Docente
              </Button>
            </div>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turmas (escolha múltipla com pesquisa: a lista longa vive num popover, o modal não tem scroll) */}
            <FormMultiCombobox
              label={`Turmas alocadas (${selectedSectionIds.length}) *`}
              values={selectedSectionIds}
              onValuesChange={setSelectedSectionIds}
              placeholder="Seleccione as turmas..."
              searchPlaceholder="Filtrar turmas..."
              options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name}`, hint: s.shift === "MORNING" ? "Manhã" : s.shift === "AFTERNOON" ? "Tarde" : "Noite" }))}
            />

            {/* Disciplinas */}
            <FormMultiCombobox
              label={`Disciplinas (${selectedSubjectIds.length}) *`}
              values={selectedSubjectIds}
              onValuesChange={setSelectedSubjectIds}
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
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
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

          {/* Botões de Ação no Padrão MindGest */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonSubmit isLoading={isSubmitting} className="w-max" disabled={!selectedTeacherId || selectedSectionIds.length === 0 || selectedSubjectIds.length === 0}>
              Atribuir Docente
            </ButtonSubmit>
          </div>
        </form>
      </GlobalModal>

      {/* Modal Rápido de Criação de Docente com Qualificações */}
      <QuickTeacherModal
        isOpen={isQuickTeacherOpen}
        onClose={() => setIsQuickTeacherOpen(false)}
        onCreated={handleQuickTeacherCreated}
        allSubjects={subjects}
      />
    </>
  );
}

