"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { DropoutRiskAlertItem } from "@/types";
import { cn } from "@/lib/utils";

interface DropoutRiskAlertsWidgetProps {
  alerts?: DropoutRiskAlertItem[];
}

export function DropoutRiskAlertsWidget({ alerts = [] }: DropoutRiskAlertsWidgetProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name={"TriangleAlert" as any} className="w-5 h-5 text-rose-600" />
            Alertas de Risco de Abandono Escolar
          </CardTitle>
          <Link href="/dropout-risk">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/90">
              Ver Todos ({alerts.length}) <Icon name="ArrowRight" className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {alerts.map((item) => {
          const isCritical = item.riskLevel === "CRITICAL";
          const isHigh = item.riskLevel === "HIGH";

          return (
            <div
              key={item.id}
              className={cn(
                "p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors",
                isCritical
                  ? "bg-rose-500/5 border-rose-500/25 hover:bg-rose-500/10"
                  : isHigh
                  ? "bg-amber-500/5 border-amber-500/25 hover:bg-amber-500/10"
                  : "bg-muted/40 border-muted"
              )}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate text-sm">
                    {item.studentName}
                  </span>
                  <Badge
                    variant={isCritical ? "destructive" : "secondary"}
                    className={cn(
                      "text-[10px] px-1.5 py-0 font-bold uppercase",
                      isCritical
                        ? "bg-rose-600 text-white"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {isCritical ? "Crítico" : "Alto Risco"} ({item.riskScore}%)
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-[11px]">
                  <span>Nº: {item.studentNumber}</span>
                  <span>•</span>
                  <span>{item.className}</span>
                  <span>•</span>
                  <span className="text-rose-600 font-medium">
                    {item.unjustifiedAbsences} faltas não justificadas
                  </span>
                  <span>•</span>
                  <span>{item.failingSubjectsCount} notas &lt; 10</span>
                </div>
                <p className="text-[11px] font-medium text-foreground pt-0.5">
                  Ação: <span className="text-muted-foreground">{item.recommendedAction}</span>
                </p>
              </div>

              <Link href="/dropout-risk" className="shrink-0">
                <Button size="sm" variant="outline" className="h-8 text-xs font-medium w-full sm:w-auto">
                  Intervir
                </Button>
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
