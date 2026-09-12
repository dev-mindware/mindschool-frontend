"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Subject, EducationCycle } from "@/types";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const subjectFormSchema = z.object({
  code: z.string().trim().min(2, "Código curricular deve ter no mínimo 2 letras").toUpperCase(),
  name: z.string().trim().min(2, "Nome da disciplina é obrigatório"),
  cycle: z.enum(["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY"]),
  weeklyHours: z.coerce.number().int().min(1, "A carga horária deve ser de pelo menos 1 hora semanal"),
  isCore: z.boolean(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

export function SubjectModal({
  isOpen,
  onClose,
  subjectToEdit,
}: SubjectModalProps) {
  const { addSubject, updateSubject } = useSchoolDataStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      name: "",
      cycle: "LOWER_SECONDARY",
      weeklyHours: 4,
      isCore: false,
    },
  });

  const selectedCycle = watch("cycle");

  useEffect(() => {
    if (subjectToEdit) {
      reset({
        code: subjectToEdit.code,
        name: subjectToEdit.name,
        cycle: subjectToEdit.cycle,
        weeklyHours: subjectToEdit.weeklyHours,
        isCore: subjectToEdit.isCore || false,
      });
    } else {
      reset({
        code: "",
        name: "",
        cycle: "LOWER_SECONDARY",
        weeklyHours: 4,
        isCore: false,
      });
    }
  }, [subjectToEdit, isOpen, reset]);

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      if (subjectToEdit) {
        updateSubject(subjectToEdit.id, {
          code: data.code.toUpperCase(),
          name: data.name,
          cycle: data.cycle,
          weeklyHours: data.weeklyHours,
          isCore: data.isCore,
        });
        SucessMessage("Disciplina curricular atualizada com sucesso!");
      } else {
        addSubject({
          schoolId: "dev-school-1",
          code: data.code.toUpperCase(),
          name: data.name,
          cycle: data.cycle,
          weeklyHours: data.weeklyHours,
          isCore: data.isCore,
          isActive: true,
        });
        SucessMessage("Nova disciplina adicionada à matriz com sucesso!");
      }

      onClose();
    } catch (err: any) {
      ErrorMessage(err?.message || "Ocorreu um erro ao gravar a disciplina.");
    }
  };

  const cycleOptions = [
    { value: "PRIMARY", label: "Ensino Primário (1ª à 6ª Classe)" },
    { value: "LOWER_SECONDARY", label: "Iº Ciclo Secundário (7ª à 9ª Classe)" },
    { value: "UPPER_SECONDARY", label: "IIº Ciclo / Técnico (10ª à 13ª Classe)" },
  ];

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={subjectToEdit ? "Editar Disciplina" : "Criar Nova Disciplina"}
      description="Definição curricular e atribuição de carga semanal de tempos letivos"
      className="!max-h-[85vh] !max-w-md overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Código Curricular *"
          startIcon="Tag"
          placeholder="Ex: MAT, LP, FIS, HIST"
          {...register("code")}
          error={errors.code?.message}
        />

        <Input
          label="Designação da Disciplina *"
          startIcon="BookOpen"
          placeholder="Ex: Língua Portuguesa, Matemática"
          {...register("name")}
          error={errors.name?.message}
        />

        <SelectField
          label="Ciclo Pedagógico *"
          value={selectedCycle}
          options={cycleOptions}
          onValueChange={(val) => setValue("cycle", val as EducationCycle)}
        />

        <Input
          type="number"
          label="Carga Horária Semanal (Tempos) *"
          startIcon="Clock"
          placeholder="4"
          {...register("weeklyHours")}
          error={errors.weeklyHours?.message}
        />

        {/* Botões de Ação no Padrão MindGest */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            {subjectToEdit ? "Guardar Alterações" : "Criar Disciplina"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
