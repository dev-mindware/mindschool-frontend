"use client";
import { familyKeys } from "@/modules/family/query-keys";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, Icon } from "@/components";
import { portalService } from "@/modules/family/services/portal-service";
import type { FamilyContext } from "./family-shell";

/** Disciplinas da turma do educando: professor, carga horária semanal e última média (só de pautas fechadas). */
export function FamilySubjects({ studentId }: FamilyContext) {
  const { data: subjects = [], isLoading, isError } = useQuery({ queryKey: familyKeys.subjects(studentId), queryFn: () => portalService.subjects(studentId), enabled: Boolean(studentId), retry: false, staleTime: 60 * 1000 });

  if (isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  if (isError) return <EmptyState icon="Lock" title="Sem acesso" description="Não tem autorização para consultar as disciplinas deste educando." />;
  if (subjects.length === 0) return <EmptyState icon="BookOpen" title="Sem disciplinas" description="As disciplinas aparecem aqui quando a escola atribuir os professores à turma." />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 @5xl/main:grid-cols-3">
      {subjects.map((s) => (
        <div key={s.id} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon name="BookOpen" className="size-4" /></div><p className="font-medium">{s.subject}</p></div>
            {s.last_mt !== null && (
              <span title={`MT do ${s.last_term}.º trimestre`} className={`rounded-md px-2 py-0.5 font-mono text-sm font-semibold ${s.last_mt < 10 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700"}`}>{s.last_mt.toFixed(1)}</span>
            )}
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5"><Icon name="User" className="size-3.5" />{s.teacher}</p>
            <p className="flex items-center gap-1.5"><Icon name="Clock" className="size-3.5" />{s.weekly_hours} {s.weekly_hours === 1 ? "aula" : "aulas"} por semana</p>
          </div>
        </div>
      ))}
    </div>
  );
}
