"use client";

import { useMemo } from "react";
import { DynamicMetricCard, EmptyState, Tabs, TabsContent, TabsList, TabsTrigger, WeekTimetable, type TimetableBlock } from "@/components";
import { usePortal } from "@/modules/family/hooks/use-portal";
import type { PortalTimetableDay } from "@/modules/family/services/portal-service";
import type { FamilyContext } from "./family-shell";

type Entry = PortalTimetableDay["entries"][number];
const WEEKDAY = ["", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const isoWeekday = (d: Date) => ((d.getDay() + 6) % 7) + 1;
const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

function DayList({ title, entries, now }: { title: string; entries: Entry[]; now?: number }) {
  if (entries.length === 0) return <EmptyState icon="CalendarOff" title={`Sem aulas — ${title}`} description="Não há aulas marcadas para este dia." />;
  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const current = now !== undefined && minutes(e.start) <= now && now < minutes(e.end);
        const past = now !== undefined && minutes(e.end) <= now;
        return (
          <div key={e.id} className={`flex items-center gap-4 rounded-xl border bg-card p-3 ${current ? "border-primary ring-1 ring-primary/30" : ""} ${past ? "opacity-60" : ""}`}>
            <div className="w-24 shrink-0 text-center font-mono text-sm"><div className="font-semibold">{e.start}</div><div className="text-xs text-muted-foreground">{e.end}</div></div>
            <div className="flex-1">
              <p className="font-medium">{e.subject.name}</p>
              <p className="text-xs text-muted-foreground">{e.teacher.full_name}{e.room ? ` • Sala ${e.room.code}` : ""}</p>
            </div>
            {current && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">A decorrer</span>}
          </div>
        );
      })}
    </div>
  );
}

/** Horário do educando: hoje, amanhã e a semana inteira, com destaque da aula em curso e da próxima. */
export function FamilySchedule({ studentId }: FamilyContext) {
  const { timetable } = usePortal(studentId, ["timetable"]);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = isoWeekday(now);
  const tomorrow = today === 7 ? 1 : today + 1;
  const of = (wd: number): Entry[] => (timetable.find((d) => d.weekday === wd)?.entries ?? []).slice().sort((a, b) => a.start.localeCompare(b.start));
  const todayEntries = of(today);
  const next = todayEntries.find((e) => minutes(e.start) > nowMin);
  const weeklyLessons = timetable.reduce((a, d) => a + d.entries.length, 0);
  const subjects = new Set(timetable.flatMap((d) => d.entries.map((e) => e.subject.name))).size;

  const blocks: TimetableBlock<unknown>[] = useMemo(
    () => timetable.flatMap((d) => d.entries.map((e) => ({ id: e.id, weekday: d.weekday, start: e.start, end: e.end, title: e.subject.name, subtitle: e.teacher.full_name, meta: e.room?.code ?? undefined, tone: "primary" as const }))),
    [timetable],
  );

  if (timetable.length === 0) return <EmptyState icon="CalendarRange" title="Sem horário" description="O horário ainda não foi publicado." />;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={todayEntries.length} subtitle="Aulas hoje" icon="CalendarDays" description={WEEKDAY[today] ?? ""} />
        <DynamicMetricCard title={next ? next.start : "—"} subtitle="Próxima aula" icon="Clock" description={next ? next.subject.name : "Sem mais aulas hoje"} />
        <DynamicMetricCard title={weeklyLessons} subtitle="Aulas por semana" icon="CalendarRange" description="Tempos lectivos" />
        <DynamicMetricCard title={subjects} subtitle="Disciplinas" icon="BookOpen" description="No horário" />
      </div>
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="today" className="text-xs">Hoje</TabsTrigger>
          <TabsTrigger value="tomorrow" className="text-xs">Amanhã</TabsTrigger>
          <TabsTrigger value="week" className="text-xs">Semana</TabsTrigger>
        </TabsList>
        <TabsContent value="today"><DayList title={WEEKDAY[today] ?? "hoje"} entries={todayEntries} now={nowMin} /></TabsContent>
        <TabsContent value="tomorrow"><DayList title={WEEKDAY[tomorrow] ?? "amanhã"} entries={of(tomorrow)} /></TabsContent>
        <TabsContent value="week"><WeekTimetable blocks={blocks} days={[1, 2, 3, 4, 5, 6]} /></TabsContent>
      </Tabs>
    </>
  );
}
