"use client";

import { useState } from "react";
import { Badge, Button, DataList, DynamicMetricCard, Icon, MonthCalendar, Tabs, TabsContent, TabsList, TabsTrigger, type CalendarItem, type Column } from "@/components";
import { usePortal } from "@/modules/family/hooks/use-portal";
import type { PortalEvent } from "@/modules/family/services/portal-service";

const TYPE_LABEL: Record<string, string> = { feriado: "Feriado", prova: "Prova", reuniao: "Reunião", evento: "Evento", exame: "Exame", pedagogico: "Pedagógico", ferias: "Férias" };
const typeLabel = (t: string) => TYPE_LABEL[t] ?? t.replaceAll("_", " ");
const ymd = (d: string) => d.slice(0, 10).replaceAll("-", "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const plusDay = (d: string) => { const x = new Date(`${d.slice(0, 10)}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10).replaceAll("-", ""); };

/** Calendário em formato ICS (DTEND exclusivo em eventos de dia inteiro). */
function toIcs(events: PortalEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MindEscola//Calendario escolar//PT", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.id}@mindescola`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${ymd(e.start_date)}`, `DTEND;VALUE=DATE:${plusDay(e.end_date)}`, `SUMMARY:${esc(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []), ...(e.location ? [`LOCATION:${esc(e.location)}`] : []), "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

const download = (events: PortalEvent[]) => {
  const url = URL.createObjectURL(new Blob([toIcs(events)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "calendario-escolar.ics";
  a.click();
  URL.revokeObjectURL(url);
};

/** Calendário escolar: vista mensal, agenda em lista com filtros e exportação para o telemóvel (ICS). */
export function FamilyCalendar() {
  const { calendar } = usePortal(undefined, ["calendar"]);
  const [month, setMonth] = useState(() => new Date());
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = calendar.filter((e) => e.end_date.slice(0, 10) >= today).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const items: CalendarItem[] = calendar.map((e) => ({ id: e.id, title: e.title, start: e.start_date, end: e.end_date, tone: e.effect === "non_lective" ? ("muted" as const) : ("primary" as const) }));
  const inMonth = upcoming.filter((e) => e.start_date.slice(0, 7) === today.slice(0, 7)).length;

  const columns: Column<PortalEvent>[] = [
    { key: "start_date", header: "Data", render: (_, e) => <span className="font-mono text-xs">{e.start_date.slice(0, 10)}{e.end_date.slice(0, 10) !== e.start_date.slice(0, 10) && ` → ${e.end_date.slice(0, 10)}`}</span> },
    { key: "title", header: "Evento", render: (_, e) => (<div><span className="font-medium">{e.title}</span>{e.description && <p className="line-clamp-1 text-xs text-muted-foreground">{e.description}</p>}</div>) },
    { key: "type", header: "Tipo", render: (_, e) => <Badge variant="outline" className="font-normal">{typeLabel(e.type)}</Badge> },
    { key: "location", header: "Local", render: (_, e) => <span className="text-xs text-muted-foreground">{e.location ?? "—"}</span> },
    { key: "effect", header: "Aulas", render: (_, e) => <Badge variant={e.effect === "non_lective" ? "secondary" : "info"} className="font-normal">{e.effect === "non_lective" ? "Sem aulas" : "Letivo"}</Badge> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={upcoming.length} subtitle="Próximos eventos" icon="CalendarDays" description="Daqui para a frente" />
        <DynamicMetricCard title={inMonth} subtitle="Neste mês" icon="Calendar" description="Eventos a começar" />
        <DynamicMetricCard title={upcoming[0] ? upcoming[0].start_date.slice(5, 10).split("-").reverse().join("/") : "—"} subtitle="Próximo evento" icon="Clock" description={upcoming[0]?.title ?? "Sem eventos"} />
        <DynamicMetricCard title={calendar.filter((e) => e.effect === "non_lective").length} subtitle="Dias sem aulas" icon="CalendarOff" description="Feriados e pausas" />
      </div>
      <div className="flex justify-end"><Button size="sm" variant="outline" className="gap-2" disabled={calendar.length === 0} onClick={() => download(calendar)}><Icon name="CalendarPlus" className="size-4" />Exportar (ICS)</Button></div>
      <Tabs defaultValue="month" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap"><TabsTrigger value="month" className="text-xs">Mensal</TabsTrigger><TabsTrigger value="agenda" className="text-xs">Agenda</TabsTrigger></TabsList>
        <TabsContent value="month"><MonthCalendar items={items} month={month} onMonthChange={setMonth} /></TabsContent>
        <TabsContent value="agenda">
          <DataList<PortalEvent>
            prefix="agenda" rows={calendar} columns={columns} pageSize={12}
            searchPlaceholder="Pesquisar evento" searchText={(e) => `${e.title} ${e.description ?? ""} ${e.location ?? ""}`}
            filters={[
              { key: "tipo", label: "Tipo", icon: "Tag", options: [...new Set(calendar.map((e) => e.type))].map((value) => ({ value, label: typeLabel(value) })), match: (e, v) => e.type === v },
              { key: "aulas", label: "Aulas", icon: "School", options: [{ value: "lectivo", label: "Letivo" }, { value: "sem", label: "Sem aulas" }], match: (e, v) => (v === "sem" ? e.effect === "non_lective" : e.effect !== "non_lective") },
            ]}
            dateFilters={[{ key: "data", label: "Data", getDate: (e) => e.start_date }]}
            sorts={[{ value: "data", label: "Data", compare: (a, b) => a.start_date.localeCompare(b.start_date) }]}
            emptyTitle="Sem eventos" emptyDescription="Ainda não há eventos publicados." emptyIcon="CalendarDays"
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
