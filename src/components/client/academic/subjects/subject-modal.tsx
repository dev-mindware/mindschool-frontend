"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Subject, EducationCycle } from "@/types";
import { useSubjects } from "@/hooks/school/use-academic";
import { getApiErrorMessage } from "@/utils/api-error";
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
  const { save } = useSubjects();

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
      await save.mutateAsync({ id: subjectToEdit?.id, name: data.name, isCore: data.isCore });
      SucessMessage(subjectToEdit ? "Disciplina curricular atualizada com sucesso!" : "Nova disciplina adicionada à matriz com sucesso!");
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao gravar a disciplina."));
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={subjectToEdit ? "Editar Disciplina" : "Criar Nova Disciplina"}
      description="Definição curricular da disciplina (a carga horária define-se ao atribuir à turma)"
      className="!max-h-[85vh] !max-w-md overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Designação da Disciplina *"
          startIcon="BookOpen"
          placeholder="Ex: Língua Portuguesa, Matemática"
          {...register("name")}
          error={errors.name?.message}
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
