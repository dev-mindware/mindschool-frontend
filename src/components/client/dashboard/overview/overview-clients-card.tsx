import { Icon, MetricTrendIndicator, Progress } from "@/components";
import { OverviewSectionCard } from "./overview-section-card";
import type { DashboardClientsOverview } from "@/types";

interface OverviewClientsCardProps {
    clients: DashboardClientsOverview;
}

export function OverviewClientsCard({ clients }: OverviewClientsCardProps) {
    return (
        <OverviewSectionCard title="Clientes" icon="Users" href="/clients">
            <ul className="space-y-3.5">
                <li className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="User" className="size-4" />
                        Total de clientes
                    </span>
                    <span className="font-semibold tabular-nums">
                        {clients.totalClients.toLocaleString("pt-PT")}
                    </span>
                </li>

                <li className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="UserPlus" className="size-4" />
                        Novos clientes
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">
                            {clients.newClientsThisMonth}
                        </span>
                        <MetricTrendIndicator
                            percent={clients.newClientsVariationPercent}
                        />
                    </span>
                </li>

                <li className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Icon name="UserCheck" className="size-4" />
                            Clientes recorrentes
                        </span>
                        <span className="font-semibold tabular-nums">
                            {clients.recurringClientsPercentage}%
                        </span>
                    </div>
                    <Progress
                        value={clients.recurringClientsPercentage}
                        className="h-1.5 bg-muted"
                    />
                </li>

                <li className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="UserX" className="size-4" />
                        Clientes com dívida
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">
                            {clients.clientsWithDebt}
                        </span>
                        {/* Subir a dívida é mau: a seta fica vermelha mesmo sendo positiva. */}
                        <MetricTrendIndicator
                            percent={clients.clientsWithDebtVariationPercent}
                            higherIsBetter={false}
                        />
                    </span>
                </li>
            </ul>
        </OverviewSectionCard>
    );
}
