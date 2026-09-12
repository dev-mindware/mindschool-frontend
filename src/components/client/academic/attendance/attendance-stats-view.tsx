"use client";

import React, { useMemo } from "react";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { StudentAttendanceStats } from "@/types";
import { Badge, Icon, Button } from "@/components";

interface AttendanceStatsViewProps {
  classId: string;
  className: string;
}

export function AttendanceStatsView({ classId, className }: AttendanceStatsViewProps) {
  const { getStudentStats } = useStudentAttendanceStore();
  const stats = useMemo(() => getStudentStats(classId), [getStudentStats, classId]);

  // Calculations
  const averageAttendance = useMemo(() => {
    if (!stats.length) return 100;
    const sum = stats.reduce((acc, s) => acc + s.attendanceRate, 0);
    return Math.round(sum / stats.length);
  }, [stats]);

  const atRiskCount = useMemo(() => {
    return stats.filter((s) => s.medLimitRisk === "AT_RISK" || s.medLimitRisk === "DISQUALIFIED").length;
  }, [stats]);

  const totalUnjustifiedAbsences = useMemo(() => {
    return stats.reduce((acc, s) => acc + s.unjustifiedCount, 0);
  }, [stats]);

  const getRiskBadge = (risk: StudentAttendanceStats["medLimitRisk"]) => {
    switch (risk) {
      case "DISQUALIFIED":
        return (
          <Badge variant="destructive" className="text-[10px] font-semibold gap-1">
            <Icon name={"OctagonAlert" as any} className="size-3" />
            Perda de Frequência (≥25%)
          </Badge>
        );
      case "AT_RISK":
        return (
          <Badge className="bg-amber-600 text-white text-[10px] font-semibold gap-1">
            <Icon name={"TriangleAlert" as any} className="size-3" />
            Risco Crítico (20-24%)
          </Badge>
        );
      case "WARNING":
        return (
          <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 text-[10px]">
            Atenção (12-19%)
          </Badge>
        );
      case "NORMAL":
      default:
        return (
          <Badge variant="outline" className="border-emerald-400 text-emerald-600 bg-emerald-50 text-[10px]">
            Regular
          </Badge>
        );
    }
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with MED Regulation Notice */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <Icon name={"Scale" as any} className="size-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Regulamento de Faltas do Ministério da Educação (MED)
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              O estudante perde o direito à frequência e à prestação de provas finais se totalizar faltas injustificadas iguais ou superiores a <strong>25%</strong> do total de tempos curriculares leccionados no trimestre/ano.
            </p>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
          <Icon name={"Printer" as any} className="size-3.5" />
          Imprimir Mapa de Faltas
        </Button>
      </div>

      {/* KPI Mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Assiduidade Média da Turma</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">{averageAttendance}%</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{stats.length} alunos matriculados</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Total de Faltas Injustificadas</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{totalUnjustifiedAbsences}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Aulas perdidas sem documento</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Alunos em Alerta de Chumbo</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{atRiskCount} Alunos</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Faltas acima de 20% da carga</div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Quadro Individual de Faltas e Frequência - {className}
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Ano Lectivo 2025/2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-14 px-3 py-3 text-center">Nº</th>
                <th className="min-w-[200px] px-4 py-3">Estudante</th>
                <th className="w-24 px-3 py-3 text-center">Aulas Dadas</th>
                <th className="w-24 px-3 py-3 text-center text-emerald-600">Presenças</th>
                <th className="w-24 px-3 py-3 text-center text-rose-600">F. Injustif.</th>
                <th className="w-24 px-3 py-3 text-center text-blue-600">F. Justif.</th>
                <th className="w-20 px-3 py-3 text-center text-amber-600">Atrasos</th>
                <th className="w-28 px-3 py-3 text-center">Assiduidade</th>
                <th className="min-w-[180px] px-4 py-3 text-center">Situação Regulatória (MED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map((row) => (
                <tr key={row.studentId} className="hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2.5 text-center font-mono font-medium text-muted-foreground">
                    {row.studentNumber}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {row.studentName}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    {row.totalClasses}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-emerald-600 font-medium">
                    {row.presentCount}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-rose-600 font-medium">
                    {row.unjustifiedCount}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-blue-600">
                    {row.justifiedCount}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-amber-600">
                    {row.lateCount}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono font-medium text-foreground">
                        {row.attendanceRate}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {row.unjustifiedAbsenceRate}% faltas
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {getRiskBadge(row.medLimitRisk)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
