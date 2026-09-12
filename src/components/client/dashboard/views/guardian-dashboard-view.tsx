"use client";

import Link from "next/link";
import { RoleDashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  StudentGradesMiniBulletin,
} from "../widgets";

interface GuardianDashboardViewProps {
  data: RoleDashboardData;
}

export function GuardianDashboardView({ data }: GuardianDashboardViewProps) {
  const upcomingExams = data.studentSummary?.upcomingExams || [];

  return (
    <div className="space-y-6">
      {/* 4 Guardian/Student KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Mini Bulletin & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudentGradesMiniBulletin summary={data.studentSummary} />
        </div>

        <div className="space-y-4">
          {/* Upcoming Tests */}
          <Card className="border shadow-none bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon name="Calendar" className="w-5 h-5 text-primary" />
                  Próximas Avaliações
                </CardTitle>
                <Link href="/online-exams">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary p-0">
                    Provas
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-1">
              {upcomingExams.map((exam, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{exam.subject}</span>
                    <Badge
                      variant={exam.type === "ONLINE" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {exam.type === "ONLINE" ? "Online" : "Presencial"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{exam.title}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <span className="font-medium text-primary">{exam.date}</span>
                    {exam.type === "ONLINE" && (
                      <Link href="/online-exams">
                        <Button size="sm" className="h-6 text-[10px] px-2">
                          Iniciar
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* School Communications */}
          <Card className="border shadow-none bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name="Megaphone" className="w-5 h-5 text-primary" />
                Comunicados Escolares
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                <span className="font-semibold text-foreground text-xs block">
                  Reunião Geral de Encarregados de Educação
                </span>
                <p className="text-muted-foreground text-[11px]">
                  Sábado, dia 21 de Março às 09:30 no Auditório Central.
                </p>
                <span className="text-[10px] text-primary font-medium block pt-0.5">
                  Assunto: Balanço do 1º Trimestre
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
