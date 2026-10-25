"use client";

import { formatIsoDay } from "@/utils/format-date";
import { MED_MAP_LABEL, MED_STATUS_LABEL } from "@/constants/labels";
import { Cell, Pie, PieChart } from "recharts";
import { Badge, ChartContainer, ChartTooltip, ChartTooltipContent, DashboardSkeleton, DynamicMetricCard, type ChartConfig } from "@/components";
import { ChartCard, ChartEmpty, LegendRow } from "@/components/shared/chart-card";
import { useMedSnapshots, type MedSnapshot, type MedStatus } from "@/hooks/school/use-med-snapshots";
import { EmptyState } from "@/components";
import { OverviewSectionCard } from "../overview/overview-section-card";
import { QuickLinks } from "../overview/overview-blocks";

const STATUS_COLOR: Record<MedStatus, string> = { gerado: "#94a3b8", validado: "#3b82f6", aprovado: "var(--primary)", exportado: "#f59e0b", submetido: "#10b981" };
const PUBLISHED: MedStatus[] = ["aprovado", "exportado", "submetido"];
const LINKS = [
  { label: "Mapas do MED", href: "/reports/med", icon: "Map" as const },
  { label: "Rendimento", href: "/reports/academic", icon: "ChartLine" as const },
  { label: "Pautas trimestrais", href: "/grades/pautas", icon: "Table" as const },
  { label: "Configurações", href: "/settings", icon: "Settings" as const },
];

/** Dashboard do auditor MED: mapas oficiais disponíveis (aprovados, exportados, submetidos), estado dos instantâneos e pendências. */
export function MedAuditorDashboard() {
  const { snapshots, isLoading } = useMedSnapshots();
  if (isLoading) return <DashboardSkeleton />;

  const published = snapshots.filter((s) => PUBLISHED.includes(s.status));
  const submitted = snapshots.filter((s) => s.status === "submetido");
  const latest = [...snapshots].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const blocking = snapshots.reduce((a, s) => a + s.issues.filter((i) => i.severity === "blocking").length, 0);
  const byStatus = (Object.keys(MED_STATUS_LABEL) as MedStatus[]).map((k) => ({ name: MED_STATUS_LABEL[k], key: k, value: snapshots.filter((s) => s.status === k).length })).filter((r) => r.value > 0);
  const config = Object.fromEntries(byStatus.map((r) => [r.name, { label: r.name, color: STATUS_COLOR[r.key] }])) satisfies ChartConfig;
  const recent = [...published].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col gap-4 md:gap-6">
        <EmptyState icon="Map" title="Ainda não há mapas do MED" description="Quando a escola gerar e aprovar os instantâneos (matrículas e aproveitamento), eles aparecem aqui para consulta." />
        <QuickLinks items={LINKS} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4" data-tour="dashboard-summary">
        <DynamicMetricCard title={published.length} subtitle="Mapas disponíveis" icon="Map" description="Aprovados, exportados ou submetidos" />
        <DynamicMetricCard title={submitted.length} subtitle="Submetidos ao MED" icon="Send" description={submitted[0]?.submission_reference ? `Último protocolo ${submitted[0].submission_reference}` : "Com protocolo de entrega"} />
        <DynamicMetricCard title={latest ? formatIsoDay(latest.created_at) : "—"} subtitle="Último instantâneo" icon="CalendarClock" description={latest ? `${MED_MAP_LABEL[latest.map_type]} · v${latest.version}` : "Sem instantâneos"} />
        <DynamicMetricCard title={blocking} subtitle="Pendências bloqueantes" icon="TriangleAlert" colors={blocking > 0 ? "destructive" : "default"} description={blocking > 0 ? "Impedem a aprovação de mapas" : "Nenhuma verificação bloqueante"} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewSectionCard title="Mapas publicados" icon="FileCheck" href="/reports/med">
            {recent.length === 0 ? <ChartEmpty text="Ainda não há mapas aprovados." /> : (
              <ul className="divide-y">
                {recent.map((s: MedSnapshot) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{MED_MAP_LABEL[s.map_type]} · v{s.version}</p>
                      <p className="text-xs text-muted-foreground">{formatIsoDay(s.created_at)} · checksum <span className="font-mono">{s.checksum.slice(0, 10)}…</span></p>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-normal">{MED_STATUS_LABEL[s.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </OverviewSectionCard>
        </div>
        <ChartCard title="Instantâneos por estado" icon="ChartPie" description="Do gerado à submissão ao MED">
          {byStatus.length === 0 ? <ChartEmpty text="Sem instantâneos." /> : (
            <>
              <ChartContainer config={config} className="mx-auto h-[180px] w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                    {byStatus.map((r) => <Cell key={r.key} fill={STATUS_COLOR[r.key]} />)}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <ul className="mt-2 space-y-1.5">{byStatus.map((r) => <LegendRow key={r.key} color={STATUS_COLOR[r.key]} label={r.name} value={r.value} />)}</ul>
            </>
          )}
        </ChartCard>
      </div>

      <QuickLinks items={LINKS} />
    </div>
  );
}
