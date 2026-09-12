"use client";

import Link from "next/link";
import { RoleDashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  SecretaryQueueWidget,
} from "../widgets";

interface SecretaryDashboardViewProps {
  data: RoleDashboardData;
}

export function SecretaryDashboardView({ data }: SecretaryDashboardViewProps) {
  const enrollmentFunnel = [
    { cycle: "Ensino Primário (1ª à 6ª)", totalSlots: 650, enrolled: 620, remaining: 30 },
    { cycle: "I Ciclo Secundário (7ª à 9ª)", totalSlots: 450, enrolled: 410, remaining: 40 },
    { cycle: "II Ciclo / Médio (10ª à 12ª)", totalSlots: 250, enrolled: 220, remaining: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Secretary KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Secretary Document Queue & Enrollment Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SecretaryQueueWidget queue={data.secretaryQueue} />
        </div>

        <div>
          <Card className="border shadow-none bg-card h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon name="DoorOpen" className="w-5 h-5 text-primary" />
                  Vagas e Matrículas
                </CardTitle>
                <Link href="/students/enrollments">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary p-0">
                    Vagas
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {enrollmentFunnel.map((item, idx) => {
                const fillPercent = Math.round((item.enrolled / item.totalSlots) * 100);
                return (
                  <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-muted/20 border text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground truncate">{item.cycle}</span>
                      <span className="text-muted-foreground font-medium">{fillPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>{item.enrolled} matriculados</span>
                      <span className="text-emerald-600 font-semibold">{item.remaining} vagas livres</span>
                    </div>
                  </div>
                );
              })}

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs flex items-center gap-2.5">
                <Icon name="Info" className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  Candidaturas para exames de acesso encerram no próximo sábado.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
