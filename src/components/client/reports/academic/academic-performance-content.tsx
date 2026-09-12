"use client";

import { useState } from "react";
import {
  TitleList,
  Badge,
  Button,
  Icon,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAcademicPerformanceStore } from "@/stores/school";
import { AcademicCycle } from "@/types";
import { CriticalSubjectsRadar } from "./critical-subjects-radar";
import { HonorRollTable } from "./honor-roll-table";
import { HonorDiplomaModal } from "./honor-diploma-modal";
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

export function AcademicPerformanceContent() {
  const {
    classes,
    criticalSubjects,
    honorRoll,
    evolution,
    selectedCycle,
    selectedTrimester,
    selectedStudentForDiploma,
    setSelectedCycle,
    setSelectedTrimester,
    openDiplomaModal,
    closeDiplomaModal,
  } = useAcademicPerformanceStore();

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "CRITICAL_SUBJECTS" | "HONOR_ROLL"
  >("OVERVIEW");

  // Filter classes by cycle
  const filteredClasses = classes.filter((c) => {
    if (selectedCycle !== "ALL" && c.cycle !== selectedCycle) return false;
    return true;
  });

  const chartData = filteredClasses.map((c) => ({
    name: c.className.split("-")[0].trim(),
    Média: c.averageGrade,
    Aprovação: c.passRatePercent,
  }));

  return (
    <div className="space-y-6">
      {/* Header with TitleList */}
      <TitleList
        title="Rendimento Pedagógico & Quadro de Honra"
        suTitle="Análise comparativa de médias, turmas, disciplinas críticas e mérito escolar (Decreto Presidencial 424/25)"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Cycle filter buttons */}
          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs font-medium">
            <button
              onClick={() => setSelectedCycle("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCycle === "ALL"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos os Ciclos
            </button>
            <button
              onClick={() => setSelectedCycle("PRIMARY")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCycle === "PRIMARY"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Primário
            </button>
            <button
              onClick={() => setSelectedCycle("CYCLE_1")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCycle === "CYCLE_1"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I Ciclo
            </button>
            <button
              onClick={() => setSelectedCycle("CYCLE_2")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCycle === "CYCLE_2"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              II Ciclo / Médio
            </button>
          </div>

          {/* Trimester selector */}
          <select
            value={selectedTrimester}
            onChange={(e) => setSelectedTrimester(e.target.value as any)}
            className="h-8 px-2.5 py-0 text-xs rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            aria-label="Selecionar Trimestre para Análise de Rendimento"
          >
            <option value="1_TRIMESTRE">1º Trimestre</option>
            <option value="2_TRIMESTRE">2º Trimestre</option>
            <option value="3_TRIMESTRE">3º Trimestre</option>
            <option value="ANNUAL">Ano Lectivo Completo</option>
          </select>
        </div>
      </TitleList>

      {/* 4 Pedagogical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title="13.8"
          subtitle="Média Global da Escola"
          description="Escala 0 a 20 (Decreto 424/25)"
          icon="Award"
          trend={{ percent: 2.4, higherIsBetter: true }}
        />
        <DynamicMetricCard
          title="10ª Classe A"
          subtitle="Melhor Aproveitamento"
          description="Média 15.6 • 89.5% aprovação"
          icon="TrendingUp"
          trend={{ percent: 4.1, higherIsBetter: true }}
        />
        <DynamicMetricCard
          title="Matemática"
          subtitle="Disciplina Crítica"
          description="24.4% de notas negativas (< 10)"
          icon={"TriangleAlert" as any}
          colors="destructive"
          trend={{ percent: -3.2, higherIsBetter: false }}
        />
        <DynamicMetricCard
          title="42 Alunos"
          subtitle="Quadro de Honra"
          description="Média ≥ 16.0 valores no trimestre"
          icon="Star"
          trend={{ percent: 14.3, higherIsBetter: true }}
        />
      </div>

      {/* Tabs bar */}
      <div className="border-b flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "OVERVIEW"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name={"ChartColumn" as any} className="w-4 h-4" />
          Aproveitamento por Turmas ({filteredClasses.length})
        </button>

        <button
          onClick={() => setActiveTab("CRITICAL_SUBJECTS")}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "CRITICAL_SUBJECTS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name={"TriangleAlert" as any} className="w-4 h-4" />
          Disciplinas Críticas ({criticalSubjects.length})
        </button>

        <button
          onClick={() => setActiveTab("HONOR_ROLL")}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "HONOR_ROLL"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon name="Award" className="w-4 h-4" />
          Quadro de Honra & Diplomas ({honorRoll.length})
        </button>
      </div>

      {/* Tab Content 1: Overview & Classes */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Chart of average grades across classes */}
          <Card className="border shadow-none bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name={"ChartBar" as any} className="w-5 h-5 text-primary" />
                Comparativo de Médias & Taxa de Transição por Turma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="Média" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="Aprovação" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Classes Performance Table */}
          <Card className="border shadow-none bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name="GraduationCap" className="w-5 h-5 text-primary" />
                Tabela de Aproveitamento e Rendimento das Turmas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase border-b bg-muted/30">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Turma</th>
                      <th className="py-2.5 px-3 font-medium">Ciclo</th>
                      <th className="py-2.5 px-3 font-medium">Diretor de Turma</th>
                      <th className="py-2.5 px-3 font-medium text-center">Nº Alunos</th>
                      <th className="py-2.5 px-3 font-medium text-center">Média Geral</th>
                      <th className="py-2.5 px-3 font-medium text-center">Aprovados</th>
                      <th className="py-2.5 px-3 font-medium text-center">Recurso</th>
                      <th className="py-2.5 px-3 font-medium text-center">Retidos</th>
                      <th className="py-2.5 px-3 font-medium text-right">Taxa Transição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredClasses.map((cls) => (
                      <tr key={cls.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {cls.className}
                          <span className="text-[10px] text-muted-foreground block font-normal">
                            {cls.roomName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {cls.cycleLabel}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {cls.classDirectorName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium text-foreground">
                          {cls.totalStudents}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-medium px-2 py-0.5 rounded bg-muted">
                            {cls.averageGrade.toFixed(1)} val.
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-medium">
                          {cls.approvedCount}
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-600 font-medium">
                          {cls.appealCount}
                        </td>
                        <td className="py-2.5 px-3 text-center text-rose-600 font-medium">
                          {cls.failedCount}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Badge
                            className={`font-medium text-xs ${
                              cls.passRatePercent >= 85
                                ? "bg-emerald-100 text-emerald-800"
                                : cls.passRatePercent >= 75
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {cls.passRatePercent}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content 2: Critical Subjects Radar */}
      {activeTab === "CRITICAL_SUBJECTS" && (
        <CriticalSubjectsRadar subjects={criticalSubjects} />
      )}

      {/* Tab Content 3: Honor Roll Table */}
      {activeTab === "HONOR_ROLL" && (
        <HonorRollTable
          students={honorRoll}
          onSelectStudent={openDiplomaModal}
        />
      )}

      {/* Honor Diploma Modal for Printing */}
      <HonorDiplomaModal
        student={selectedStudentForDiploma}
        isOpen={selectedStudentForDiploma !== null}
        onClose={closeDiplomaModal}
      />
    </div>
  );
}
