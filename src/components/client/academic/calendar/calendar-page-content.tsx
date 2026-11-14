"use client";
import { formatIsoDay } from "@/utils/format-date";
import { formatDateTime } from "@/utils";

import { useMemo, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { safeTextSchema } from "@/schemas/helps";
import {
  Badge,
  Button,
  ButtonOnlyAction,
  ConfirmModal,
  DataList,
  FormModal,
  FormTextarea,
  Icon,
  ListFilterBar,
  MonthCalendar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
  applyListFilters,
  filterKeysOf,
  type CalendarItem,
  type Column,
  type ListFilterDef,
  type ListSortDef,
  Can,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useListFilters } from "@/hooks/common/use-list-filters";
import { useCalendar } from "@/hooks/school/use-calendar";
import { useEntitled } from "@/hooks/common/use-entitled";
import { AcademicYearSelect } from "./academic-year-select";
import { SchoolDaysView } from "./school-days-view";
import {
  CALENDAR_AUDIENCE_LABEL,
  CALENDAR_EFFECT_LABEL,
  CALENDAR_ORIGIN_LABEL,
  CALENDAR_STATUS_LABEL,
  CALENDAR_VISIBILITY_LABEL,
  EventDetailModal,
  EventFormModal,
  type EventModalPayload,
} from "./calendar-event-modals";
import { SuspendedYearBanner } from "../year-status-banner";
import { useGoogleReturn } from "@/hooks/school/use-google-return";
import { EVENT_TYPE_LABEL, type ApiEvent, type ApiHolidayRow } from "@/services/calendar-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const STATUS = CALENDAR_STATUS_LABEL;
const EFFECT = CALENDAR_EFFECT_LABEL;
const VISIBILITY = CALENDAR_VISIBILITY_LABEL;
const ORIGIN = CALENDAR_ORIGIN_LABEL;
const HOLIDAY_STATUS: Record<string, string> = { concordam: "Concordam", divergente: "Divergente", confirmado: "Confirmado", rejeitado: "Rejeitado" };
const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a alteração no calendário. Tente novamente.")); throw e; };

const toneOf = (e: ApiEvent): CalendarItem["tone"] => (e.status === "cancelado" ? "muted" : e.effect === "nao_lectivo" ? "warning" : e.status === "publicado" ? "success" : e.status === "rascunho" ? "muted" : "primary");

const EVENT_FILTERS: ListFilterDef<ApiEvent>[] = [
  { key: "type", label: "Tipo", icon: "Tag", options: Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label })), match: (e, v) => e.type === v },
  { key: "status", label: "Estado", icon: "CircleDot", options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), match: (e, v) => e.status === v },
  { key: "effect", label: "Efeito", icon: "CalendarX", options: Object.entries(EFFECT).map(([value, label]) => ({ value, label })), match: (e, v) => e.effect === v },
  { key: "audience", label: "Destinatários", icon: "Users", options: Object.entries(CALENDAR_AUDIENCE_LABEL).map(([value, label]) => ({ value, label })), match: (e, v) => e.audience === v },
  { key: "visibility", label: "Visibilidade", icon: "Eye", options: Object.entries(VISIBILITY).map(([value, label]) => ({ value, label })), match: (e, v) => e.visibility === v },
  { key: "origin", label: "Origem", icon: "Globe", options: Object.entries(ORIGIN).map(([value, label]) => ({ value, label })), match: (e, v) => e.origin === v },
];
const EVENT_SORTS: ListSortDef<ApiEvent>[] = [
  { value: "date", label: "Data", compare: (a, b) => a.start_date.localeCompare(b.start_date) },
  { value: "title", label: "Título", compare: (a, b) => a.title.localeCompare(b.title) },
  { value: "status", label: "Estado", compare: (a, b) => a.status.localeCompare(b.status) },
];
const EVENT_DATES = [{ key: "date", label: "Evento", getDate: (e: ApiEvent) => e.start_date }];
const eventText = (e: ApiEvent) => `${e.title} ${EVENT_TYPE_LABEL[e.type] ?? e.type} ${e.location ?? ""}`;

const cancelReasonSchema = safeTextSchema(5, 500, "O motivo do cancelamento");
const holidayDecisionSchema = safeTextSchema(5, 500, "A fundamentação");

function GooglePanel() {
  const c = useCalendar();
  const { openModal } = useModal();
  const g = c.google;
  if (c.googleForbidden) return <p className="text-sm text-muted-foreground">O seu perfil não gere a integração Google.</p>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-semibold">Google Calendar</h3><p className="text-xs text-muted-foreground">Publica o calendário e recebe propostas de datas marcadas no Google.</p></div>
        <Badge variant="outline">{g?.connected ? g.integration?.status : "Não ligado"}</Badge>
      </div>
      {g?.connected && g.integration ? (
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">Conta: {g.integration.account ?? "conta de serviço"} • modo {g.integration.mode}{g.integration.last_sync_at ? ` • última sincronização ${formatDateTime(g.integration.last_sync_at)}` : ""}</p>
          {g.integration.last_error && <p className="text-destructive">{g.integration.last_error}</p>}
          {g.integration.status === "needs_reauth" && <p className="text-amber-700">A autorização expirou: volte a ligar a conta.</p>}
          {!g.integration.scopes.includes("forms.body") && <p className="text-amber-700">Falta a permissão do Google Forms (provas online): volte a ligar a conta.</p>}
        </div>
      ) : <p className="text-sm text-muted-foreground">Ligue a conta Google da escola para publicar o calendário e usar o Google Forms nas provas. Requer o plano Profissional.</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => c.connect.mutateAsync().then((url) => { window.location.href = url; }).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível iniciar a ligação.")))} disabled={c.connect.isPending}>{g?.connected ? "Voltar a ligar" : "Ligar conta Google"}</Button>
        {g?.connected && (
          <>
            <Can permission="integration:google_manage"><Button size="sm" variant="outline" disabled={c.resync.isPending} onClick={() => c.resync.mutateAsync().then(() => SucessMessage("Sincronização pedida.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a alteração no calendário. Tente novamente.")))}>Sincronizar agora</Button></Can>
            <Can permission="integration:google_manage"><Button size="sm" variant="outline" disabled={c.pull.isPending} onClick={() => c.pull.mutateAsync().then(() => SucessMessage("Propostas do Google importadas.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a alteração no calendário. Tente novamente.")))}>Importar propostas</Button></Can>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => openModal("calendar-google-disconnect")}>Desligar</Button>
          </>
        )}
      </div>
      <ConfirmModal id="calendar-google-disconnect" destructive title="Desligar o Google Calendar" description="Os eventos já criados no Google mantêm-se. Pode voltar a ligar a qualquer momento." confirmLabel="Desligar" isLoading={c.disconnect.isPending} onConfirm={() => c.disconnect.mutateAsync(false).then(() => SucessMessage("Ligação removida.")).catch(fail)} />
    </div>
  );
}

/** Calendário escolar: vista de calendário (mês) e lista, filtros completos, feriados/pontes e ligação ao Google Calendar. */
export function CalendarPageContent() {
  const full = useEntitled({ feature: "calendar_general", minPlan: "profissional" });
  return full ? <FullCalendarContent /> : <SchoolDaysView />;
}

function FullCalendarContent() {
  useGoogleReturn();
  const [selectedYearId, setSelectedYearId] = useState<string | undefined>(undefined);
  const c = useCalendar(selectedYearId);
  const { openModal } = useModal();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<ApiEvent | null>(null);
  const [holiday, setHoliday] = useState<{ row: ApiHolidayRow; decision: "confirmado" | "rejeitado" } | null>(null);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [conflict, setConflict] = useState<{ event: ApiEvent; message: string } | null>(null);

  const cancelParsed = useMemo(() => cancelReasonSchema.safeParse(reason), [reason]);
  const holidayParsed = useMemo(() => holidayDecisionSchema.safeParse(reason), [reason]);

  const f = useListFilters("events", [...filterKeysOf(EVENT_FILTERS, EVENT_DATES), "view"], 10);
  const view = f.get("view") === "list" ? "list" : "calendar";
  const filtered = useMemo(() => applyListFilters(c.events, f, { searchText: eventText, filters: EVENT_FILTERS, dateFilters: EVENT_DATES, sorts: EVENT_SORTS }), [c.events, f]);
  const items: CalendarItem[] = filtered.map((e) => ({ id: e.id, title: e.title, start: e.start_date, end: e.end_date, tone: toneOf(e), hint: e.start_time?.slice(0, 5) }));
  const nonLective = useMemo(() => {
    const s = new Set<string>();
    for (const e of c.events.filter((x) => x.effect === "nao_lectivo" && x.status !== "cancelado")) {
      const cur = new Date(`${e.start_date}T00:00:00`);
      for (let i = 0; i < 180 && cur.toISOString().slice(0, 10) <= e.end_date; i++) { s.add(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
    }
    return s;
  }, [c.events]);

  const activeSelected = useMemo(
    () => (selected ? c.events.find((e) => e.id === selected.id) ?? selected : null),
    [selected, c.events],
  );

  const open = (e: ApiEvent) => { setSelected(e); openModal("calendar-event-detail"); };
  const publish = async (e: ApiEvent) => {
    try { await c.publish.mutateAsync({ id: e.id }); SucessMessage("Evento publicado."); }
    catch (err) { setConflict({ event: e, message: getApiErrorMessage(err, "Há conflitos com este evento.") }); openModal("calendar-publish-conflict"); }
  };

  const eventColumns: Column<ApiEvent>[] = [
    { key: "start_date", header: "Data", render: (_, e) => <span className="whitespace-nowrap font-mono text-xs">{formatIsoDay(e.start_date)}{e.end_date !== e.start_date ? ` → ${formatIsoDay(e.end_date)}` : ""}</span> },
    { key: "title", header: "Evento", render: (_, e) => (<div className="flex flex-col"><span className="font-medium">{e.title}</span><span className="text-xs text-muted-foreground">{EVENT_TYPE_LABEL[e.type] ?? e.type}{e.origin === "google_proposta" ? " • proposta do Google" : ""}</span></div>) },
    { key: "effect", header: "Efeito", render: (_, e) => EFFECT[e.effect] },
    { key: "visibility", header: "Visibilidade", render: (_, e) => VISIBILITY[e.visibility] },
    { key: "status", header: "Estado", render: (_, e) => <Badge variant="outline">{STATUS[e.status]}</Badge> },
    {
      key: "action", header: "Ação",
      render: (_, e) => (
        <ButtonOnlyAction data={e} actions={[
          { label: "Ver detalhe", icon: "Eye", onClick: open },
          ...(e.origin !== "nacional" && e.status !== "cancelado" ? [{ permission: "calendar:write", label: "Editar", icon: "Pencil" as const, onClick: (x: ApiEvent) => openModal("calendar-event-form", { editing: x } satisfies EventModalPayload) }] : []),
          ...(e.status === "rascunho" ? [{ permission: "calendar:publish", label: "Aprovar", icon: "CircleCheck" as const, onClick: (x: ApiEvent) => void c.approve.mutateAsync(x.id).then(() => SucessMessage("Evento aprovado.")).catch((er) => ErrorMessage(getApiErrorMessage(er, "Não foi possível aprovar este evento do calendário. Tente novamente."))) }] : []),
          ...(e.status === "aprovado" || e.status === "rascunho" ? [{ permission: "calendar:publish", label: "Publicar", icon: "Send" as const, onClick: (x: ApiEvent) => void publish(x) }] : []),
        ]} />
      ),
    },
  ];

  const holidayColumns: Column<ApiHolidayRow & { id: string }>[] = [
    { key: "date", header: "Data", render: (_, h) => <span className="font-mono text-xs">{h.date}</span> },
    { key: "name", header: "Nome", render: (_, h) => (<div className="flex flex-col"><span className="font-medium">{h.name}</span><span className="text-xs text-muted-foreground">{h.kind === "ponte" ? "Ponte" : "Feriado"}</span></div>) },
    { key: "sources", header: "Fontes", render: (_, h) => <span className="text-xs text-muted-foreground">{(["local", "national", "google"] as const).map((s) => `${s}: ${h.sources[s] ? "✓" : "—"}`).join("  ")}</span> },
    { key: "status", header: "Estado", render: (_, h) => <Badge variant={h.status === "divergente" ? "warning" : "outline"}>{HOLIDAY_STATUS[h.status]}</Badge> },
    {
      key: "action", header: "Decisão",
      render: (_, h) => h.status === "divergente" ? (
        <ButtonOnlyAction data={h} actions={[
          { permission: "calendar:publish", label: "Confirmar", icon: "CircleCheck", onClick: (x) => { setHoliday({ row: x, decision: "confirmado" }); setReason(""); setReasonTouched(false); openModal("calendar-holiday-decision"); } },
          { permission: "calendar:publish", label: "Rejeitar", icon: "CircleX", onClick: (x) => { setHoliday({ row: x, decision: "rejeitado" }); setReason(""); setReasonTouched(false); openModal("calendar-holiday-decision"); } },
        ]} />
      ) : null,
    },
  ];

  const stat = (s: string) => c.events.filter((e) => e.status === s).length;

  return (
    <div className="space-y-6">
      <TitleList title="Calendário Escolar" suTitle="Gestão de períodos letivos, feriados, exames e eventos.">
        <div className="flex flex-wrap items-center gap-2">
          <AcademicYearSelect
            years={c.years}
            selectedYearId={c.year?.id}
            month={month}
            onSelectYear={setSelectedYearId}
            onMonthChange={setMonth}
          />
          <Can permission="calendar:write"><Button size="sm" variant="outline" className="gap-1.5" disabled={!c.year || c.importNational.isPending} onClick={() => c.importNational.mutateAsync("apply").then(() => SucessMessage("Calendário nacional importado.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a alteração no calendário. Tente novamente.")))}><Icon name="Download" className="size-4" />Importar calendário nacional</Button></Can>
          <Can permission="calendar:write">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={!c.year}
              onClick={() =>
                openModal("calendar-event-form", {
                  template: {
                    type: "reposicao",
                    title: "Reposição de Aulas",
                    effect: "lectivo",
                    audience: "todos",
                    justification: "Reposição de dias lectivos ao abrigo do plano de recuperação pedagógica.",
                  },
                } satisfies EventModalPayload)
              }
            >
              <Icon name="CalendarPlus" className="size-4" />
              Reposição
            </Button>
          </Can>
          <Can permission="calendar:write"><Button size="sm" className="gap-1.5" disabled={!c.year} onClick={() => openModal("calendar-event-form")}><Icon name="Plus" className="size-4" />Novo evento</Button></Can>
        </div>
      </TitleList>

      <SuspendedYearBanner year={c.year} showRegimeNote />

      {c.check && (c.check.hard.length > 0 || c.check.stats.lectiveDays > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xs border bg-card px-3.5 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">
              Previsão anual ({c.year?.name}):{" "}
              <strong className="font-mono">{c.check.stats.lectiveDays}</strong> dias lectivos (
              <strong className="font-mono">{c.check.stats.lectiveWeeks}</strong> semanas)
            </span>
          </div>
          {c.check.hard.length > 0 && (
            <Badge variant="warning" className="gap-1">
              <Icon name="TriangleAlert" className="size-3.5" />
              {c.check.hard.length} inconsistência(s) no calendário
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <DynamicMetricCard title={c.events.length} subtitle="Eventos no ano" icon="CalendarDays" description="Todos os estados" />
        <DynamicMetricCard title={stat("publicado")} subtitle="Publicados" icon="Send" description="Visíveis conforme a visibilidade" />
        <DynamicMetricCard title={stat("rascunho")} subtitle="Em rascunho" icon="Pencil" description="Aguardam aprovação" />
        <DynamicMetricCard title={c.holidays.filter((h) => h.status === "divergente").length} subtitle="Feriados divergentes" icon="TriangleAlert" description="Decisão da Direção" colors={c.holidays.some((h) => h.status === "divergente") ? "destructive" : "default"} />
      </div>

      <Tabs defaultValue="events" className="space-y-2">
        <TabsList>
          <TabsTrigger value="events">Calendário</TabsTrigger>
          <TabsTrigger value="holidays">Feriados e pontes</TabsTrigger>
          <TabsTrigger value="google">Google Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Tabs value={view} onValueChange={(v) => f.setFilter("view", v)} className="mt-6 space-y-4">
            <TabsList>
              <TabsTrigger value="calendar" className="gap-1.5">
                <Icon name="CalendarDays" className="size-4" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <Icon name="List" className="size-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <ListFilterBar<ApiEvent> prefix="events" f={f} searchPlaceholder="Pesquisar eventos" filters={EVENT_FILTERS} dateFilters={EVENT_DATES} shown={filtered.length} total={c.events.length} />
              <MonthCalendar items={items} month={month} onMonthChange={setMonth} markedDays={nonLective} onSelectItem={(it) => { const e = c.events.find((x) => x.id === it.id); if (e) open(e); }} onSelectDay={(d) => openModal("calendar-event-form", { date: d } satisfies EventModalPayload)} />
              <p className="text-xs text-muted-foreground">Dias com fundo âmbar são não letivos. Clique num dia para criar um evento e num evento para ver o detalhe.</p>
            </TabsContent>

            <TabsContent value="list">
              <DataList<ApiEvent> prefix="events" rows={c.events} columns={eventColumns} isLoading={c.eventsLoading} searchPlaceholder="Pesquisar eventos" searchText={eventText} filters={EVENT_FILTERS} dateFilters={EVENT_DATES} sorts={EVENT_SORTS} emptyTitle="Sem eventos" emptyDescription="Importe o calendário nacional ou crie um evento." emptyIcon="CalendarDays" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-2">
          <p className="mt-4 text-xs text-muted-foreground">Compara a regra local, o calendário nacional importado{c.googleHolidays ? " e o Google" : ""}. As divergências são decididas pela Direção; o Google é só um sinal.</p>
          <DataList<ApiHolidayRow & { id: string }>
            prefix="holidays"
            rows={c.holidays.map((h) => ({ ...h, id: `${h.date}-${h.kind}` }))}
            columns={holidayColumns}
            searchPlaceholder="Pesquisar feriado"
            searchText={(h) => h.name}
            filters={[
              { key: "status", label: "Estado", icon: "CircleDot", options: Object.entries(HOLIDAY_STATUS).map(([value, label]) => ({ value, label })), match: (h, v) => h.status === v },
              { key: "type", label: "Tipo", icon: "Tag", options: [{ value: "feriado", label: "Feriado" }, { value: "ponte", label: "Ponte" }], match: (h, v) => h.kind === v },
            ]}
            dateFilters={[{ key: "date", label: "Data", getDate: (h) => h.date }]}
            sorts={[{ value: "date", label: "Data", compare: (a, b) => a.date.localeCompare(b.date) }]}
            emptyTitle="Sem feriados para este ano"
            emptyIcon="CalendarX"
          />
        </TabsContent>

        <TabsContent value="google" className="pt-4"><GooglePanel /></TabsContent>
      </Tabs>

      <EventFormModal selectedYearId={selectedYearId} />

      <EventDetailModal
        selected={activeSelected}
        selectedYearId={selectedYearId}
        onPublish={publish}
        onRequestCancel={() => {
          setReason("");
          setReasonTouched(false);
          openModal("calendar-cancel-event");
        }}
      />

      <FormModal id="calendar-cancel-event" title="Cancelar evento" description="Indique o motivo (mínimo 5 caracteres)." submitLabel="Cancelar evento" isLoading={c.cancel.isPending} disabled={!cancelParsed.success || c.cancel.isPending} onClose={() => { setReason(""); setReasonTouched(false); }} onSubmit={() => (selected && cancelParsed.success ? c.cancel.mutateAsync({ id: selected.id, reason: cancelParsed.data }).then(() => { SucessMessage("Evento cancelado."); setReason(""); setReasonTouched(false); }).catch(fail) : undefined)}>
        <div className="sm:col-span-2">
          <FormTextarea
            label="Motivo do cancelamento *"
            placeholder="Indique a razão pela qual o evento está a ser cancelado..."
            value={reason}
            onChange={(v) => { setReasonTouched(true); setReason(v); }}
            error={reasonTouched && !cancelParsed.success ? cancelParsed.error.issues[0]?.message : undefined}
            rows={3}
          />
        </div>
      </FormModal>

      <FormModal id="calendar-holiday-decision" title={holiday?.decision === "confirmado" ? "Confirmar feriado" : "Rejeitar feriado"} description={holiday ? `${holiday.row.name} (${holiday.row.date})` : undefined} submitLabel="Registar decisão" isLoading={c.decide.isPending} disabled={!holidayParsed.success || c.decide.isPending} onClose={() => { setReason(""); setReasonTouched(false); }} onSubmit={() => (holiday && holidayParsed.success ? c.decide.mutateAsync({ date: holiday.row.date, kind: holiday.row.kind, decision: holiday.decision, reason: holidayParsed.data }).then(() => { SucessMessage("Decisão registada."); setReason(""); setReasonTouched(false); }).catch(fail) : undefined)}>
        <div className="sm:col-span-2">
          <FormTextarea
            label="Fundamentação (mín. 5 caracteres) *"
            placeholder="Fundamente a confirmação ou rejeição deste feriado ou tolerância..."
            value={reason}
            onChange={(v) => { setReasonTouched(true); setReason(v); }}
            error={reasonTouched && !holidayParsed.success ? holidayParsed.error.issues[0]?.message : undefined}
            rows={3}
          />
        </div>
      </FormModal>

      <ConfirmModal id="calendar-publish-conflict" title="Publicar com conflitos?" description={`${conflict?.message ?? ""} Publicar mesmo assim?`} confirmLabel="Publicar mesmo assim" isLoading={c.publish.isPending} onConfirm={() => (conflict ? c.publish.mutateAsync({ id: conflict.event.id, confirm: true }).then(() => SucessMessage("Evento publicado.")).catch(fail) : undefined)} />
    </div>
  );
}
