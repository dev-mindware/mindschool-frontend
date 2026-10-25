"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Subject } from "@/types";
import { useSubjects } from "@/hooks/school/use-academic";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Badge,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";

const subjectFormSchema = z.object({
  name: z.string().trim().min(2, "O nome da disciplina deve ter pelo menos 2 caracteres"),
  code: z.string().trim().optional(),
  gradingScale: z.enum(["quantitativa", "qualitativa", "mista"]),
  isCore: z.boolean(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

const GRADING_SCALE_OPTIONS = [
  { value: "quantitativa", label: "Quantitativa (0 a 20 valores • Padrão Nacional)" },
  { value: "qualitativa", label: "Qualitativa (Menções Descritivas)" },
  { value: "mista", label: "Mista (Quantitativa com Menção)" },
];

const COMMON_PRESETS = [
  { name: "Língua Portuguesa", code: "LP", isCore: true },
  { name: "Matemática", code: "MAT", isCore: true },
  { name: "Física", code: "FIS", isCore: false },
  { name: "Química", code: "QUI", isCore: false },
  { name: "Biologia", code: "BIO", isCore: false },
  { name: "História", code: "HIST", isCore: false },
  { name: "Geografia", code: "GEO", isCore: false },
  { name: "Educação Física", code: "EDF", isCore: false },
  { name: "Língua Inglesa", code: "ING", isCore: false },
  { name: "Língua Francesa", code: "FRA", isCore: false },
  { name: "Informática e TIC", code: "TIC", isCore: false },
  { name: "Filosofia", code: "FIL", isCore: false },
  { name: "Educação Moral e Cívica", code: "EMC", isCore: false },
  { name: "Educação Visual e Plástica", code: "EVP", isCore: false },
];

export function SubjectModal({
  isOpen,
  onClose,
  subjectToEdit,
}: SubjectModalProps) {
  const { save } = useSubjects();
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

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
      name: "",
      code: "",
      gradingScale: "quantitativa",
      isCore: false,
    },
  });

  const selectedGradingScale = watch("gradingScale");
  const isCoreValue = watch("isCore");

  useEffect(() => {
    if (subjectToEdit) {
      reset({
        name: subjectToEdit.name,
        code: subjectToEdit.code || "",
        gradingScale: subjectToEdit.gradingScale || "quantitativa",
        isCore: Boolean(subjectToEdit.isCore),
      });
      setCodeManuallyEdited(true);
    } else {
      reset({
        name: "",
        code: "",
        gradingScale: "quantitativa",
        isCore: false,
      });
      setCodeManuallyEdited(false);
    }
  }, [subjectToEdit, isOpen, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    if (!codeManuallyEdited && !subjectToEdit) {
      const autoCode = val
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);
      setValue("code", autoCode);
    }
  };

  const applyPreset = (name: string, code: string, isCore: boolean) => {
    setValue("name", name, { shouldValidate: true });
    setValue("code", code);
    setValue("isCore", isCore);
    setCodeManuallyEdited(true);
  };

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      await save.mutateAsync({
        id: subjectToEdit?.id,
        name: data.name.trim(),
        isCore: data.isCore,
        code: data.code,
        gradingScale: data.gradingScale,
      });
      SucessMessage(
        subjectToEdit
          ? "Disciplina curricular atualizada com sucesso!"
          : "Nova disciplina adicionada à matriz com sucesso!",
      );
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
      title={subjectToEdit ? "Editar Disciplina Curricular" : "Criar Nova Disciplina"}
      description="Definição da matriz curricular, regime de classificação e critérios pedagógicos"
      className="w-full sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Sugestões Rápidas de Disciplinas Frequentes */}
        {!subjectToEdit && (
          <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
              <Icon name="Sparkles" className="w-3.5 h-3.5 text-primary" />
              Sugestões rápidas do currículo angolano (clique para preencher):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.name, p.code, p.isCore)}
                  className="text-xs px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {p.name} ({p.code})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Nome Descritivo da Disciplina *"
              startIcon="BookOpen"
              placeholder="Ex: Língua Portuguesa, Matemática, Física..."
              {...register("name")}
              onChange={handleNameChange}
              error={errors.name?.message}
            />
          </div>

          <div>
            <Input
              label="Código / Sigla"
              startIcon="Hash"
              placeholder="Ex: LP, MAT"
              {...register("code")}
              onChange={(e) => {
                setCodeManuallyEdited(true);
                setValue("code", e.target.value.toUpperCase());
              }}
              error={errors.code?.message}
            />
          </div>
        </div>

        {/* Escala de Avaliação */}
        <div>
          <SelectField
            label="Escala de Avaliação *"
            value={selectedGradingScale}
            options={GRADING_SCALE_OPTIONS}
            disabled={Boolean(subjectToEdit)}
            onValueChange={(val) => setValue("gradingScale", val as "quantitativa" | "qualitativa" | "mista")}
          />
          {subjectToEdit && (
            <p className="text-[11px] text-muted-foreground mt-1">
              A escala de avaliação é imutável após o registo para garantir a integridade das notas já lançadas.
            </p>
          )}
        </div>

        {/* Toggle Card de Disciplina Nuclear / Chave */}
        <div
          onClick={() => setValue("isCore", !isCoreValue)}
          className={cn(
            "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all",
            isCoreValue
              ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10"
              : "border-border bg-muted/20 hover:bg-muted/40",
          )}
        >
          <div
            className={cn(
              "size-5 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0",
              isCoreValue
                ? "bg-amber-500 border-amber-500 text-white"
                : "border-muted-foreground/40 bg-background",
            )}
          >
            {isCoreValue && <Icon name="Check" className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Disciplina Nuclear / Chave
              </span>
              <Badge
                variant={isCoreValue ? "warning" : "outline"}
                className="text-[10px] py-0 px-1.5"
              >
                {isCoreValue ? "Nuclear (Critério Central)" : "Geral / Complementar"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disciplinas nucleares (ex: Língua Portuguesa e Matemática) possuem critérios pedagógicos determinantes na transição e aprovação do aluno, além de destaque visual em pautas e boletins.
            </p>
          </div>
        </div>

        {/* Informação sobre Carga Horária e Afetação Docente */}
        <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <Icon name="Info" className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            A <strong>carga horária semanal</strong> e o <strong>professor titular</strong> são definidos individualmente por turma na secção de <strong className="text-foreground">Atribuições Curriculares</strong> e na grelha do <strong className="text-foreground">Horário Semanal</strong>.
          </p>
        </div>

        {/* Botões de Ação no Padrão MindGest */}
        <div className="flex justify-end gap-3 pt-3 border-t">
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
