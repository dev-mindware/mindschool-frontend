"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AcademicSection, Shift, EducationCycle } from "@/types";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const classSectionFormSchema = z.object({
  name: z.string().trim().min(2, "O nome da turma é obrigatório (ex: 10ª A)"),
  classLevel: z.string().min(1, "Selecione o ano de escolaridade"),
  cycle: z.enum(["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY"]),
  shift: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  roomNumber: z.string().trim().min(1, "Indique a sala de aulas"),
  capacity: z.coerce.number().int().min(1, "A lotação deve ser de pelo menos 1 aluno"),
  academicYear: z.string().min(1),
});

type ClassSectionFormValues = z.infer<typeof classSectionFormSchema>;

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToEdit?: AcademicSection | null;
}

export function ClassModal({ isOpen, onClose, sectionToEdit }: ClassModalProps) {
  const { addSection, updateSection } = useSchoolDataStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassSectionFormValues>({
    resolver: zodResolver(classSectionFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      classLevel: "7ª Classe",
      cycle: "LOWER_SECONDARY",
      shift: "MORNING",
      roomNumber: "Sala 1",
      capacity: 40,
      academicYear: "2025/2026",
    },
  });

  const selectedCycle = watch("cycle");
  const selectedShift = watch("shift");
  const selectedClassLevel = watch("classLevel");

  useEffect(() => {
    if (sectionToEdit) {
      reset({
        name: sectionToEdit.name,
        classLevel: sectionToEdit.classLevel,
        cycle: sectionToEdit.cycle,
        shift: sectionToEdit.shift,
        roomNumber: sectionToEdit.roomNumber,
        capacity: sectionToEdit.capacity,
        academicYear: sectionToEdit.academicYear,
      });
    } else {
      reset({
        name: "",
        classLevel: "7ª Classe",
        cycle: "LOWER_SECONDARY",
        shift: "MORNING",
        roomNumber: "Sala 1",
        capacity: 40,
        academicYear: "2025/2026",
      });
    }
  }, [sectionToEdit, isOpen, reset]);

  const onSubmit = async (data: ClassSectionFormValues) => {
    try {
      if (sectionToEdit) {
        updateSection(sectionToEdit.id, {
          name: data.name,
          classLevel: data.classLevel,
          roomNumber: data.roomNumber,
          capacity: data.capacity,
          shift: data.shift,
          cycle: data.cycle,
          academicYear: data.academicYear,
        });
        SucessMessage("Turma atualizada com sucesso!");
      } else {
        addSection({
          schoolId: "dev-school-1",
          name: data.name,
          classLevel: data.classLevel,
          roomNumber: data.roomNumber,
          capacity: data.capacity,
          shift: data.shift,
          cycle: data.cycle,
          academicYear: data.academicYear,
          isActive: true,
        });
        SucessMessage("Nova turma criada com sucesso!");
      }

      onClose();
    } catch (err: any) {
      ErrorMessage(err?.message || "Ocorreu um erro ao gravar a turma.");
    }
  };

  const cycleOptions = [
    { value: "PRIMARY", label: "Ensino Primário (Iniciação à 6ª)" },
    { value: "LOWER_SECONDARY", label: "Iº Ciclo Secundário (7ª à 9ª)" },
    { value: "UPPER_SECONDARY", label: "IIº Ciclo / Técnico (10ª à 13ª)" },
  ];

  const shiftOptions = [
    { value: "MORNING", label: "Manhã (07:30 - 12:30)" },
    { value: "AFTERNOON", label: "Tarde (13:00 - 18:00)" },
    { value: "EVENING", label: "Noite / Pós-laboral" },
  ];

  const classLevelOptions = [
    { value: "Iniciação", label: "Classe de Iniciação" },
    { value: "1ª Classe", label: "1ª Classe" },
    { value: "2ª Classe", label: "2ª Classe" },
    { value: "3ª Classe", label: "3ª Classe" },
    { value: "4ª Classe", label: "4ª Classe" },
    { value: "5ª Classe", label: "5ª Classe" },
    { value: "6ª Classe", label: "6ª Classe" },
    { value: "7ª Classe", label: "7ª Classe" },
    { value: "8ª Classe", label: "8ª Classe" },
    { value: "9ª Classe", label: "9ª Classe" },
    { value: "10ª Classe", label: "10ª Classe" },
    { value: "11ª Classe", label: "11ª Classe" },
    { value: "12ª Classe", label: "12ª Classe" },
    { value: "13ª Classe", label: "13ª Classe" },
  ];

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={sectionToEdit ? "Editar Turma" : "Criar Nova Turma"}
      description="Configuração de classe, turno lectivo, sala física e lotação"
      className="!max-h-[85vh] !max-w-lg overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Nome Descritivo da Turma *"
          startIcon="DoorOpen"
          placeholder="Ex: 10ª A, 7ª B, 11ª Informática"
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Nível / Classe *"
            value={selectedClassLevel}
            options={classLevelOptions}
            onValueChange={(val) => setValue("classLevel", val)}
          />

          <SelectField
            label="Ciclo Pedagógico *"
            value={selectedCycle}
            options={cycleOptions}
            onValueChange={(val) => setValue("cycle", val as EducationCycle)}
          />

          <SelectField
            label="Turno Lectivo *"
            value={selectedShift}
            options={shiftOptions}
            onValueChange={(val) => setValue("shift", val as Shift)}
          />

          <Input
            label="Sala de Aulas *"
            startIcon="Building2"
            placeholder="Ex: Sala 14, Lab 2"
            {...register("roomNumber")}
            error={errors.roomNumber?.message}
          />

          <Input
            type="number"
            label="Capacidade de Alunos *"
            startIcon="Users"
            placeholder="40"
            {...register("capacity")}
            error={errors.capacity?.message}
          />

          <Input
            label="Ano Lectivo"
            startIcon="Calendar"
            {...register("academicYear")}
            disabled
          />
        </div>

        {/* Botões de Ação no Padrão MindGest */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            {sectionToEdit ? "Guardar Alterações" : "Criar Turma"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
