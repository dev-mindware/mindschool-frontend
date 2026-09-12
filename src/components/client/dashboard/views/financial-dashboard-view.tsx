"use client";

import Link from "next/link";
import { RoleDashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  TuitionRevenueChart,
} from "../widgets";

interface FinancialDashboardViewProps {
  data: RoleDashboardData;
}

export function FinancialDashboardView({ data }: FinancialDashboardViewProps) {
  const topOverdueClasses = [
    { className: "10ª Classe - Turma C", overdueCount: 14, totalAoa: "700.000 Kz", risk: "HIGH" },
    { className: "8ª Classe - Turma B", overdueCount: 11, totalAoa: "495.000 Kz", risk: "MEDIUM" },
    { className: "9ª Classe - Turma A", overdueCount: 9, totalAoa: "405.000 Kz", risk: "MEDIUM" },
    { className: "12ª Classe - Informática", overdueCount: 6, totalAoa: "360.000 Kz", risk: "LOW" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Financial KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Tuition Revenue Chart & Overdue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TuitionRevenueChart financial={data.tuitionFinancial} />
        </div>

        <div>
          <Card className="border shadow-none bg-card h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon name={"CircleAlert" as any} className="w-5 h-5 text-rose-600" />
                  Inadimplência por Turma
                </CardTitle>
                <Link href="/tuition/collections">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary p-0">
                    Cobrança
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-1">
              {topOverdueClasses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground block truncate">
                      {item.className}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.overdueCount} mensalidades atrasadas
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-600 block text-xs">
                      {item.totalAoa}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1 py-0 font-semibold bg-rose-50 text-rose-700"
                    >
                      Atraso &gt; 30d
                    </Badge>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-lg bg-muted/40 border text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon name="ShieldCheck" className="w-4 h-4 text-emerald-600" />
                  <span>Conformidade AGT Angola</span>
                </div>
                <p className="text-[11px]">
                  Faturas assinadas com Chave RSA certificada e ficheiro SAF-T (AO) pronto para extração mensal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
