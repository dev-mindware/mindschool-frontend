"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Button, FormSelect, Icon, Input, Textarea } from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTeachingPlans } from "@/hooks/school/use-planning";
import {
  isValidIsoDate,
  optionalSafeTextSchema,
  quantitySchema,
  safeTextSchema,
} from "@/schemas/helps";
import { planningService, type LessonPlanContent, type TeachingPlan } from "@/services/planning-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { usePlanOptions } from "./use-plan-options";

const lessonPlanSchema = z
  .object({
    editing: z.boolean(),
    targets: z.array(z.string()),
    termId: z.string().trim(),
    lessonDate: z
      .string()
      .trim()
      .refine((v) => v === "" || isValidIsoDate(v), "Data da aula inválida (AAAA-MM-DD).")
      .optional(),
    title: safeTextSchema(3, 150, "O título do plano"),
    duration: quantitySchema(10, 240, "A duração da aula"),
    thematic_unit: safeTextSchema(2, 200, "A unidade temática"),
    summary: optionalSafeTextSchema(2000, 2, "O sumário / contexto"),
    objectives: safeTextSchema(3, 2000, "Os objetivos"),
    phases: z
      .array(
        z.object({
          name: safeTextSchema(2, 100, "O nome da fase"),
          minutes: quantitySchema(1, 240, "Os minutos"),
          activities: optionalSafeTextSchema(1000, 2, "As atividades"),
        }),
      )
      .min(1, "Adicione pelo menos uma fase."),
    assessment: optionalSafeTextSchema(1500, 2, "A avaliação"),
    post_class: optionalSafeTextSchema(1500, 2, "O pós-aula"),
  })
  .superRefine((data, ctx) => {
    if (!data.editing && data.targets.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targets"],
        message: "Seleccione pelo menos uma turma.",
      });
    }
    if (!data.editing && !data.termId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termId"],
        message: "Seleccione o trimestre.",
      });
    }
  });

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
  const [duration, setDuration] = useState<number | string>(45);
  const [content, setContent] = useState<LessonPlanContent>(plan ? (plan.content as LessonPlanContent) : blank);
  const [busy, setBusy] = useState<"ai" | "save" | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((p) => (p[k] ? p : { ...p, [k]: true }));

  const first = assignments.find((a) => a.id === targets[0]);
  // Só se aplica a turmas da mesma disciplina que a primeira escolhida.
  const sameSubject = first ? assignments.filter((a) => a.subjectId === first.subjectId) : assignments;
  const patch = (p: Partial<LessonPlanContent>) => setContent((c) => ({ ...c, ...p }));

  const toggle = (id: string) => {
    touch("targets");
    setTargets((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const parsed = useMemo(
    () =>
      lessonPlanSchema.safeParse({
        editing,
        targets,
        termId,
        lessonDate,
        title,
        duration,
        thematic_unit: content.thematic_unit,
        summary: content.summary,
        objectives: content.objectives,
        phases: content.phases,
        assessment: content.assessment,
        post_class: content.post_class,
      }),
    [editing, targets, termId, lessonDate, title, duration, content],
  );

  const errOf = (...path: (string | number)[]) => {
    const key = path.join(".");
    if (!touched[key] || parsed.success) return undefined;
    return parsed.error.issues.find(
      (i) => i.path.length === path.length && path.every((seg, idx) => i.path[idx] === seg),
    )?.message;
  };

  const draft = async () => {
    if (!first || !schoolId) return ErrorMessage("Escolha primeiro a disciplina e a turma.");
    if (content.thematic_unit.trim().length < 2) {
      touch("thematic_unit");
      return ErrorMessage("Indique a unidade temática para a IA preencher o plano.");
    }
    setBusy("ai");
    try {
      const durationMinutes = Number(duration) >= 10 && Number(duration) <= 240 ? Number(duration) : 45;
      const out = await planningService.draftLessonPlan({ schoolId, subject: first.subjectName, classLevel: first.classLevel || first.sectionName, thematicUnit: content.thematic_unit.trim(), summary: content.summary || undefined, durationMinutes });
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
    if (!parsed.success) return;
    const d = parsed.data;
    const cleanContent: LessonPlanContent = {
      thematic_unit: d.thematic_unit,
      summary: d.summary ?? "",
      objectives: d.objectives,
      phases: d.phases.map((p) => ({
        name: p.name,
        minutes: p.minutes,
        activities: p.activities ?? "",
      })),
      assessment: d.assessment ?? "",
      post_class: d.post_class ?? "",
    };
    setBusy("save");
    try {
      const ids = plan
        ? [(await update.mutateAsync({ id: plan.id, title: d.title, lessonDate: d.lessonDate || null, content: cleanContent })).id]
        : (await create.mutateAsync({ kind: "plano_aula", sectionSubjectIds: d.targets, termId: d.termId, title: d.title, lessonDate: d.lessonDate || undefined, content: cleanContent })).map((p) => p.id);
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
  const total = content.phases.reduce((n, p) => n + (Number(p.minutes) || 0), 0);
  const targetsError = errOf("targets");

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
            {targetsError && <p role="alert" className="text-xs text-destructive">{targetsError}</p>}
          </div>
          <FormSelect label="Trimestre" options={termOptions} value={termId} onValueChange={(v) => { touch("termId"); setTermId(v); }} placeholder="Escolha o trimestre…" disabled={editing} error={errOf("termId")} />
          <Input label="Data da aula (opcional)" type="date" value={lessonDate} onChange={(e) => { touch("lessonDate"); setLessonDate(e.target.value); }} error={errOf("lessonDate")} />
          <div className="sm:col-span-2"><Input label="Título" value={title} onChange={(e) => { touch("title"); setTitle(e.target.value); }} error={errOf("title")} placeholder="Ex.: Frações: introdução" /></div>
        </div>

        <div className="grid gap-3 rounded-sm border bg-muted/30 p-3 sm:grid-cols-[1fr_8rem_auto] sm:items-start">
          <Input label="Unidade temática" value={content.thematic_unit} onChange={(e) => { touch("thematic_unit"); patch({ thematic_unit: e.target.value }); }} error={errOf("thematic_unit")} />
          <Input label="Minutos" type="number" min={10} max={240} value={duration} onChange={(e) => { touch("duration"); setDuration(e.target.value === "" ? "" : Number(e.target.value)); }} error={errOf("duration")} />
          <Button type="button" className="mt-6 gap-2" onClick={draft} disabled={busy !== null || !first || content.thematic_unit.trim().length < 2}>
            <Icon name="Sparkles" className="size-4" />
            {busy === "ai" ? "A gerar…" : "Preencher com IA"}
          </Button>
        </div>

        <Textarea label="Sumário / contexto (opcional)" rows={2} value={content.summary} onChange={(e) => { touch("summary"); patch({ summary: e.target.value }); }} error={errOf("summary")} />
        <Textarea label="Objetivos" rows={2} value={content.objectives} onChange={(e) => { touch("objectives"); patch({ objectives: e.target.value }); }} error={errOf("objectives")} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Fases da aula <span className="text-xs font-normal text-muted-foreground">({total} min no total)</span></p>
            <Button type="button" variant="outline" size="sm" onClick={() => patch({ phases: [...content.phases, { name: "", minutes: 10, activities: "" }] })} disabled={content.phases.length >= 10}>Acrescentar fase</Button>
          </div>
          {content.phases.map((p, i) => (
            <div key={i} className="grid gap-2 rounded-sm border p-2 sm:grid-cols-[10rem_5rem_1fr_auto] sm:items-start">
              <Input aria-label={`Nome da fase ${i + 1}`} label="Fase" value={p.name} onChange={(e) => { touch(`phases.${i}.name`); setPhase(i, { name: e.target.value }); }} error={errOf("phases", i, "name")} />
              <Input aria-label={`Minutos da fase ${i + 1}`} label="Min." type="number" min={1} max={240} value={p.minutes} onChange={(e) => { touch(`phases.${i}.minutes`); setPhase(i, { minutes: e.target.value === "" ? 0 : Number(e.target.value) }); }} error={errOf("phases", i, "minutes")} />
              <Textarea aria-label={`Atividades da fase ${i + 1}`} label="Atividades" rows={2} value={p.activities} onChange={(e) => { touch(`phases.${i}.activities`); setPhase(i, { activities: e.target.value }); }} error={errOf("phases", i, "activities")} />
              <Button type="button" variant="ghost" size="icon" className="mt-6" title="Remover fase" onClick={() => patch({ phases: content.phases.filter((_, j) => j !== i) })} disabled={content.phases.length <= 1}>
                <Icon name="Trash2" className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Textarea label="Avaliação" rows={2} value={content.assessment} onChange={(e) => { touch("assessment"); patch({ assessment: e.target.value }); }} error={errOf("assessment")} />
        <Textarea label="Pós-aula (TPC, reflexão)" rows={2} value={content.post_class} onChange={(e) => { touch("post_class"); patch({ post_class: e.target.value }); }} error={errOf("post_class")} />

        <SheetFooter className="flex-row flex-wrap justify-end gap-2 p-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy === "save"}>Cancelar</Button>
          <Button type="button" variant="outline" onClick={() => save(false)} disabled={!parsed.success || busy !== null}>Guardar rascunho</Button>
          <Button type="button" onClick={() => save(true)} disabled={!parsed.success || busy !== null}>Guardar e submeter</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
