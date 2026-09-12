"use client";

import Link from "next/link";
import { RoleDashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import {
  DashboardKpiGrid,
  DashboardQuickActions,
  TeacherAttendanceWidget,
} from "../widgets";

interface TeacherDashboardViewProps {
  data: RoleDashboardData;
}

export function TeacherDashboardView({ data }: TeacherDashboardViewProps) {
  const todaysSchedule = [
    {
      time: "07:30 - 09:00",
      subject: "Matemática",
      className: "9ª Classe A",
      room: "Sala 14 - Bloco B",
      status: "CONCLUIDA",
    },
    {
      time: "09:15 - 10:45",
      subject: "Física",
      className: "10ª Classe B",
      room: "Laboratório 2",
      status: "CONCLUIDA",
    },
    {
      time: "11:00 - 12:30",
      subject: "Matemática",
      className: "9ª Classe B",
      room: "Sala 15 - Bloco B",
      status: "PROXIMA",
    },
    {
      time: "14:00 - 15:30",
      subject: "Apoio e Tutoria",
      className: "Alunos em Risco",
      room: "Sala de Estudo 1",
      status: "AGENDADA",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Teacher KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* Quick Actions */}
      <DashboardQuickActions actions={data.quickActions} />

      {/* Teacher Punch Attendance & Daily Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TeacherAttendanceWidget attendance={data.teacherAttendance} isTeacherView />
        </div>

        <div className="lg:col-span-2">
          <Card className="border shadow-none bg-card h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon name="Calendar" className="w-5 h-5 text-primary" />
                  Horário e Próximas Aulas de Hoje
                </CardTitle>
                <Badge variant="outline" className="text-xs font-semibold text-primary">
                  Hoje: Quarta-feira
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5">
              {todaysSchedule.map((lesson, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-muted font-mono font-bold text-foreground">
                      {lesson.time}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {lesson.subject} • {lesson.className}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {lesson.room}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lesson.status === "CONCLUIDA" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Concluída
                      </Badge>
                    ) : lesson.status === "PROXIMA" ? (
                      <Badge className="bg-primary text-primary-foreground text-[10px] font-medium animate-pulse">
                        Em Breve
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Agendada
                      </Badge>
                    )}
                    <Link href="/grades/entry">
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                        Notas
                      </Button>
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
