"use client";

import { useState } from "react";
import { Button, Icon, Input, SelectField, Textarea } from "@/components";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTeachingPlans } from "@/hooks/school/use-planning";
import { planningService, type DosificacaoWeek, type TeachingPlan } from "@/services/planning-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { usePlanOptions } from "./use-plan-options";

const emptyWeek = (week: number): DosificacaoWeek => ({ week, theme: "", objectives: "", contents: "", lessons: 2 });

interface Props {
  plan?: TeachingPlan;
  onClose: () => void;
}

/** Dosificação trimestral: o professor escreve ou pede um rascunho à IA, revê semana a semana e só então guarda. */
export function DosificacaoEditor({ plan, onClose }: Props) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { assignments, termOptions } = usePlanOptions();
  const { create, update, submit } = useTeachingPlans();
  const editing = Boolean(plan);

  const [assignmentId, setAssignmentId] = useState(plan?.section_subject_id ?? "");
  const [termId, setTermId] = useState(plan?.term_id ?? "");
  const [title, setTitle] = useState(plan?.title ?? "");
  const [weeksCount, setWeeksCount] = useState(12);
  const [themes, setThemes] = useState("");
  const [weeks, setWeeks] = useState<DosificacaoWeek[]>(plan ? (plan.content as { weeks: DosificacaoWeek[] }).weeks : []);
  const [busy, setBusy] = useState<number | "all" | "save" | null>(null);

  const assignment = assignments.find((a) => a.id === assignmentId);
  const termLabel = termOptions.find((t) => t.value === termId)?.label ?? "";

  const draft = async (onlyWeek?: number) => {
    if (!assignment || !schoolId) return ErrorMessage("Escolha primeiro a disciplina.");
    setBusy(onlyWeek ?? "all");
    try {
      const out = await planningService.draftDosificacao({
        schoolId, subject: assignment.subjectName, classLevel: assignment.classLevel || assignment.sectionName, termLabel,
        weeks: onlyWeek ? Math.max(weeksCount, weeks.length) : weeksCount, weeklyHours: assignment.weeklyHours, themes: themes || undefined,
        ...(onlyWeek ? { onlyWeek, currentWeeks: weeks } : {}),
      });
      setWeeks((cur) => (onlyWeek ? cur.map((w) => (w.week === onlyWeek ? { ...out[0], week: onlyWeek } : w)) : out));
      SucessMessage(onlyWeek ? `Semana ${onlyWeek} regenerada: reveja antes de guardar.` : "Rascunho gerado: reveja cada semana antes de guardar.");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível gerar o rascunho agora."));
    } finally {
      setBusy(null);
    }
  };

  const patchWeek = (week: number, patch: Partial<DosificacaoWeek>) => setWeeks((cur) => cur.map((w) => (w.week === week ? { ...w, ...patch } : w)));

  const save = async (andSubmit: boolean) => {
    if (title.trim().length < 3) return ErrorMessage("Dê um título à dosificação.");
    if (!editing && (!assignmentId || !termId)) return ErrorMessage("Escolha a disciplina e o trimestre.");
    if (weeks.length === 0 || weeks.some((w) => !w.theme.trim())) return ErrorMessage("Todas as semanas precisam de um tema.");
    setBusy("save");
    try {
      const id = plan
        ? (await update.mutateAsync({ id: plan.id, title: title.trim(), content: { weeks } })).id
        : (await create.mutateAsync({ kind: "dosificacao", sectionSubjectIds: [assignmentId], termId, title: title.trim(), content: { weeks } }))[0].id;
      if (andSubmit) await submit.mutateAsync(id);
      SucessMessage(andSubmit ? "Dosificação submetida à Direção Pedagógica." : "Rascunho guardado.");
      onClose();
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a dosificação."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-4xl">
        <SheetHeader className="p-0">
          <SheetTitle>{editing ? "Editar dosificação" : "Nova dosificação trimestral"}</SheetTitle>
          <SheetDescription>Planeamento semanal do trimestre. A IA propõe um rascunho; o professor revê e decide.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Disciplina e turma" options={assignments.map((a) => ({ value: a.id, label: a.label }))} value={assignmentId} onValueChange={setAssignmentId} placeholder="Escolha a disciplina…" disabled={editing} />
          <SelectField label="Trimestre" options={termOptions} value={termId} onValueChange={setTermId} placeholder="Escolha o trimestre…" disabled={editing} />
          <div className="sm:col-span-2"><Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Dosificação de Matemática, 1.º trimestre" /></div>
        </div>

        {!editing && (
          <div className="grid gap-3 rounded-sm border bg-muted/30 p-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
            <Input label="Semanas" type="number" min={1} max={16} value={weeksCount} onChange={(e) => setWeeksCount(Math.min(16, Math.max(1, Number(e.target.value) || 1)))} />
            <Textarea label="Temas ou programa (opcional)" value={themes} onChange={(e) => setThemes(e.target.value)} rows={2} placeholder="Cole aqui as unidades temáticas do programa. Sem isto, a IA propõe uma sequência típica." />
            <Button type="button" className="gap-2" onClick={() => draft()} disabled={busy !== null || !assignmentId}>
              <Icon name="Sparkles" className="size-4" />
              {busy === "all" ? "A gerar…" : "Gerar com IA"}
            </Button>
          </div>
        )}

        {weeks.length === 0 ? (
          <div className="flex items-center justify-between gap-2 rounded-sm border p-4 text-sm text-muted-foreground">
            Ainda sem semanas: gere um rascunho com a IA ou comece em branco.
            <Button type="button" variant="outline" size="sm" onClick={() => setWeeks(Array.from({ length: weeksCount }, (_, i) => emptyWeek(i + 1)))}>Começar em branco</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {weeks.map((w) => (
              <div key={w.week} className="grid gap-2 rounded-sm border p-3 sm:grid-cols-[3rem_1fr_1fr_1fr_5rem_auto] sm:items-start">
                <span className="pt-2 font-mono text-xs text-muted-foreground">S{w.week}</span>
                <Input aria-label={`Tema da semana ${w.week}`} label="Tema" value={w.theme} onChange={(e) => patchWeek(w.week, { theme: e.target.value })} />
                <Textarea aria-label={`Objetivos da semana ${w.week}`} label="Objetivos" rows={2} value={w.objectives} onChange={(e) => patchWeek(w.week, { objectives: e.target.value })} />
                <Textarea aria-label={`Conteúdos da semana ${w.week}`} label="Conteúdos" rows={2} value={w.contents} onChange={(e) => patchWeek(w.week, { contents: e.target.value })} />
                <Input aria-label={`Aulas da semana ${w.week}`} label="Aulas" type="number" min={0} max={20} value={w.lessons ?? ""} onChange={(e) => patchWeek(w.week, { lessons: e.target.value === "" ? undefined : Number(e.target.value) })} />
                <Button type="button" variant="ghost" size="icon" title="Regenerar esta semana com IA" onClick={() => draft(w.week)} disabled={busy !== null || !assignmentId} className="mt-6">
                  <Icon name={busy === w.week ? "Loader" : "RefreshCw"} className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <SheetFooter className="flex-row flex-wrap justify-end gap-2 p-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy === "save"}>Cancelar</Button>
          <Button type="button" variant="outline" onClick={() => save(false)} disabled={busy !== null}>Guardar rascunho</Button>
          <Button type="button" onClick={() => save(true)} disabled={busy !== null}>Guardar e submeter</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
