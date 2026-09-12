"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Icon } from "@/components";
import { CyclePerformanceData } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AcademicCyclePerformanceChartProps {
  data?: CyclePerformanceData[];
  title?: string;
  subtitle?: string;
}

export function AcademicCyclePerformanceChart({
  data = [],
  title = "Aproveitamento por Ciclo de Ensino",
  subtitle = "Distribuição de transição e retenção segundo o Decreto Presidencial 424/25",
}: AcademicCyclePerformanceChartProps) {
  const chartData = data.map((item) => ({
    name: item.label.split("(")[0].trim(),
    cycle: item.cycle,
    Aprovados: item.approvedCount,
    Recurso: item.appealCount,
    Retidos: item.failedCount,
    rate: item.approvalRate,
    total: item.totalStudents,
  }));

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="GraduationCap" className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-medium border-primary/30 text-primary">
              Decreto 424/25
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                className="text-[11px] text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-[11px] text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const current = chartData.find((c) => c.name === label);
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-md text-xs space-y-1.5">
                        <p className="font-semibold text-foreground">{label}</p>
                        <p className="text-muted-foreground">
                          Total de Alunos: <span className="font-medium text-foreground">{current?.total}</span>
                        </p>
                        <div className="pt-1 border-t space-y-1">
                          <p className="text-emerald-600 font-medium">
                            Aprovados Diretos: {payload[0]?.value}
                          </p>
                          <p className="text-amber-600 font-medium">
                            Em Prova de Recurso: {payload[1]?.value}
                          </p>
                          <p className="text-rose-600 font-medium">
                            Não Transitam (Retidos): {payload[2]?.value}
                          </p>
                        </div>
                        <p className="pt-1 text-[11px] font-bold text-primary">
                          Taxa de Transição: {current?.rate}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Bar dataKey="Aprovados" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="Recurso" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="Retidos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mini Cycle Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t">
          {data.map((c) => (
            <div
              key={c.cycle}
              className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-xs"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-foreground truncate block">
                  {c.cycle === "PRIMARY"
                    ? "Primário"
                    : c.cycle === "CYCLE_1"
                    ? "I Ciclo"
                    : "II Ciclo"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {c.totalStudents} alunos
                </span>
              </div>
              <Badge
                variant="secondary"
                className="font-bold text-emerald-700 bg-emerald-50 shrink-0"
              >
                {c.approvalRate}% transição
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
