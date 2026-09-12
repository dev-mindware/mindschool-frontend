"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { StudentDashboardSummary } from "@/types";
import { cn } from "@/lib/utils";

interface StudentGradesMiniBulletinProps {
  summary?: StudentDashboardSummary;
}

export function StudentGradesMiniBulletin({ summary }: StudentGradesMiniBulletinProps) {
  if (!summary) return null;

  return (
    <div className="space-y-4">
      {/* Student identification card */}
      <div className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
            {summary.studentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {summary.studentName}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-muted-foreground">
              <span>Nº Processo: <strong className="text-foreground">{summary.studentNumber}</strong></span>
              <span>•</span>
              <span>{summary.className}</span>
              <span>•</span>
              <span>Ano {summary.academicYear}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-500/40 text-emerald-700 bg-emerald-50 px-2.5 py-1 text-xs font-semibold"
          >
            Média: {summary.generalAverage} Valores
          </Badge>
          <Link href="/certificates/report-cards">
            <Button size="sm" className="h-8 text-xs">
              <Icon name="Download" className="w-3.5 h-3.5 mr-1.5" />
              Boletim PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Grades Table */}
      <Card className="border shadow-none bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name="BookOpen" className="w-5 h-5 text-primary" />
            Classificações do 1º Trimestre (Decreto 424/25)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase border-b bg-muted/30">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Disciplina</th>
                  <th className="py-2.5 px-3 font-medium">Professor</th>
                  <th className="py-2.5 px-3 font-medium text-center">MAC</th>
                  <th className="py-2.5 px-3 font-medium text-center">CPP</th>
                  <th className="py-2.5 px-3 font-medium text-center">Nota Trimestral (CT)</th>
                  <th className="py-2.5 px-3 font-medium text-center">Faltas</th>
                  <th className="py-2.5 px-3 font-medium text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary.grades.map((grade) => {
                  const isPassing = grade.ct >= 10;
                  const isGood = grade.ct >= 14;

                  return (
                    <tr key={grade.subjectName} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {grade.subjectName}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {grade.teacherName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {grade.mac.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {grade.cpp.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={cn(
                            "font-mono font-medium px-2 py-0.5 rounded text-xs",
                            isGood
                              ? "bg-emerald-100 text-emerald-800"
                              : isPassing
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                          )}
                        >
                          {grade.ct.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {grade.absences}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0 font-medium",
                            isPassing
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          )}
                        >
                          {grade.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
