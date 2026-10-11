"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, DashboardSkeleton, DynamicMetricCard, EmptyState } from "@/components";
import { platformService } from "@/services/platform-service";
import { formatCurrency } from "@/utils/format-currency";
import { OverviewSectionCard } from "../overview/overview-section-card";
import { QuickLinks } from "../overview/overview-blocks";

const STATUS_LABEL: Record<string, string> = { trial: "Em período de teste", active: "Activas", ativa: "Activas", past_due: "Pagamento em atraso", suspended: "Suspensas", cancelled: "Canceladas", expired: "Expiradas", pending: "Pendentes" };
const ATTENTION: Record<string, string> = { orders_awaiting_review: "Comprovativos por rever", past_due: "Pagamentos em atraso", trials_ending: "Testes a terminar", dead_letter: "Eventos falhados" };
const LINKS = [
  { label: "Painel da plataforma", href: "/admin/platform", icon: "Server" as const },
  { label: "Escolas", href: "/admin/schools", icon: "School" as const },
  { label: "Utilizadores", href: "/admin/users", icon: "Users" as const },
  { label: "Configurações", href: "/settings", icon: "Settings" as const },
];

/** Dashboard do administrador de sistema: receita recorrente, escolas por estado de subscrição, pendências e filas. */
export function PlatformDashboard() {
  const overview = useQuery({ queryKey: ["platform-overview"], queryFn: platformService.overview, staleTime: 30 * 1000, retry: false });
  const queue = useQuery({ queryKey: ["platform-queue"], queryFn: platformService.queue, staleTime: 30 * 1000, retry: false });
  const outbox = useQuery({ queryKey: ["platform-outbox"], queryFn: platformService.outbox, staleTime: 30 * 1000, retry: false });

  if (overview.isLoading) return <DashboardSkeleton />;
  if (overview.isError || !overview.data) return <EmptyState icon="ShieldAlert" title="Área restrita" description="Os indicadores da plataforma são só para a administração do sistema." />;

  const o = overview.data;
  const statuses = Object.entries(o.schools_by_subscription_status);
  const schools = statuses.reduce((a, [, v]) => a + v, 0);
  const attention = Object.entries(o.needs_attention);
  const pendingOrders = (queue.data ?? []).filter((q) => q.status === "payment_proof_submitted" || q.status === "under_review");

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4" data-tour="dashboard-summary">
        <DynamicMetricCard title={formatCurrency(Number(o.mrr))} subtitle="Receita mensal (MRR)" icon="Wallet" description={`ARR ${formatCurrency(Number(o.arr))}`} />
        <DynamicMetricCard title={schools} subtitle="Escolas" icon="Building2" description={`${statuses.length} estado(s) de subscrição`} />
        <DynamicMetricCard title={pendingOrders.length} subtitle="Comprovativos por rever" icon="FileCheck" colors={pendingOrders.length > 0 ? "destructive" : "default"} description="Subscrições à espera de decisão" />
        <DynamicMetricCard title={outbox.data?.dead_letter ?? 0} subtitle="Eventos falhados" icon="TriangleAlert" colors={(outbox.data?.dead_letter ?? 0) > 0 ? "destructive" : "default"} description={`${outbox.data?.pending ?? 0} pendentes na fila`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewSectionCard title="Escolas por estado de subscrição" icon="Building2" href="/admin/platform">
            {statuses.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Ainda não há escolas.</p> : (
              <ul className="divide-y">
                {statuses.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>{STATUS_LABEL[k] ?? k}</span>
                    <span className="flex items-center gap-3"><span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${schools ? (v / schools) * 100 : 0}%` }} /></span><span className="w-6 text-right font-semibold tabular-nums">{v}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </OverviewSectionCard>
        </div>
        <OverviewSectionCard title="Precisa de atenção" icon="ShieldAlert" href="/admin/platform">
          <div className="flex flex-wrap gap-2">
            {attention.length === 0 ? <p className="text-sm text-muted-foreground">Nada pendente.</p> : attention.map(([k, v]) => <Badge key={k} variant={v > 0 ? "warning" : "outline"} className="font-normal">{ATTENTION[k] ?? k}: {v}</Badge>)}
          </div>
        </OverviewSectionCard>
      </div>

      <QuickLinks items={LINKS} />
    </div>
  );
}
