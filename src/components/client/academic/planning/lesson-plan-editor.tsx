"use client";

import { useState } from "react";
import { Button, Icon, Input, SelectField, Textarea } from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTeachingPlans } from "@/hooks/school/use-planning";
import { planningService, type LessonPlanContent, type TeachingPlan } from "@/services/planning-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { usePlanOptions } from "./use-plan-options";

const blank: LessonPlanContent = { thematic_unit: "", summary: "", objectives: "", phases: [{ name: "Introdução", minutes: 10, activities: "" }], assessment: "", post_class: "" };

interface Props {
  plan?: TeachingPlan;
  onClose: () => void;
}

/** Plano de aula: pode aplicar-se a várias turmas da mesma disciplina de uma vez; a IA preenche a partir da unidade temática. */
export function LessonPlanEditor({ plan, onClose }: Props) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { assignments, termOptions } = usePlanOptions();
  const { create, update, submit } = useTeachingPlans();
  const editing = Boolean(plan);

  const [targets, setTargets] = useState<string[]>(plan ? [plan.section_subject_id] : []);
  const [termId, setTermId] = useState(plan?.term_id ?? "");
  const [title, setTitle] = useState(plan?.title ?? "");
  const [lessonDate, setLessonDate] = useState(plan?.lesson_date ?? "");
  const [duration, setDuration] = useState(45);
  const [content, setContent] = useState<LessonPlanContent>(plan ? (plan.content as LessonPlanContent) : blank);
  const [busy, setBusy] = useState<"ai" | "save" | null>(null);

  const first = assignments.find((a) => a.id === targets[0]);
  // Só se aplica a turmas da mesma disciplina que a primeira escolhida.
  const sameSubject = first ? assignments.filter((a) => a.subjectId === first.subjectId) : assignments;
  const patch = (p: Partial<LessonPlanContent>) => setContent((c) => ({ ...c, ...p }));

  const toggle = (id: string) => setTargets((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const draft = async () => {
    if (!first || !schoolId) return ErrorMessage("Escolha primeiro a disciplina e a turma.");
    if (!content.thematic_unit.trim()) return ErrorMessage("Indique a unidade temática para a IA preencher o plano.");
    setBusy("ai");
    try {
      const out = await planningService.draftLessonPlan({ schoolId, subject: first.subjectName, classLevel: first.classLevel || first.sectionName, thematicUnit: content.thematic_unit.trim(), summary: content.summary || undefined, durationMinutes: duration });
      setContent(out);
      if (!title.trim()) setTitle(out.thematic_unit);
      SucessMessage("Rascunho gerado: reveja antes de guardar.");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível gerar o rascunho agora."));
    } finally {
      setBusy(null);
    }
  };

  const save = async (andSubmit: boolean) => {
    if (title.trim().length < 3) return ErrorMessage("Dê um título ao plano.");
    if (!editing && (targets.length === 0 || !termId)) return ErrorMessage("Escolha a(s) turma(s) e o trimestre.");
    if (!content.thematic_unit.trim() || !content.objectives.trim()) return ErrorMessage("A unidade temática e os objetivos são obrigatórios.");
    if (content.phases.length === 0 || content.phases.some((p) => !p.name.trim() || p.minutes < 1)) return ErrorMessage("Cada fase precisa de nome e duração.");
    setBusy("save");
    try {
      const ids = plan
        ? [(await update.mutateAsync({ id: plan.id, title: title.trim(), lessonDate: lessonDate || null, content })).id]
        : (await create.mutateAsync({ kind: "plano_aula", sectionSubjectIds: targets, termId, title: title.trim(), lessonDate: lessonDate || undefined, content })).map((p) => p.id);
      if (andSubmit) for (const id of ids) await submit.mutateAsync(id);
      SucessMessage(andSubmit ? "Plano submetido à Direção Pedagógica." : ids.length > 1 ? `${ids.length} planos guardados (um por turma).` : "Rascunho guardado.");
      onClose();
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o plano."));
    } finally {
      setBusy(null);
    }
  };

  const setPhase = (i: number, p: Partial<LessonPlanContent["phases"][number]>) => patch({ phases: content.phases.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const total = content.phases.reduce((n, p) => n + (p.minutes || 0), 0);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-3xl">
        <SheetHeader className="p-0">
          <SheetTitle>{editing ? "Editar plano de aula" : "Novo plano de aula"}</SheetTitle>
          <SheetDescription>Cabeçalho, objetivos, fases, avaliação e pós-aula. A IA preenche a partir da unidade temática.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <p className="text-sm font-medium">{editing ? "Turma" : "Turmas (da mesma disciplina)"}</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {(editing ? assignments.filter((a) => a.id === plan!.section_subject_id) : sameSubject).map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-sm border px-2 py-1.5 text-sm">
                  <Checkbox checked={targets.includes(a.id)} onCheckedChange={() => !editing && toggle(a.id)} disabled={editing} />
                  {a.label}
                </label>
              ))}
              {assignments.length === 0 && <p className="text-sm text-muted-foreground">Não tem disciplinas atribuídas neste ano letivo.</p>}
            </div>
          </div>
          <SelectField label="Trimestre" options={termOptions} value={termId} onValueChange={setTermId} placeholder="Escolha o trimestre…" disabled={editing} />
          <Input label="Data da aula (opcional)" type="date" value={lessonDate} onChange={(e) => setLessonDate(e.target.value)} />
          <div className="sm:col-span-2"><Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Frações: introdução" /></div>
        </div>

        <div className="grid gap-3 rounded-sm border bg-muted/30 p-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
          <Input label="Unidade temática" value={content.thematic_unit} onChange={(e) => patch({ thematic_unit: e.target.value })} />
          <Input label="Minutos" type="number" min={10} max={240} value={duration} onChange={(e) => setDuration(Math.min(240, Math.max(10, Number(e.target.value) || 45)))} />
          <Button type="button" className="gap-2" onClick={draft} disabled={busy !== null}>
            <Icon name="Sparkles" className="size-4" />
            {busy === "ai" ? "A gerar…" : "Preencher com IA"}
          </Button>
        </div>

        <Textarea label="Sumário / contexto (opcional)" rows={2} value={content.summary} onChange={(e) => patch({ summary: e.target.value })} />
        <Textarea label="Objetivos" rows={2} value={content.objectives} onChange={(e) => patch({ objectives: e.target.value })} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Fases da aula <span className="text-xs font-normal text-muted-foreground">({total} min no total)</span></p>
            <Button type="button" variant="outline" size="sm" onClick={() => patch({ phases: [...content.phases, { name: "", minutes: 10, activities: "" }] })} disabled={content.phases.length >= 10}>Acrescentar fase</Button>
          </div>
          {content.phases.map((p, i) => (
            <div key={i} className="grid gap-2 rounded-sm border p-2 sm:grid-cols-[10rem_5rem_1fr_auto] sm:items-start">
              <Input aria-label={`Nome da fase ${i + 1}`} label="Fase" value={p.name} onChange={(e) => setPhase(i, { name: e.target.value })} />
              <Input aria-label={`Minutos da fase ${i + 1}`} label="Min." type="number" min={1} max={240} value={p.minutes} onChange={(e) => setPhase(i, { minutes: Number(e.target.value) || 0 })} />
              <Textarea aria-label={`Atividades da fase ${i + 1}`} label="Atividades" rows={2} value={p.activities} onChange={(e) => setPhase(i, { activities: e.target.value })} />
              <Button type="button" variant="ghost" size="icon" className="mt-6" title="Remover fase" onClick={() => patch({ phases: content.phases.filter((_, j) => j !== i) })} disabled={content.phases.length <= 1}>
                <Icon name="Trash2" className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Textarea label="Avaliação" rows={2} value={content.assessment} onChange={(e) => patch({ assessment: e.target.value })} />
        <Textarea label="Pós-aula (TPC, reflexão)" rows={2} value={content.post_class} onChange={(e) => patch({ post_class: e.target.value })} />

        <SheetFooter className="flex-row flex-wrap justify-end gap-2 p-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy === "save"}>Cancelar</Button>
          <Button type="button" variant="outline" onClick={() => save(false)} disabled={busy !== null}>Guardar rascunho</Button>
          <Button type="button" onClick={() => save(true)} disabled={busy !== null}>Guardar e submeter</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
