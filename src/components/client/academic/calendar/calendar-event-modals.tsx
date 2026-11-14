"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Checkbox,
  FormModal,
  FormSelect,
  FormTextarea,
  Input,
  Label,
} from "@/components";
import { useAcademicSections } from "@/hooks/school/use-academic";
import { useCalendar } from "@/hooks/school/use-calendar";
import { academicService } from "@/services/academic-service";
import {
  EVENT_TYPE_LABEL,
  type ApiEvent,
  type EventAudience,
  type EventEffect,
  type EventScope,
} from "@/services/calendar-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { isPlanRestrictedError, usePlanUpgradeModal } from "@/stores/plan/use-plan-upgrade-modal-store";
import {
  isoDateSchema,
  isValidIsoDate,
  optionalSafeTextSchema,
  safeTextSchema,
  timeHHMMSchema,
} from "@/schemas/helps";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import {
  CALENDAR_AUDIENCE_LABEL,
  CALENDAR_EFFECT_LABEL,
  CALENDAR_VISIBILITY_LABEL,
  type EventModalPayload,
} from "./calendar-constants";

export {
  CALENDAR_AUDIENCE_LABEL,
  CALENDAR_EFFECT_LABEL,
  CALENDAR_ORIGIN_LABEL,
  CALENDAR_STATUS_LABEL,
  CALENDAR_VISIBILITY_LABEL,
  type EventModalPayload,
} from "./calendar-constants";
export { EventDetailModal } from "./calendar-event-detail-modal";

const SCOPE_KIND_OPTIONS = [
  { value: "escola", label: "Toda a escola" },
  { value: "classe", label: "Classe específica" },
  { value: "turma", label: "Turma específica" },
  { value: "turno", label: "Turno específico" },
];

const SHIFT_SCOPE_OPTIONS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "diurno", label: "Diurno" },
];

const DEFAULT_EFFECT_BY_TYPE: Record<string, EventEffect> = {
  aulas_inicio: "lectivo",
  aulas_fim: "lectivo",
  trimestre: "lectivo",
  avaliacoes_trimestrais: "lectivo",
  exame_nacional: "parcial",
  exame_recurso: "parcial",
  exame_melhoria: "parcial",
  exame_extraordinario: "parcial",
  pausa_pedagogica: "nao_lectivo",
  recesso: "nao_lectivo",
  feriado_nacional: "nao_lectivo",
  ponte: "nao_lectivo",
  tolerancia_ponto: "nao_lectivo",
  comemoracao: "nao_lectivo",
  matricula: "parcial",
  ferias_professores: "nao_lectivo",
  seminario: "parcial",
  reuniao_encarregados: "parcial",
  conselho_notas: "parcial",
  dia_nao_lectivo_institucional: "nao_lectivo",
  reposicao: "lectivo",
  actividade_escolar: "parcial",
};

const DEFAULT_AUDIENCE_BY_TYPE: Record<string, EventAudience> = {
  ferias_professores: "professores",
  seminario: "professores",
};

type EventFormState = {
  type: string;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  effect: EventEffect;
  audience: EventAudience;
  scopeKind: EventScope["kind"];
  scopeTargetId: string;
  visibility: ApiEvent["visibility"];
  location: string;
  justification: string;
  affectsLessons: boolean;
  onlineMeeting: boolean;
  reason: string;
};

const INITIAL_FORM: EventFormState = {
  type: "actividade_escolar",
  title: "",
  description: "",
  start: "",
  end: "",
  allDay: true,
  startTime: "",
  endTime: "",
  effect: "parcial",
  audience: "todos",
  scopeKind: "escola",
  scopeTargetId: "",
  visibility: "interna",
  location: "",
  justification: "",
  affectsLessons: false,
  onlineMeeting: false,
  reason: "",
};

const buildSchema = (isPublishedEdit: boolean) =>
  z
    .object({
      type: z.string().trim().min(1, "Seleccione o tipo de evento."),
      title: safeTextSchema(3, 150, "O título do evento"),
      description: optionalSafeTextSchema(1000, 3, "A descrição"),
      start: isoDateSchema("A data de início"),
      end: z
        .string()
        .trim()
        .refine((v) => v === "" || isValidIsoDate(v), "A data de fim é inválida (AAAA-MM-DD).")
        .optional(),
      allDay: z.boolean(),
      startTime: z.string().trim().optional(),
      endTime: z.string().trim().optional(),
      effect: z.enum(["lectivo", "nao_lectivo", "parcial"]),
      audience: z.enum(["todos", "alunos", "professores"]),
      scopeKind: z.enum(["escola", "classe", "turma", "turno"]),
      scopeTargetId: z.string().trim().optional(),
      visibility: z.enum(["interna", "professores", "encarregados", "publica"]),
      location: optionalSafeTextSchema(120, 2, "O local"),
      justification: optionalSafeTextSchema(500, 5, "A justificação"),
      affectsLessons: z.boolean(),
      onlineMeeting: z.boolean(),
      reason: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.end && data.end < data.start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end"],
          message: "A data de fim deve ser igual ou posterior à data de início.",
        });
      }
      if (!data.allDay) {
        const sCheck = timeHHMMSchema("A hora de início").safeParse(data.startTime ?? "");
        const eCheck = timeHHMMSchema("A hora de fim").safeParse(data.endTime ?? "");
        if (!sCheck.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startTime"],
            message: sCheck.error.issues[0]?.message ?? "Indique a hora de início.",
          });
        }
        if (!eCheck.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endTime"],
            message: eCheck.error.issues[0]?.message ?? "Indique a hora de fim.",
          });
        }
        if (
          sCheck.success &&
          eCheck.success &&
          (!data.end || data.end === data.start) &&
          (data.endTime ?? "") <= (data.startTime ?? "")
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endTime"],
            message: "A hora de fim deve ser posterior à hora de início.",
          });
        }
      }
      if (data.scopeKind !== "escola" && !data.scopeTargetId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scopeTargetId"],
          message: "Seleccione o destinatário do âmbito escolhido.",
        });
      }
      if ((data.effect === "nao_lectivo" || data.affectsLessons) && (!data.justification || data.justification.length < 5)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["justification"],
          message: "A justificação (mín. 5 caracteres) é obrigatória quando fecha dias lectivos ou afecta aulas.",
        });
      }
      if (isPublishedEdit && (!data.reason || data.reason.length < 5)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reason"],
          message: "Indique o motivo da alteração (mín. 5 caracteres) para eventos publicados.",
        });
      }
    });

function scopeFromEvent(scope?: ApiEvent["scope"]): { kind: EventScope["kind"]; targetId: string } {
  if (!scope || scope.kind === "escola") return { kind: "escola", targetId: "" };
  if (scope.kind === "classe") return { kind: "classe", targetId: scope.class_level_id ?? "" };
  if (scope.kind === "turma") return { kind: "turma", targetId: scope.section_id ?? "" };
  return { kind: "turno", targetId: scope.shift ?? "manha" };
}

function toScopePayload(kind: EventScope["kind"], targetId: string): EventScope {
  if (kind === "classe") return { kind: "classe", class_level_id: targetId };
  if (kind === "turma") return { kind: "turma", section_id: targetId };
  if (kind === "turno") return { kind: "turno", shift: targetId };
  return { kind: "escola" };
}

function buildInitialEventForm(payload?: EventModalPayload): EventFormState {
  const editing = payload?.editing;
  if (editing) {
    const sc = scopeFromEvent(editing.scope);
    const hasTime = Boolean(editing.start_time && editing.end_time);
    return {
      type: editing.type,
      title: editing.title,
      description: editing.description ?? "",
      start: editing.start_date,
      end: editing.end_date !== editing.start_date ? editing.end_date : "",
      allDay: !hasTime,
      startTime: editing.start_time?.slice(0, 5) ?? "",
      endTime: editing.end_time?.slice(0, 5) ?? "",
      effect: editing.effect,
      audience: (editing.audience as EventAudience) ?? "todos",
      scopeKind: sc.kind,
      scopeTargetId: sc.targetId,
      visibility: editing.visibility,
      location: editing.location ?? "",
      justification: editing.justification ?? "",
      affectsLessons: editing.affects_lessons,
      onlineMeeting: Boolean(editing.online_meeting),
      reason: "",
    };
  }

  const tpl = payload?.template;
  const type = tpl?.type ?? "actividade_escolar";
  return {
    ...INITIAL_FORM,
    type,
    title: tpl?.title ?? "",
    start: tpl?.startDate ?? payload?.date ?? "",
    end: tpl?.endDate ?? "",
    effect: tpl?.effect ?? DEFAULT_EFFECT_BY_TYPE[type] ?? "parcial",
    audience: tpl?.audience ?? DEFAULT_AUDIENCE_BY_TYPE[type] ?? "todos",
    justification: tpl?.justification ?? "",
  };
}

export function EventFormModal({ selectedYearId }: { selectedYearId?: string }) {
  const { open, modalData } = useModal();
  if (!open["calendar-event-form"]) return null;
  const payload = modalData["calendar-event-form"] as EventModalPayload | undefined;
  const formKey = payload?.editing
    ? `edit:${payload.editing.id}:${payload.editing.row_version}`
    : `new:${payload?.template?.type ?? "custom"}:${payload?.date ?? ""}`;

  return <EventFormBody key={formKey} selectedYearId={selectedYearId} payload={payload} />;
}

function EventFormBody({
  selectedYearId,
  payload,
}: {
  selectedYearId?: string;
  payload?: EventModalPayload;
}) {
  const { createEvent, updateEvent } = useCalendar(selectedYearId);
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const planModal = usePlanUpgradeModal();
  const { allSections } = useAcademicSections();

  const editing = payload?.editing ?? null;
  const isPublishedEdit = Boolean(editing && editing.status === "publicado");

  const classLevelsQuery = useQuery({
    queryKey: ["class-levels", schoolId],
    queryFn: academicService.classLevels,
    enabled: Boolean(schoolId),
    staleTime: 5 * 60 * 1000,
  });

  const [f, setF] = useState<EventFormState>(() => buildInitialEventForm(payload));
  const [touched, setTouched] = useState<Partial<Record<keyof EventFormState, boolean>>>({});

  const set = <K extends keyof EventFormState>(k: K, v: EventFormState[K]) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    setF((prev) => ({ ...prev, [k]: v }));
  };

  const schema = useMemo(() => buildSchema(isPublishedEdit), [isPublishedEdit]);
  const parsed = useMemo(() => schema.safeParse(f), [schema, f]);

  const fieldError = (key: keyof EventFormState, alsoShowIf?: boolean) => {
    if ((!touched[key] && !alsoShowIf) || parsed.success) return undefined;
    return parsed.error.issues.find((i) => i.path[0] === key)?.message;
  };

  const pending = createEvent.isPending || updateEvent.isPending;

  const scopeTargetOptions = useMemo(() => {
    if (f.scopeKind === "classe") {
      return (classLevelsQuery.data ?? []).map((cl) => ({ value: cl.id, label: cl.name }));
    }
    if (f.scopeKind === "turma") {
      return allSections.map((sec) => ({ value: sec.id, label: `${sec.name} (${sec.classLevel})` }));
    }
    if (f.scopeKind === "turno") {
      return SHIFT_SCOPE_OPTIONS;
    }
    return [];
  }, [f.scopeKind, classLevelsQuery.data, allSections]);

  const handleSubmit = () => {
    if (!parsed.success) return;
    const d = parsed.data;
    const scope = toScopePayload(d.scopeKind, d.scopeTargetId ?? "");

    if (editing) {
      return updateEvent
        .mutateAsync({
          id: editing.id,
          payload: {
            title: d.title,
            description: d.description || undefined,
            startDate: d.start,
            endDate: d.end || d.start,
            startTime: d.allDay ? null : d.startTime,
            endTime: d.allDay ? null : d.endTime,
            effect: d.effect,
            audience: d.audience,
            scope,
            visibility: d.visibility,
            location: d.location || undefined,
            justification: d.justification || undefined,
            affectsLessons: d.affectsLessons,
            onlineMeeting: d.onlineMeeting,
            rowVersion: editing.row_version,
            ...(d.reason ? { reason: d.reason } : {}),
          },
        })
        .then(() => SucessMessage("Evento actualizado com sucesso."))
        .catch((err) => {
          ErrorMessage(getApiErrorMessage(err, "Não foi possível actualizar o evento."));
          throw err;
        });
    }

    return createEvent
      .mutateAsync({
        type: d.type,
        title: d.title,
        description: d.description || undefined,
        startDate: d.start,
        endDate: d.end || undefined,
        startTime: d.allDay ? undefined : d.startTime,
        endTime: d.allDay ? undefined : d.endTime,
        effect: d.effect,
        audience: d.audience,
        scope,
        visibility: d.visibility,
        location: d.location || undefined,
        justification: d.justification || undefined,
        affectsLessons: d.affectsLessons,
        onlineMeeting: d.onlineMeeting,
      })
      .then(() => SucessMessage("Evento criado (rascunho)."))
      .catch((err) => {
        if (isPlanRestrictedError(err)) {
          planModal.open({
            featureName: "Calendário Escolar",
            requiredPlan: "profissional",
            description:
              "O registo de datas e eventos no calendário escolar exige o plano Profissional. Faça upgrade da sua subscrição para desbloquear esta funcionalidade.",
          });
          return;
        }
        ErrorMessage(getApiErrorMessage(err, "Não foi possível guardar o evento."));
        throw err;
      });
  };

  return (
    <FormModal
      id="calendar-event-form"
      size="lg"
      title={editing ? `Editar evento — ${editing.title}` : "Novo evento do calendário"}
      description={
        editing
          ? isPublishedEdit
            ? "Este evento já está publicado. Indique o motivo da alteração para manter o registo de auditoria."
            : "Actualize as datas, horário, efeito ou destinatários do evento."
          : "O evento nasce em rascunho; aprove e publique-o depois."
      }
      submitLabel={editing ? "Guardar alterações" : "Criar evento"}
      isLoading={pending}
      onSubmit={handleSubmit}
      disabled={!parsed.success || pending}
    >
      <FormSelect
        label="Tipo *"
        value={f.type}
        disabled={Boolean(editing)}
        onValueChange={(v) => {
          setTouched((prev) => ({ ...prev, type: true }));
          setF((prev) => ({
            ...prev,
            type: v,
            effect: DEFAULT_EFFECT_BY_TYPE[v] ?? prev.effect,
            audience: DEFAULT_AUDIENCE_BY_TYPE[v] ?? "todos",
          }));
        }}
        options={Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
        error={fieldError("type")}
      />
      <Input
        label="Título *"
        startIcon="CalendarDays"
        placeholder="Ex.: Reunião Geral de Encarregados de Educação"
        value={f.title}
        onChange={(e) => set("title", e.target.value)}
        error={fieldError("title")}
      />

      <Input
        label="Data de início *"
        type="date"
        value={f.start}
        onChange={(e) => set("start", e.target.value)}
        error={fieldError("start")}
      />
      <Input
        label="Data de fim (opcional)"
        type="date"
        value={f.end}
        onChange={(e) => set("end", e.target.value)}
        error={fieldError("end", Boolean(touched.start && f.end))}
      />

      <div className="sm:col-span-2 flex items-center gap-2.5 rounded-xs border border-border/60 px-3 py-2">
        <Checkbox
          id="cal-ev-all-day"
          checked={f.allDay}
          onCheckedChange={(v) => {
            const isAllDay = Boolean(v);
            set("allDay", isAllDay);
            if (isAllDay) {
              setF((prev) => ({ ...prev, allDay: true, startTime: "", endTime: "" }));
            }
          }}
        />
        <Label htmlFor="cal-ev-all-day" className="cursor-pointer text-xs font-medium">
          Dia inteiro (sem horário específico)
        </Label>
      </div>

      {!f.allDay && (
        <>
          <Input
            label="Hora de início *"
            type="time"
            value={f.startTime}
            onChange={(e) => set("startTime", e.target.value)}
            error={fieldError("startTime", Boolean(touched.endTime && f.endTime))}
          />
          <Input
            label="Hora de fim *"
            type="time"
            value={f.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            error={fieldError("endTime", Boolean(touched.startTime && f.endTime))}
          />
        </>
      )}

      <FormSelect
        label="Efeito nos dias lectivos *"
        value={f.effect}
        onValueChange={(v) => set("effect", v as EventEffect)}
        options={Object.entries(CALENDAR_EFFECT_LABEL).map(([value, label]) => ({ value, label }))}
      />
      <FormSelect
        label="Destinatários *"
        value={f.audience}
        onValueChange={(v) => set("audience", v as EventAudience)}
        options={Object.entries(CALENDAR_AUDIENCE_LABEL).map(([value, label]) => ({ value, label }))}
      />

      <FormSelect
        label="Âmbito"
        value={f.scopeKind}
        onValueChange={(v) => {
          const next = v as EventScope["kind"];
          setTouched((prev) => ({ ...prev, scopeKind: true, scopeTargetId: false }));
          setF((prev) => ({
            ...prev,
            scopeKind: next,
            scopeTargetId: next === "turno" ? "manha" : "",
          }));
        }}
        options={SCOPE_KIND_OPTIONS}
      />
      {f.scopeKind !== "escola" ? (
        <FormSelect
          label={
            f.scopeKind === "classe"
              ? "Classe *"
              : f.scopeKind === "turma"
                ? "Turma *"
                : "Turno *"
          }
          value={f.scopeTargetId}
          onValueChange={(v) => set("scopeTargetId", v)}
          options={scopeTargetOptions}
          error={fieldError("scopeTargetId")}
        />
      ) : (
        <FormSelect
          label="Visibilidade"
          value={f.visibility}
          onValueChange={(v) => set("visibility", v as ApiEvent["visibility"])}
          options={Object.entries(CALENDAR_VISIBILITY_LABEL).map(([value, label]) => ({ value, label }))}
        />
      )}

      {f.scopeKind !== "escola" && (
        <FormSelect
          label="Visibilidade"
          value={f.visibility}
          onValueChange={(v) => set("visibility", v as ApiEvent["visibility"])}
          options={Object.entries(CALENDAR_VISIBILITY_LABEL).map(([value, label]) => ({ value, label }))}
        />
      )}

      <Input
        label="Local"
        startIcon="MapPin"
        placeholder="Ex.: Auditório Principal / Bloco B"
        value={f.location}
        onChange={(e) => set("location", e.target.value)}
        error={fieldError("location")}
      />

      <div className="sm:col-span-2 grid gap-2 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-xs border border-border/60 p-2.5 text-xs">
          <Checkbox
            checked={f.affectsLessons}
            onCheckedChange={(v) => set("affectsLessons", Boolean(v))}
          />
          <span>Afecta aulas previstas (suspende ou altera aulas)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xs border border-border/60 p-2.5 text-xs">
          <Checkbox
            checked={f.onlineMeeting}
            onCheckedChange={(v) => set("onlineMeeting", Boolean(v))}
          />
          <span>Sessão / reunião em formato online</span>
        </label>
      </div>

      <FormTextarea
        label="Descrição (opcional)"
        placeholder="Detalhes, programa ou instruções para participantes..."
        value={f.description}
        onChange={(v) => set("description", v)}
        error={fieldError("description")}
        rows={2}
      />

      <FormTextarea
        label={
          f.effect === "nao_lectivo" || f.affectsLessons
            ? "Justificação * (mín. 5 caracteres — fecha dias ou afecta aulas)"
            : "Justificação / notas (opcional)"
        }
        placeholder="Descreva a fundamentação legal ou pedagógica do evento..."
        value={f.justification}
        onChange={(v) => set("justification", v)}
        error={fieldError("justification")}
        rows={2}
      />

      {isPublishedEdit && (
        <FormTextarea
          label="Motivo da alteração do evento publicado * (mín. 5 caracteres)"
          placeholder="Ex.: Adiamento por indisponibilidade do auditório / ajuste de horário..."
          value={f.reason}
          onChange={(v) => set("reason", v)}
          error={fieldError("reason")}
          rows={2}
        />
      )}
    </FormModal>
  );
}
