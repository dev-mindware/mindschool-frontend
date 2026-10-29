"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonSubmit, Icon, Input } from "@/components";
import { useAcademicYears } from "@/hooks/school/use-academic";
import { useCan } from "@/hooks/auth/use-can";
import { suggestAcademicYear, validateAcademicYear, type AcademicYearDraft, type AcademicYearErrors } from "@/lib/academic-year";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

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
  const [draft, setDraft] = useState<AcademicYearDraft>(() => suggestAcademicYear());
  const [errors, setErrors] = useState<AcademicYearErrors>({});

  const set = (k: keyof AcademicYearDraft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateAcademicYear(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    createYear.mutate(draft, {
      onSuccess: (y) => SucessMessage(`Ano letivo ${y.name} criado${y.status === "activo" ? " e ativado" : ""}. Já pode criar a turma.`),
      onError: (err) => ErrorMessage(getApiErrorMessage(err, "Não foi possível criar o ano letivo.")),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-3 rounded-xs border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          Esta escola ainda não tem <strong>ano letivo</strong>. As turmas, matrículas e avaliações vivem dentro de um, por isso crie o primeiro: fica ativo e é o que a turma vai usar. Os valores abaixo são uma sugestão; ajuste-os se preciso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input label="Ano letivo *" startIcon="CalendarRange" placeholder="2026/2027" value={draft.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <Input label="Início *" type="date" value={draft.start_date} onChange={(e) => set("start_date", e.target.value)} error={errors.start_date} />
        <Input label="Fim *" type="date" value={draft.end_date} onChange={(e) => set("end_date", e.target.value)} error={errors.end_date} />
        <Input label="Matrículas abrem em *" type="date" value={draft.enrollment_open_date} onChange={(e) => set("enrollment_open_date", e.target.value)} error={errors.enrollment_open_date} />
        <Input label="Matrículas fecham em *" type="date" value={draft.enrollment_close_date} onChange={(e) => set("enrollment_close_date", e.target.value)} error={errors.enrollment_close_date} />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <ButtonSubmit isLoading={createYear.isPending}>Criar e ativar ano letivo</ButtonSubmit>
      </div>
    </form>
  );
}
