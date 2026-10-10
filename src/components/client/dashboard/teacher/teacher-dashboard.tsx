"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, DashboardSkeleton, DynamicMetricCard, type ChartConfig } from "@/components";
import { ChartCard, ChartEmpty } from "@/components/shared/chart-card";
import { useSchoolOverview } from "@/hooks/dashboard/use-school-overview";
import { dashboardService } from "@/services/dashboard-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { EventsCard, LessonsCard, QuickLinks } from "../overview/overview-blocks";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const config = { aulas: { label: "Aulas", color: "var(--primary)" } } satisfies ChartConfig;
const LINKS = [
  { label: "Lançar notas", href: "/grades/entry", icon: "ClipboardCheck" as const },
  { label: "Assiduidade", href: "/academic/attendance", icon: "CalendarCheck" as const },
  { label: "Aulas e sumários", href: "/academic/lessons", icon: "BookOpen" as const },
  { label: "Horários", href: "/academic/timetables", icon: "CalendarRange" as const },
];

/** Dashboard do professor: aulas de hoje e da semana, turmas leccionadas, próximos eventos e atalhos de trabalho. */
export function TeacherDashboard() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const o = useSchoolOverview();
  const { data: days = [], isLoading } = useQuery({ queryKey: ["dash-my-timetable", schoolId], queryFn: () => dashboardService.myTimetable().catch(() => []), enabled: Boolean(schoolId), staleTime: 60 * 1000, retry: false });

  if (isLoading) return <DashboardSkeleton />;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  const upcomingToday = [...o.todaysLessons].sort((a, b) => a.start.localeCompare(b.start)).filter((l) => minutes(l.start) > nowMin);
  const next = upcomingToday[0];
  const weekly = days.reduce((a, d) => a + d.entries.length, 0);
  const sections = new Set(days.flatMap((d) => d.entries.map((e) => e.section?.name).filter(Boolean)));
  const subjects = new Set(days.flatMap((d) => d.entries.map((e) => e.subject.name)));
  const perDay = DAYS.slice(0, 6).map((name, i) => ({ name, aulas: days.find((d) => d.weekday === i + 1)?.entries.length ?? 0 }));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4" data-tour="dashboard-summary">
        <DynamicMetricCard title={o.todaysLessons.length} subtitle="Aulas hoje" icon="BookOpen" description={upcomingToday.length > 0 ? `${upcomingToday.length} ainda por dar` : "Sem mais aulas hoje"} />
        <DynamicMetricCard title={next ? next.start : "—"} subtitle="Próxima aula" icon="Clock" description={next ? `${next.subject.name}${next.section ? ` · ${next.section.name}` : ""}` : "Nada agendado para o resto do dia"} />
        <DynamicMetricCard title={weekly} subtitle="Aulas por semana" icon="CalendarRange" description="Segundo o horário publicado" />
        <DynamicMetricCard title={sections.size} subtitle="Turmas" icon="Users" description={`${subjects.size} disciplina(s) leccionada(s)`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Carga semanal" icon="ChartColumn" description="Número de aulas em cada dia da semana">
            {weekly === 0 ? <ChartEmpty text="O seu horário ainda não foi publicado." /> : (
              <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
                <BarChart data={perDay} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="aulas" fill="var(--color-aulas)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </ChartCard>
        </div>
        <LessonsCard lessons={o.todaysLessons} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <EventsCard events={o.upcoming} />
        <QuickLinks items={LINKS} />
      </div>
    </div>
  );
}
