"use client";

import Link from "next/link";
import { RoleDashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  AcademicCyclePerformanceChart,
} from "../widgets";

interface MedAuditorDashboardViewProps {
  data: RoleDashboardData;
}

export function MedAuditorDashboardView({ data }: MedAuditorDashboardViewProps) {
  const officialMedMaps = [
    {
      code: "MAPA I",
      name: "Estatística Inicial do Ano Lectivo",
      description: "Matrículas confirmadas por classe, idade e género.",
      status: "HOMOLOGADO",
      date: "Setembro 2025",
    },
    {
      code: "MAPA II",
      name: "Aproveitamento do 1º Trimestre",
      description: "Resultados por disciplina e taxas de transição intercalares.",
      status: "HOMOLOGADO",
      date: "Dezembro 2025",
    },
    {
      code: "MAPA III",
      name: "Aproveitamento Final e Transição",
      description: "Classificações finais, exames e aprovação segundo Decreto 424/25.",
      status: "EM_PROCESSAMENTO",
      date: "Previsto Julho 2026",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Auditor KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Cycle Performance & Official MED Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AcademicCyclePerformanceChart data={data.cyclePerformance} />
        </div>

        <div>
          <Card className="border shadow-none bg-card h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon name="FileSpreadsheet" className="w-5 h-5 text-primary" />
                  Mapas Oficiais MED
                </CardTitle>
                <Link href="/reports/med">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary p-0">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              {officialMedMaps.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{m.code}</span>
                    <Badge
                      className={
                        m.status === "HOMOLOGADO"
                          ? "bg-emerald-100 text-emerald-800 text-[10px]"
                          : "bg-amber-100 text-amber-800 text-[10px]"
                      }
                    >
                      {m.status === "HOMOLOGADO" ? "Homologado" : "Em Elaboração"}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground text-xs">{m.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{m.description}</p>
                  <div className="flex justify-between items-center pt-1 border-t text-[10px] text-muted-foreground">
                    <span>{m.date}</span>
                    <Link href="/reports/med" className="text-primary font-medium hover:underline">
                      Descarregar
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
