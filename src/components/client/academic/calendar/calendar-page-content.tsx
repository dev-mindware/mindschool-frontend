"use client";
import { formatDateTime } from "@/utils";

import { useMemo, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, FormModal, FormSelect, Icon, Input, ListFilterBar, MonthCalendar, Tabs, TabsContent, TabsList, TabsTrigger, TitleList,
  applyListFilters, filterKeysOf, type CalendarItem, type Column, type ListFilterDef, type ListSortDef,
  Can,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useListFilters } from "@/hooks/common/use-list-filters";
import { useCalendar } from "@/hooks/school/use-calendar";
import { useEntitled } from "@/hooks/common/use-entitled";
import { SchoolDaysView } from "./school-days-view";
import { useGoogleReturn } from "@/hooks/school/use-google-return";
import { EVENT_TYPE_LABEL, type ApiEvent, type ApiHolidayRow } from "@/services/calendar-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const STATUS: Record<string, string> = { rascunho: "Rascunho", aprovado: "Aprovado", publicado: "Publicado", cancelado: "Cancelado" };
const EFFECT: Record<string, string> = { lectivo: "Lectivo", nao_lectivo: "Não lectivo", parcial: "Parcial" };
const VISIBILITY: Record<string, string> = { interna: "Interna", professores: "Professores", encarregados: "Encarregados", publica: "Pública" };
const ORIGIN: Record<string, string> = { nacional: "Calendário nacional", institucional: "Institucional", google_proposta: "Proposta do Google" };
const HOLIDAY_STATUS: Record<string, string> = { concordam: "Concordam", divergente: "Divergente", confirmado: "Confirmado", rejeitado: "Rejeitado" };
const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };

const toneOf = (e: ApiEvent): CalendarItem["tone"] => (e.status === "cancelado" ? "muted" : e.effect === "nao_lectivo" ? "warning" : e.status === "publicado" ? "success" : e.status === "rascunho" ? "muted" : "primary");

const EVENT_FILTERS: ListFilterDef<ApiEvent>[] = [
  { key: "tipo", label: "Tipo", icon: "Tag", options: Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label })), match: (e, v) => e.type === v },
  { key: "estado", label: "Estado", icon: "CircleDot", options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), match: (e, v) => e.status === v },
  { key: "efeito", label: "Efeito", icon: "CalendarX", options: Object.entries(EFFECT).map(([value, label]) => ({ value, label })), match: (e, v) => e.effect === v },
  { key: "visibilidade", label: "Visibilidade", icon: "Eye", options: Object.entries(VISIBILITY).map(([value, label]) => ({ value, label })), match: (e, v) => e.visibility === v },
  { key: "origem", label: "Origem", icon: "Globe", options: Object.entries(ORIGIN).map(([value, label]) => ({ value, label })), match: (e, v) => e.origin === v },
];
const EVENT_SORTS: ListSortDef<ApiEvent>[] = [
  { value: "data", label: "Data", compare: (a, b) => a.start_date.localeCompare(b.start_date) },
  { value: "titulo", label: "Título", compare: (a, b) => a.title.localeCompare(b.title) },
  { value: "estado", label: "Estado", compare: (a, b) => a.status.localeCompare(b.status) },
];
const EVENT_DATES = [{ key: "data", label: "Evento", getDate: (e: ApiEvent) => e.start_date }];
const eventText = (e: ApiEvent) => `${e.title} ${EVENT_TYPE_LABEL[e.type] ?? e.type} ${e.location ?? ""}`;

import { usePlanUpgradeModal, isPlanRestrictedError } from "@/stores/plan/use-plan-upgrade-modal-store";

function NewEventModal() {
  const { createEvent } = useCalendar();
  const { open, modalData } = useModal();
  const planModal = usePlanUpgradeModal();
  const preset = (modalData["calendar-new-event"] as { date?: string } | undefined)?.date ?? "";
  const [f, setF] = useState({ type: "actividade_escolar", title: "", start: "", end: "", startTime: "", endTime: "", visibility: "interna" as ApiEvent["visibility"], location: "", justification: "" });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const start = f.start || preset;

  if (!open["calendar-new-event"]) return null;
  const submit = () =>
    createEvent
      .mutateAsync({ type: f.type, title: f.title.trim(), startDate: start, endDate: f.end || undefined, startTime: f.startTime || undefined, endTime: f.endTime || undefined, visibility: f.visibility, location: f.location.trim() || undefined, justification: f.justification.trim() || undefined, affectsLessons: false })
      .then(() => { SucessMessage("Evento criado (rascunho)."); setF((p) => ({ ...p, title: "", start: "", end: "" })); })
      .catch((e) => {
        if (isPlanRestrictedError(e)) {
          planModal.open({
            featureName: "Calendário Escolar",
            requiredPlan: "profissional",
            description: "O registo de datas e eventos no calendário escolar exige o plano Profissional. Faça upgrade da sua subscrição para desbloquear esta funcionalidade.",
          });
          return;
        }
        fail(e);
      });

  return (
    <FormModal id="calendar-new-event" title="Novo evento do calendário" description="O evento nasce em rascunho; aprove e publique-o depois." submitLabel="Criar evento" isLoading={createEvent.isPending} onSubmit={submit} disabled={f.title.trim().length < 3 || !start}>
      <FormSelect label="Tipo *" value={f.type} onValueChange={(v) => set("type", v)} options={Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} />
      <Input label="Título *" startIcon="CalendarDays" value={f.title} onChange={(e) => set("title", e.target.value)} />
      <Input label="Início *" type="date" value={start} onChange={(e) => set("start", e.target.value)} />
      <Input label="Fim (opcional)" type="date" value={f.end} onChange={(e) => set("end", e.target.value)} />
      <Input label="Hora de início" type="time" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} />
      <Input label="Hora de fim" type="time" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} />
      <FormSelect label="Visibilidade" value={f.visibility} onValueChange={(v) => set("visibility", v as ApiEvent["visibility"])} options={Object.entries(VISIBILITY).map(([value, label]) => ({ value, label }))} />
      <Input label="Local" startIcon="MapPin" value={f.location} onChange={(e) => set("location", e.target.value)} />
      <div className="sm:col-span-2"><Input label="Justificação (obrigatória se fecha dias lectivos)" value={f.justification} onChange={(e) => set("justification", e.target.value)} /></div>
    </FormModal>
  );
}

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
            <Can permission="integration:google_manage"><Button size="sm" variant="outline" disabled={c.resync.isPending} onClick={() => c.resync.mutateAsync().then(() => SucessMessage("Sincronização pedida.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Sincronizar agora</Button></Can>
            <Can permission="integration:google_manage"><Button size="sm" variant="outline" disabled={c.pull.isPending} onClick={() => c.pull.mutateAsync().then(() => SucessMessage("Propostas do Google importadas.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Importar propostas</Button></Can>
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
  // Sem o calendário geral (Essencial): só dias lectivos, feriados e marcas da Direcção.
  const full = useEntitled({ feature: "calendar_general", minPlan: "profissional" });
  return full ? <FullCalendarContent /> : <SchoolDaysView />;
}

function FullCalendarContent() {
  useGoogleReturn();
  const c = useCalendar();
  const { openModal } = useModal();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<ApiEvent | null>(null);
  const [holiday, setHoliday] = useState<{ row: ApiHolidayRow; decision: "confirmado" | "rejeitado" } | null>(null);
  const [reason, setReason] = useState("");
  const [conflict, setConflict] = useState<{ event: ApiEvent; message: string } | null>(null);

  const f = useListFilters("eventos", [...filterKeysOf(EVENT_FILTERS, EVENT_DATES), "vista"], 10);
  const view = f.get("vista") === "lista" ? "lista" : "calendario";
  const filtered = useMemo(() => applyListFilters(c.events, f, { searchText: eventText, filters: EVENT_FILTERS, dateFilters: EVENT_DATES, sorts: EVENT_SORTS }), [c.events, f]);
  const items: CalendarItem[] = filtered.map((e) => ({ id: e.id, title: e.title, start: e.start_date, end: e.end_date, tone: toneOf(e), hint: e.start_time?.slice(0, 5) }));
  const nonLective = useMemo(() => {
    const s = new Set<string>();
    for (const e of c.events.filter((x) => x.effect === "nao_lectivo" && x.status !== "cancelado")) {
      const cur = new Date(`${e.start_date}T00:00:00`);
      for (let i = 0; i < 62 && cur.toISOString().slice(0, 10) <= e.end_date; i++) { s.add(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
    }
    return s;
  }, [c.events]);

  const open = (e: ApiEvent) => { setSelected(e); openModal("calendar-event-detail"); };
  const publish = async (e: ApiEvent) => {
    try { await c.publish.mutateAsync({ id: e.id }); SucessMessage("Evento publicado."); }
    catch (err) { setConflict({ event: e, message: getApiErrorMessage(err, "Há conflitos com este evento.") }); openModal("calendar-publish-conflict"); }
  };

  const eventColumns: Column<ApiEvent>[] = [
    { key: "start_date", header: "Data", render: (_, e) => <span className="font-mono text-xs whitespace-nowrap">{e.start_date}{e.end_date !== e.start_date ? ` → ${e.end_date}` : ""}</span> },
    { key: "title", header: "Evento", render: (_, e) => (<div className="flex flex-col"><span className="font-medium">{e.title}</span><span className="text-xs text-muted-foreground">{EVENT_TYPE_LABEL[e.type] ?? e.type}{e.origin === "google_proposta" ? " • proposta do Google" : ""}</span></div>) },
    { key: "effect", header: "Efeito", render: (_, e) => EFFECT[e.effect] },
    { key: "visibility", header: "Visibilidade", render: (_, e) => VISIBILITY[e.visibility] },
    { key: "status", header: "Estado", render: (_, e) => <Badge variant="outline">{STATUS[e.status]}</Badge> },
    {
      key: "action", header: "Acção",
      render: (_, e) => (
        <ButtonOnlyAction data={e} actions={[
          { label: "Ver detalhe", icon: "Eye", onClick: open },
          ...(e.status === "rascunho" ? [{ permission: "calendar:publish", label: "Aprovar", icon: "CircleCheck" as const, onClick: (x: ApiEvent) => void c.approve.mutateAsync(x.id).then(() => SucessMessage("Evento aprovado.")).catch((er) => ErrorMessage(getApiErrorMessage(er, "A operação falhou."))) }] : []),
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
          { permission: "calendar:publish", label: "Confirmar", icon: "CircleCheck", onClick: (x) => { setHoliday({ row: x, decision: "confirmado" }); setReason(""); openModal("calendar-holiday-decision"); } },
          { permission: "calendar:publish", label: "Rejeitar", icon: "CircleX", onClick: (x) => { setHoliday({ row: x, decision: "rejeitado" }); setReason(""); openModal("calendar-holiday-decision"); } },
        ]} />
      ) : null,
    },
  ];

  const stat = (s: string) => c.events.filter((e) => e.status === s).length;

  return (
    <div className="space-y-6">
      <TitleList title="Calendário Escolar" suTitle={c.year ? `Ano lectivo ${c.year.name}: eventos, feriados e pontes, e sincronização com o Google Calendar.` : "Não há ano lectivo activo."}>
        <div className="flex gap-2">
          <Can permission="calendar:write"><Button size="sm" variant="outline" className="gap-1.5" disabled={!c.year || c.importNational.isPending} onClick={() => c.importNational.mutateAsync("apply").then(() => SucessMessage("Calendário nacional importado.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}><Icon name="Download" className="size-4" />Importar calendário nacional</Button></Can>
          <Can permission="calendar:write"><Button size="sm" className="gap-1.5" disabled={!c.year} onClick={() => openModal("calendar-new-event")}><Icon name="Plus" className="size-4" />Novo evento</Button></Can>
        </div>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={c.events.length} subtitle="Eventos no ano" icon="CalendarDays" description="Todos os estados" />
        <DynamicMetricCard title={stat("publicado")} subtitle="Publicados" icon="Send" description="Visíveis conforme a visibilidade" />
        <DynamicMetricCard title={stat("rascunho")} subtitle="Em rascunho" icon="Pencil" description="Aguardam aprovação" />
        <DynamicMetricCard title={c.holidays.filter((h) => h.status === "divergente").length} subtitle="Feriados divergentes" icon="TriangleAlert" description="Decisão da Direcção" colors={c.holidays.some((h) => h.status === "divergente") ? "destructive" : "default"} />
      </div>

      <Tabs defaultValue="events" className="space-y-2">
        <TabsList>
          <TabsTrigger value="events">Calendário</TabsTrigger>
          <TabsTrigger value="holidays">Feriados e pontes</TabsTrigger>
          <TabsTrigger value="google">Google Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="mt-6 inline-flex rounded-md border bg-sidebar p-1">
            <Button size="sm" variant={view === "calendario" ? "default" : "ghost"} className="h-8 gap-1.5" onClick={() => f.setFilter("vista", "calendario")}><Icon name="CalendarDays" className="size-4" />Calendário</Button>
            <Button size="sm" variant={view === "lista" ? "default" : "ghost"} className="h-8 gap-1.5" onClick={() => f.setFilter("vista", "lista")}><Icon name="List" className="size-4" />Lista</Button>
          </div>

          {view === "calendario" ? (
            <div className="space-y-6">
              <ListFilterBar<ApiEvent> prefix="eventos" f={f} searchPlaceholder="Pesquisar eventos" filters={EVENT_FILTERS} dateFilters={EVENT_DATES} shown={filtered.length} total={c.events.length} />
              <MonthCalendar items={items} month={month} onMonthChange={setMonth} markedDays={nonLective} onSelectItem={(it) => { const e = c.events.find((x) => x.id === it.id); if (e) open(e); }} onSelectDay={(d) => openModal("calendar-new-event", { date: d })} />
              <p className="text-xs text-muted-foreground">Dias com fundo âmbar são não lectivos. Clique num dia para criar um evento e num evento para ver o detalhe.</p>
            </div>
          ) : (
            <DataList<ApiEvent> prefix="eventos" rows={c.events} columns={eventColumns} isLoading={c.eventsLoading} searchPlaceholder="Pesquisar eventos" searchText={eventText} filters={EVENT_FILTERS} dateFilters={EVENT_DATES} sorts={EVENT_SORTS} emptyTitle="Sem eventos" emptyDescription="Importe o calendário nacional ou crie um evento." emptyIcon="CalendarDays" />
          )}
        </TabsContent>

        <TabsContent value="holidays" className="space-y-2">
          <p className="mt-4 text-xs text-muted-foreground">Compara a regra local, o calendário nacional importado{c.googleHolidays ? " e o Google" : ""}. As divergências são decididas pela Direcção; o Google é só um sinal.</p>
          <DataList<ApiHolidayRow & { id: string }>
            prefix="feriados"
            rows={c.holidays.map((h) => ({ ...h, id: `${h.date}-${h.kind}` }))}
            columns={holidayColumns}
            searchPlaceholder="Pesquisar feriado"
            searchText={(h) => h.name}
            filters={[
              { key: "estado", label: "Estado", icon: "CircleDot", options: Object.entries(HOLIDAY_STATUS).map(([value, label]) => ({ value, label })), match: (h, v) => h.status === v },
              { key: "tipo", label: "Tipo", icon: "Tag", options: [{ value: "feriado", label: "Feriado" }, { value: "ponte", label: "Ponte" }], match: (h, v) => h.kind === v },
            ]}
            dateFilters={[{ key: "data", label: "Data", getDate: (h) => h.date }]}
            sorts={[{ value: "data", label: "Data", compare: (a, b) => a.date.localeCompare(b.date) }]}
            emptyTitle="Sem feriados para este ano"
            emptyIcon="CalendarX"
          />
        </TabsContent>

        <TabsContent value="google" className="pt-4"><GooglePanel /></TabsContent>
      </Tabs>

      <NewEventModal />

      <FormModal id="calendar-event-detail" title={selected?.title ?? "Evento"} description={selected ? `${EVENT_TYPE_LABEL[selected.type] ?? selected.type} • ${STATUS[selected.status]}` : undefined} readOnly onSubmit={() => undefined}>
        {selected && (
          <div className="sm:col-span-2 space-y-3 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-[11px] uppercase text-muted-foreground">Data</dt><dd className="font-mono">{selected.start_date}{selected.end_date !== selected.start_date ? ` → ${selected.end_date}` : ""}</dd></div>
              <div><dt className="text-[11px] uppercase text-muted-foreground">Horário</dt><dd className="font-mono">{selected.start_time ? `${selected.start_time.slice(0, 5)}–${selected.end_time?.slice(0, 5) ?? ""}` : "Dia inteiro"}</dd></div>
              <div><dt className="text-[11px] uppercase text-muted-foreground">Efeito</dt><dd>{EFFECT[selected.effect]}</dd></div>
              <div><dt className="text-[11px] uppercase text-muted-foreground">Visibilidade</dt><dd>{VISIBILITY[selected.visibility]}</dd></div>
              <div><dt className="text-[11px] uppercase text-muted-foreground">Local</dt><dd>{selected.location ?? "—"}</dd></div>
              <div><dt className="text-[11px] uppercase text-muted-foreground">Origem</dt><dd>{ORIGIN[selected.origin]}</dd></div>
            </dl>
            {selected.justification && <p className="text-muted-foreground">{selected.justification}</p>}
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {selected.status === "rascunho" && <Button size="sm" variant="outline" onClick={() => c.approve.mutateAsync(selected.id).then(() => SucessMessage("Evento aprovado.")).catch((er) => ErrorMessage(getApiErrorMessage(er, "A operação falhou.")))}>Aprovar</Button>}
              {(selected.status === "aprovado" || selected.status === "rascunho") && <Can permission="calendar:publish"><Button size="sm" onClick={() => void publish(selected)}>Publicar</Button></Can>}
              {selected.status !== "cancelado" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setReason(""); openModal("calendar-cancel-event"); }}>Cancelar evento</Button>}
            </div>
          </div>
        )}
      </FormModal>

      <FormModal id="calendar-cancel-event" title="Cancelar evento" description="Indique o motivo (mínimo 5 caracteres)." submitLabel="Cancelar evento" isLoading={c.cancel.isPending} disabled={reason.trim().length < 5} onSubmit={() => (selected ? c.cancel.mutateAsync({ id: selected.id, reason: reason.trim() }).then(() => SucessMessage("Evento cancelado.")).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><Input label="Motivo *" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </FormModal>

      <FormModal id="calendar-holiday-decision" title={holiday?.decision === "confirmado" ? "Confirmar feriado" : "Rejeitar feriado"} description={holiday ? `${holiday.row.name} (${holiday.row.date})` : undefined} submitLabel="Registar decisão" isLoading={c.decide.isPending} disabled={reason.trim().length < 5} onSubmit={() => (holiday ? c.decide.mutateAsync({ date: holiday.row.date, kind: holiday.row.kind, decision: holiday.decision, reason: reason.trim() }).then(() => SucessMessage("Decisão registada.")).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><Input label="Fundamentação (mín. 5 caracteres) *" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </FormModal>

      <ConfirmModal id="calendar-publish-conflict" title="Publicar com conflitos?" description={`${conflict?.message ?? ""} Publicar mesmo assim?`} confirmLabel="Publicar mesmo assim" isLoading={c.publish.isPending} onConfirm={() => (conflict ? c.publish.mutateAsync({ id: conflict.event.id, confirm: true }).then(() => SucessMessage("Evento publicado.")).catch(fail) : undefined)} />
    </div>
  );
}
