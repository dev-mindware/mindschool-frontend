"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { TeacherAttendanceKpi } from "@/types";

interface TeacherAttendanceWidgetProps {
  attendance?: TeacherAttendanceKpi;
  isTeacherView?: boolean;
}

export function TeacherAttendanceWidget({
  attendance,
  isTeacherView = false,
}: TeacherAttendanceWidgetProps) {
  if (!attendance) return null;

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name="QrCode" className="w-5 h-5 text-primary" />
            {isTeacherView ? "Meu Ponto de Hoje" : "Assiduidade Docente (QR Code)"}
          </CardTitle>
          <Link href="/teachers-attendance">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/90">
              Ver Histórico <Icon name="ArrowRight" className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isTeacherView && attendance.myStatusToday ? (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Icon name={"CircleCheck" as any} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Presença Confirmada
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Entrada registada às {attendance.myStatusToday.checkInTime}
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Presente</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10 text-xs">
              <div className="p-2 rounded bg-background">
                <span className="text-muted-foreground block">Aulas Planeadas Hoje</span>
                <span className="text-sm font-bold text-foreground">
                  {attendance.myStatusToday.plannedClassesToday} Tempos
                </span>
              </div>
              <div className="p-2 rounded bg-background">
                <span className="text-muted-foreground block">Aulas Concluídas</span>
                <span className="text-sm font-bold text-emerald-600">
                  {attendance.myStatusToday.completedClassesToday} Tempos
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border text-center">
              <span className="text-xs text-muted-foreground block">Presentes Hoje</span>
              <span className="text-xl font-bold text-emerald-600">
                {attendance.checkedInToday} / {attendance.totalTeachers}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border text-center">
              <span className="text-xs text-muted-foreground block">Pontualidade</span>
              <span className="text-xl font-bold text-primary">
                {attendance.punctualityRate}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border text-center">
              <span className="text-xs text-muted-foreground block">Ausentes</span>
              <span className="text-xl font-bold text-rose-600">
                {attendance.absentToday}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border text-center">
              <span className="text-xs text-muted-foreground block">Chegadas Tardia</span>
              <span className="text-xl font-bold text-amber-600">
                {attendance.lateArrivals}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Registo em tempo real via QR Code institucional
          </span>
          {attendance.lastCheckInTime && (
            <span>Último registo: {attendance.lastCheckInTime}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
