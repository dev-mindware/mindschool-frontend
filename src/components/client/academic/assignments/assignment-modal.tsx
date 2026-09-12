"use client";

import React, { useState } from "react";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
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

const AVAILABLE_TEACHERS = [
  { id: "teacher-1", name: "Prof. Dr. Mateus Domingos" },
  { id: "teacher-2", name: "Prof.ª Dra. Esperança Kiala" },
  { id: "teacher-3", name: "Prof. João Baptista Lourenço" },
  { id: "teacher-4", name: "Prof.ª Maria Teresa Kassoma" },
  { id: "teacher-5", name: "Prof. Alberto Silva Neto" },
];

export function AssignmentModal({ isOpen, onClose }: AssignmentModalProps) {
  const { sections, subjects, assignTeacher } = useSchoolDataStore();

  const [selectedTeacherId, setSelectedTeacherId] = useState(
    AVAILABLE_TEACHERS[0].id
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    sections[0]?.id || ""
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    subjects[0]?.id || ""
  );
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [academicYear] = useState("2025/2026");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSectionId || !selectedSubjectId) {
      ErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const teacher = AVAILABLE_TEACHERS.find((t) => t.id === selectedTeacherId);
    const section = sections.find((s) => s.id === selectedSectionId);
    const subject = subjects.find((s) => s.id === selectedSubjectId);

    if (!teacher || !section || !subject) {
      ErrorMessage("Professor, turma ou disciplina inválidos.");
      return;
    }

    setIsSubmitting(true);
    try {
      assignTeacher({
        schoolId: "dev-school-1",
        teacherId: teacher.id,
        teacherName: teacher.name,
        sectionId: section.id,
        sectionName: section.name,
        subjectId: subject.id,
        subjectName: subject.name,
        weeklyHours: Number(weeklyHours),
        academicYear,
      });

      SucessMessage("Atribuição lectiva registada com sucesso!");
      onClose();
    } catch (err: any) {
      ErrorMessage(err?.message || "Ocorreu um erro ao atribuir o professor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const teacherOptions = AVAILABLE_TEACHERS.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.shift === "MORNING" ? "Manhã" : "Tarde"})`,
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

        <Input
          label="Ano Lectivo"
          startIcon="Calendar"
          value={academicYear}
          disabled
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
