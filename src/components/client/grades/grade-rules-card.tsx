"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components";
import { Badge } from "@/components/ui/badge";
import { useGradeTerms } from "@/hooks/school/use-grades";
import { readRawSettings } from "@/services/school-settings-service";
import { SEQUENCE_OF_TERM } from "@/services/grades-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { AssessmentTerm } from "@/types/grade";
import { formatIsoDay } from "@/utils";

interface EvaluationPolicy {
  pass_mark?: number;
  mt_rounding?: "integer" | "two_decimals";
  mt_weights?: { mac?: number; mas?: number; pp?: number };
}

const DAY_MS = 86_400_000;

/** Dias inteiros entre hoje e uma data (AAAA-MM-DD); negativo se já passou. */
function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  return Math.round((target - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / DAY_MS);
}

function deadlineText(days: number): { text: string; tone: "default" | "warning" | "destructive" } {
  if (days < 0) return { text: `terminou há ${-days} ${-days === 1 ? "dia" : "dias"}`, tone: "destructive" };
  if (days === 0) return { text: "termina hoje", tone: "destructive" };
  return { text: `faltam ${days} ${days === 1 ? "dia" : "dias"}`, tone: days <= 14 ? "warning" : "default" };
}

/** Mostra à pessoa que lança notas como a MT se calcula nesta escola e quanto tempo falta para o fim do período. */
export function GradeRulesCard({ term }: { term: AssessmentTerm }) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const settings = useQuery({ queryKey: ["settings-raw", schoolId], queryFn: readRawSettings, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const terms = useGradeTerms();

  const policy = (settings.data?.["evaluation"] ?? {}) as EvaluationPolicy;
  const weights = { mac: policy.mt_weights?.mac ?? 1, mas: policy.mt_weights?.mas ?? 1, pp: policy.mt_weights?.pp ?? 1 };
  const passMark = policy.pass_mark ?? 10;
  const rounding = policy.mt_rounding === "two_decimals" ? "duas casas decimais" : "ao valor inteiro";

  const period = useMemo(() => terms.data?.find((t) => t.sequence === SEQUENCE_OF_TERM[term]), [terms.data, term]);
  const deadline = period ? deadlineText(daysUntil(period.end_date)) : null;

  return (
    <div className="flex flex-col gap-3 rounded-sm border bg-card p-3 text-sm sm:flex-row sm:items-start sm:justify-between" data-tour="notas-rules">
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-medium">
          <Icon name="Calculator" className="size-4 text-primary" />
          Como se calcula a MT nesta escola
        </div>
        <p className="font-mono text-xs text-foreground">
          MT = (MAC × {weights.mac} + MAS × {weights.mas} + NPT × {weights.pp}) ÷ {weights.mac + weights.mas + weights.pp}
        </p>
        <p className="text-xs text-muted-foreground">
          Notas de 0 a 20, arredondadas {rounding}. Positiva a partir de {passMark} valores. A MT só existe com a prova trimestral lançada. Os pesos e o arredondamento mudam-se em Definições › Políticas da Escola.
        </p>
      </div>
      {period && deadline && (
        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <span className="text-xs text-muted-foreground">Fim do período</span>
          <span className="font-medium">{formatIsoDay(period.end_date)}</span>
          <Badge variant={deadline.tone === "default" ? "info" : deadline.tone}>{deadline.text}</Badge>
        </div>
      )}
    </div>
  );
}
