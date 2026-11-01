"use client";

import type { DosificacaoWeek, LessonPlanContent, TeachingPlan } from "@/services/planning-service";

const Field = ({ label, children }: { label: string; children?: string }) =>
  children ? (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="whitespace-pre-line text-sm">{children}</p>
    </div>
  ) : null;

/** Leitura de um plano (dosificação ou plano de aula), usada na revisão e na consulta. */
export function PlanView({ plan }: { plan: TeachingPlan }) {
  if (plan.kind === "dosificacao") {
    const weeks = (plan.content as { weeks: DosificacaoWeek[] }).weeks;
    return (
      <div className="overflow-x-auto rounded-sm border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr><th className="px-3 py-2">Sem.</th><th className="px-3 py-2">Tema</th><th className="px-3 py-2">Objetivos</th><th className="px-3 py-2">Conteúdos</th><th className="px-3 py-2">Aulas</th></tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.week} className="border-t align-top">
                <td className="px-3 py-2 font-mono text-xs">{w.week}</td>
                <td className="px-3 py-2 font-medium">{w.theme}</td>
                <td className="px-3 py-2 text-muted-foreground">{w.objectives}</td>
                <td className="px-3 py-2 text-muted-foreground">{w.contents}</td>
                <td className="px-3 py-2">{w.lessons ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const c = plan.content as LessonPlanContent;
  return (
    <div className="space-y-3">
      <Field label="Unidade temática">{c.thematic_unit}</Field>
      <Field label="Sumário">{c.summary}</Field>
      <Field label="Objetivos">{c.objectives}</Field>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Fases</p>
        <ul className="mt-1 space-y-1 text-sm">
          {c.phases.map((p, i) => (
            <li key={i}><strong>{p.name}</strong> ({p.minutes} min){p.activities ? `: ${p.activities}` : ""}</li>
          ))}
        </ul>
      </div>
      <Field label="Avaliação">{c.assessment}</Field>
      <Field label="Pós-aula">{c.post_class}</Field>
    </div>
  );
}
