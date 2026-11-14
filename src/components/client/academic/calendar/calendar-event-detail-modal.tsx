"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Can, FormModal, Icon } from "@/components";
import { useCalendar } from "@/hooks/school/use-calendar";
import {
  EVENT_TYPE_LABEL,
  calendarService,
  type ApiEvent,
  type EventAudience,
} from "@/services/calendar-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatIsoDay } from "@/utils/format-date";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import {
  CALENDAR_AUDIENCE_LABEL,
  CALENDAR_EFFECT_LABEL,
  CALENDAR_ORIGIN_LABEL,
  CALENDAR_STATUS_LABEL,
  CALENDAR_VISIBILITY_LABEL,
  type EventModalPayload,
} from "./calendar-constants";

function scopeLabel(ev: ApiEvent): string {
  if (!ev.scope || ev.scope.kind === "escola") return "Toda a escola";
  if (ev.scope.kind === "classe") return "Classe específica";
  if (ev.scope.kind === "turma") return "Turma específica";
  return `Turno (${ev.scope.shift ?? "—"})`;
}

function EventImpactSection({ eventId, enabled }: { eventId: string; enabled: boolean }) {
  const impactQuery = useQuery({
    queryKey: ["calendar-event-impact", eventId],
    queryFn: () => calendarService.impact(eventId),
    enabled,
    staleTime: 15 * 1000,
  });

  const impact = impactQuery.data;
  const lessonCount = impact ? Object.values(impact.lessons).reduce((acc, n) => acc + n, 0) : 0;

  return (
    <div className="space-y-2 rounded-xs border border-border/70 bg-muted/20 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-semibold text-foreground">
          <Icon name="Activity" className="size-3.5" />
          Análise de impacto operacional
        </p>
        {impactQuery.isLoading && <span className="text-muted-foreground">A calcular…</span>}
      </div>
      {impact ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Dias lectivos afectados: {impact.lective_days_affected}</Badge>
            <Badge variant={impact.assessments.length > 0 ? "warning" : "outline"}>
              Avaliações: {impact.assessments.length}
            </Badge>
            <Badge variant={lessonCount > 0 ? "warning" : "outline"}>Aulas: {lessonCount}</Badge>
            <Badge variant={impact.final_exams.length > 0 ? "warning" : "outline"}>
              Exames finais: {impact.final_exams.length}
            </Badge>
            <Badge variant={impact.admission_sessions.length > 0 ? "warning" : "outline"}>
              Exames de admissão: {impact.admission_sessions.length}
            </Badge>
            <Badge variant={impact.class_councils.length > 0 ? "warning" : "outline"}>
              Conselhos de notas: {impact.class_councils.length}
            </Badge>
          </div>
          {impact.suggestion && (
            <p className="text-amber-700 dark:text-amber-400">{impact.suggestion}</p>
          )}
        </div>
      ) : !impactQuery.isLoading ? (
        <p className="text-muted-foreground">Sem dados de impacto disponíveis.</p>
      ) : null}
    </div>
  );
}

export function EventDetailModal({
  selected,
  selectedYearId,
  onPublish,
  onRequestCancel,
}: {
  selected: ApiEvent | null;
  selectedYearId?: string;
  onPublish: (e: ApiEvent) => Promise<void>;
  onRequestCancel: () => void;
}) {
  const { approve } = useCalendar(selectedYearId);
  const { open, openModal, closeModal } = useModal();

  return (
    <FormModal
      id="calendar-event-detail"
      size="lg"
      title={selected?.title ?? "Evento"}
      description={
        selected
          ? `${EVENT_TYPE_LABEL[selected.type] ?? selected.type} • ${CALENDAR_STATUS_LABEL[selected.status] ?? selected.status}`
          : undefined
      }
      readOnly
      onSubmit={() => undefined}
    >
      {selected && (
        <div className="space-y-4 text-sm sm:col-span-2">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Data</dt>
              <dd className="font-mono">
                {formatIsoDay(selected.start_date)}
                {selected.end_date !== selected.start_date
                  ? ` → ${formatIsoDay(selected.end_date)}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Horário</dt>
              <dd className="font-mono">
                {selected.start_time
                  ? `${selected.start_time.slice(0, 5)}–${selected.end_time?.slice(0, 5) ?? ""}`
                  : "Dia inteiro"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Efeito</dt>
              <dd>{CALENDAR_EFFECT_LABEL[selected.effect] ?? selected.effect}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Destinatários</dt>
              <dd>
                {CALENDAR_AUDIENCE_LABEL[selected.audience as EventAudience] ?? selected.audience}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Âmbito</dt>
              <dd>{scopeLabel(selected)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Visibilidade</dt>
              <dd>{CALENDAR_VISIBILITY_LABEL[selected.visibility]}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Local</dt>
              <dd>{selected.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Origem</dt>
              <dd>{CALENDAR_ORIGIN_LABEL[selected.origin]}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Aulas & Modalidade</dt>
              <dd className="flex flex-wrap gap-1 pt-0.5">
                {selected.affects_lessons && <Badge variant="warning">Afecta aulas</Badge>}
                {selected.online_meeting && <Badge variant="info">Online</Badge>}
                {!selected.affects_lessons && !selected.online_meeting && "Padrão"}
              </dd>
            </div>
          </dl>

          {selected.description && (
            <div className="space-y-1 rounded-xs bg-muted/30 p-3 text-xs">
              <p className="font-semibold text-foreground">Descrição</p>
              <p className="text-muted-foreground">{selected.description}</p>
            </div>
          )}

          {selected.justification && (
            <div className="space-y-1 rounded-xs border border-border/60 p-3 text-xs">
              <p className="font-semibold text-foreground">Justificação</p>
              <p className="text-muted-foreground">{selected.justification}</p>
            </div>
          )}

          <EventImpactSection
            eventId={selected.id}
            enabled={Boolean(open["calendar-event-detail"] && selected.id)}
          />

          <div className="flex flex-wrap gap-2 border-t pt-3">
            {selected.status === "rascunho" && (
              <Can permission="calendar:publish">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={approve.isPending}
                  onClick={() =>
                    approve
                      .mutateAsync(selected.id)
                      .then(() => SucessMessage("Evento aprovado."))
                      .catch((er) =>
                        ErrorMessage(
                          getApiErrorMessage(
                            er,
                            "Não foi possível aprovar este evento do calendário. Tente novamente.",
                          ),
                        ),
                      )
                  }
                >
                  Aprovar
                </Button>
              </Can>
            )}
            {(selected.status === "aprovado" || selected.status === "rascunho") && (
              <Can permission="calendar:publish">
                <Button size="sm" onClick={() => void onPublish(selected)}>
                  Publicar
                </Button>
              </Can>
            )}
            {selected.origin !== "nacional" && selected.status !== "cancelado" && (
              <Can permission="calendar:write">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    closeModal("calendar-event-detail");
                    openModal("calendar-event-form", { editing: selected } satisfies EventModalPayload);
                  }}
                >
                  <Icon name="Pencil" className="size-3.5" />
                  Editar evento
                </Button>
              </Can>
            )}
            {selected.origin === "nacional" && selected.status !== "cancelado" && (
              <Can permission="calendar:write">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    closeModal("calendar-event-detail");
                    openModal("calendar-event-form", {
                      template: {
                        type: "dia_nao_lectivo_institucional",
                        title: `Excepção: ${selected.title}`,
                        startDate: selected.start_date,
                        endDate: selected.end_date,
                        effect: selected.effect,
                        audience: (selected.audience as EventAudience) ?? "todos",
                        justification: `Adaptação institucional ao evento nacional «${selected.title}».`,
                      },
                    } satisfies EventModalPayload);
                  }}
                >
                  <Icon name="CopyPlus" className="size-3.5" />
                  Criar excepção institucional
                </Button>
              </Can>
            )}
            {selected.status !== "cancelado" && (
              <Can permission="calendar:write">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={onRequestCancel}
                >
                  Cancelar evento
                </Button>
              </Can>
            )}
          </div>
        </div>
      )}
    </FormModal>
  );
}

