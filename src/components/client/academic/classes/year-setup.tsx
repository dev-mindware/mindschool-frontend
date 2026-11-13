"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ButtonSubmit, Icon, Input } from "@/components";
import { useAcademicYears } from "@/hooks/school/use-academic";
import { useCan } from "@/hooks/auth/use-can";
import { suggestAcademicYear, type AcademicYearDraft } from "@/lib/academic-year";
import { academicYearSetupSchema, isoDateSchema } from "@/schemas";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const yearSetupSchema = z
  .object({
    name: z
      .string({ error: "O nome do ano letivo é obrigatório." })
      .trim()
      .regex(/^\d{4}\/\d{4}$/, "Use o formato AAAA/AAAA (ex.: 2026/2027).")
      .refine(
        (v) => Number(v.slice(5)) === Number(v.slice(0, 4)) + 1,
        "O segundo ano deve ser o seguinte ao primeiro.",
      ),
    start_date: isoDateSchema("A data de início"),
    end_date: isoDateSchema("A data de fim"),
    enrollment_open_date: isoDateSchema("A data de abertura das matrículas"),
    enrollment_close_date: isoDateSchema("A data de fecho das matrículas"),
  })
  .superRefine((data, ctx) => {
    const baseCheck = academicYearSetupSchema.safeParse({
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
    });
    if (!baseCheck.success) {
      for (const issue of baseCheck.error.issues) {
        const mappedPath =
          issue.path[0] === "startDate"
            ? "start_date"
            : issue.path[0] === "endDate"
              ? "end_date"
              : issue.path[0] === "name"
                ? "name"
                : null;
        if (mappedPath) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [mappedPath],
            message: issue.message,
          });
        }
      }
    }
    if (data.enrollment_open_date > data.enrollment_close_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enrollment_close_date"],
        message: "O fecho não pode ser antes da abertura das matrículas.",
      });
    }
    if (data.enrollment_close_date > data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enrollment_close_date"],
        message: "As matrículas têm de fechar até ao fim do ano letivo.",
      });
    }
  });

interface YearSetupProps {
  /** Os anos letivos não puderam ser lidos (não é o mesmo que a escola não ter nenhum). */
  loadFailed: boolean;
  onRetry: () => void;
  onClose: () => void;
}

/**
 * Mostra-se no lugar do formulário da turma quando não há ano letivo para escolher: ou a leitura falhou, ou a escola
 * ainda não criou nenhum (as turmas, matrículas e avaliações vivem dentro de um ano letivo). Em vez de um select
 * vazio, explica o que falta e deixa criar e ativar o primeiro ano aqui mesmo.
 */
export function YearSetup({ loadFailed, onRetry, onClose }: YearSetupProps) {
  const { createYear } = useAcademicYears();
  const { can } = useCan();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AcademicYearDraft>({
    resolver: zodResolver(yearSetupSchema),
    mode: "onChange",
    defaultValues: suggestAcademicYear(),
  });

  if (loadFailed) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xs border border-destructive/30 bg-destructive/5 p-3 text-xs">
          <Icon name="CircleAlert" className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p>Não foi possível carregar os anos letivos da escola. Verifique a ligação e tente de novo; sem o ano letivo não se cria a turma.</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
          <Button type="button" onClick={onRetry}>Tentar de novo</Button>
        </div>
      </div>
    );
  }

  if (!can("academic_year:write")) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xs border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <Icon name="Info" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>Esta escola ainda não tem ano letivo, e as turmas precisam de um. Peça ao titular ou à direção para criar o ano letivo; depois volte aqui.</p>
        </div>
        <div className="flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Fechar</Button></div>
      </div>
    );
  }

  const submit = (draft: AcademicYearDraft) => {
    createYear.mutate(draft, {
      onSuccess: (y) => SucessMessage(`Ano letivo ${y.name} criado${y.status === "activo" ? " e ativado" : ""}. Já pode criar a turma.`),
      onError: (err) => ErrorMessage(getApiErrorMessage(err, "Não foi possível criar o ano lectivo. Verifique as datas e tente novamente.")),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3">
      <div className="flex gap-3 rounded-xs border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          Esta escola ainda não tem <strong>ano letivo</strong>. As turmas, matrículas e avaliações vivem dentro de um, por isso crie o primeiro: fica ativo e é o que a turma vai usar. Os valores abaixo são uma sugestão; ajuste-os se preciso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input label="Ano letivo *" startIcon="CalendarRange" placeholder="2026/2027" {...register("name")} error={errors.name?.message} />
        <Input label="Início *" type="date" {...register("start_date")} error={errors.start_date?.message} />
        <Input label="Fim *" type="date" {...register("end_date")} error={errors.end_date?.message} />
        <Input label="Matrículas abrem em *" type="date" {...register("enrollment_open_date")} error={errors.enrollment_open_date?.message} />
        <Input label="Matrículas fecham em *" type="date" {...register("enrollment_close_date")} error={errors.enrollment_close_date?.message} />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <ButtonSubmit isLoading={createYear.isPending} disabled={!isValid || createYear.isPending}>Criar e ativar ano letivo</ButtonSubmit>
      </div>
    </form>
  );
}
