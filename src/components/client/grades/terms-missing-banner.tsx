"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Can, Icon } from "@/components";
import { gradesService } from "@/services/grades-service";
import { academicService } from "@/services/academic-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

/**
 * Sem trimestres o ano letivo não tem onde lançar notas: o ecrã dizia «a disciplina não está atribuída» quando a causa
 * era esta. Aparece nas páginas de avaliação enquanto o ano letivo ativo não tem períodos e deixa criar os 3 trimestres.
 */
export function TermsMissingBanner() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const year = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: Boolean(schoolId), staleTime: 5 * 60 * 1000 });
  const terms = useQuery({ queryKey: ["terms-of-active-year", schoolId, year.data?.id], queryFn: gradesService.terms, enabled: Boolean(year.data?.id), staleTime: 60 * 1000 });
  const create = useMutation({
    mutationFn: gradesService.createDefaultTerms,
    onSuccess: () => {
      SucessMessage("Trimestres criados. Já pode lançar notas.");
      void queryClient.invalidateQueries();
    },
    onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível criar os trimestres.")),
  });

  if (!year.data || terms.isLoading || (terms.data?.length ?? 0) > 0) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
      <Icon name="TriangleAlert" className="size-5 shrink-0 text-amber-600" />
      <p className="min-w-0 flex-1">
        <strong>O ano letivo {year.data.name} ainda não tem trimestres.</strong> Sem eles não se lançam notas, pautas nem boletins.
      </p>
      <Can permission="term:write" fallback={<span className="text-xs text-muted-foreground">Peça à direção para criar os trimestres.</span>}>
        <Button size="sm" disabled={create.isPending} onClick={() => create.mutate()}>Criar os 3 trimestres</Button>
      </Can>
    </div>
  );
}
