"use client";

import React, { useState } from "react";
import { useSections } from "@/hooks/school/use-sections";
import { useSubjects, useTeachers, useTeacherAssignments } from "@/hooks/school/use-academic";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export function AssignmentModal({ isOpen, onClose }: AssignmentModalProps) {
  const { data: sections = [] } = useSections();
  const { allSubjects: subjects } = useSubjects();
  const { data: teachers = [] } = useTeachers();
  const { assign } = useTeacherAssignments();

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSectionId || !selectedSubjectId) {
      ErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      await assign.mutateAsync({ sectionId: selectedSectionId, subjectId: selectedSubjectId, teacherId: selectedTeacherId, weeklyHours: Number(weeklyHours) });
      SucessMessage("Atribuição lectiva registada com sucesso!");
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao atribuir o professor."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.full_name }));

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: `${s.classLevel} ${s.name} (${s.shift === "MORNING" ? "Manhã" : "Tarde"})`,
  }));

  const subjectOptions = subjects.map((sub) => ({
    value: sub.id,
    label: `${sub.name} (${sub.code})`,
  }));

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title="Atribuir Professor à Turma"
      description="Vinculação de corpo docente por disciplina e turma no ano lectivo"
      className="!max-h-[85vh] !max-w-md overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <SelectField
          label="Professor Docente *"
          value={selectedTeacherId}
          options={teacherOptions}
          onValueChange={setSelectedTeacherId}
        />

        <SelectField
          label="Turma Alocada *"
          value={selectedSectionId}
          options={sectionOptions}
          placeholder="Selecione a turma..."
          onValueChange={setSelectedSectionId}
        />

        <SelectField
          label="Disciplina Curricular *"
          value={selectedSubjectId}
          options={subjectOptions}
          placeholder="Selecione a disciplina..."
          onValueChange={setSelectedSubjectId}
        />

        <Input
          type="number"
          label="Carga Horária Semanal (Tempos) *"
          startIcon="Clock"
          placeholder="4"
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(Number(e.target.value))}
        />

        {/* Botões de Ação no Padrão MindGest */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            Atribuir Professor
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
