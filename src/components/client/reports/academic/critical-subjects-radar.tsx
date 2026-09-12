"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { CriticalSubjectDiagnostic } from "@/types";
import { cn } from "@/lib/utils";

interface CriticalSubjectsRadarProps {
  subjects: CriticalSubjectDiagnostic[];
}

export function CriticalSubjectsRadar({ subjects }: CriticalSubjectsRadarProps) {
  if (!subjects || subjects.length === 0) return null;

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name={"TriangleAlert" as any} className="w-5 h-5 text-rose-600" />
              Radar de Disciplinas Críticas (Prevenção de Insucesso)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Disciplinas com taxa de notas negativas (&lt; 10 valores) acima do limiar regulamentar
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-700 bg-rose-50">
            Intervenção Preventiva
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {subjects.map((item) => {
          const isCritical = item.urgencyLevel === "CRITICAL";
          const isHigh = item.urgencyLevel === "HIGH";

          return (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs",
                isCritical
                  ? "bg-rose-500/5 border-rose-500/25 hover:bg-rose-500/10"
                  : isHigh
                  ? "bg-amber-500/5 border-amber-500/25 hover:bg-amber-500/10"
                  : "bg-muted/20 border-muted hover:bg-muted/30"
              )}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-foreground text-sm">
                    {item.subjectName}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {item.cycleLabel}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold px-2 py-0 uppercase",
                      isCritical
                        ? "bg-rose-600 text-white"
                        : isHigh
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-blue-100 text-blue-900 border-blue-300"
                    )}
                  >
                    {isCritical ? "Nível Crítico" : isHigh ? "Atenção Alta" : "Moderado"}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-[11px]">
                  <span>{item.classesCount} turmas</span>
                  <span>•</span>
                  <span>{item.totalEvaluatedStudents} alunos avaliados</span>
                  <span>•</span>
                  <span>{item.assignedTeachersCount} professores</span>
                  <span>•</span>
                  <span className="font-medium text-foreground">
                    Média da Disciplina: <strong>{item.averageGrade.toFixed(1)} val.</strong>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-background/80 border text-[11px] text-foreground mt-1">
                  <span className="font-semibold text-primary">Intervenção Recomendada: </span>
                  <span className="text-muted-foreground">{item.recommendedIntervention}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                <div className="text-left sm:text-right">
                  <span className="text-xl font-bold text-rose-600 block">
                    {item.failureRatePercent}%
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    {item.failingStudentsCount} alunos com nota &lt; 10
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
