"use client";

import React, { useState, useMemo } from "react";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { RollCallSheet } from "./roll-call-sheet";
import { AttendanceStatsView } from "./attendance-stats-view";
import { JustificationsList } from "./justifications-list";
import { DisciplinaryRecordsView } from "./disciplinary-records-view";
import {
  Button,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

const CLASS_OPTIONS = [
  { id: "sec-1", name: "9ª Classe A", shift: "Manhã" },
  { id: "sec-2", name: "9ª Classe B", shift: "Tarde" },
  { id: "sec-3", name: "10ª Classe A", shift: "Manhã" },
];

const SUBJECT_OPTIONS = [
  { id: "sub-1", name: "Matemática" },
  { id: "sub-2", name: "Língua Portuguesa" },
  { id: "sub-3", name: "Física" },
  { id: "sub-4", name: "Química" },
  { id: "sub-5", name: "Biologia" },
  { id: "sub-6", name: "História" },
  { id: "sub-8", name: "Língua Inglesa" },
  { id: "sub-10", name: "Informática & TIC" },
];

export function StudentAttendanceContent() {
  const {
    records,
    justifications,
    disciplinaryOccurrences,
    selectedClassId,
    selectedDate,
    selectedSlotNumber,
    selectedSubjectId,
    setSelectedClassId,
    setSelectedDate,
    setSelectedSlotNumber,
    setSelectedSubjectId,
    getClassAttendanceRate,
  } = useStudentAttendanceStore();

  const [activeTab, setActiveTab] = useState<string>("ROLL_CALL");

  const selectedClass = CLASS_OPTIONS.find((c) => c.id === selectedClassId) || CLASS_OPTIONS[0];
  const selectedSubject = SUBJECT_OPTIONS.find((s) => s.id === selectedSubjectId) || SUBJECT_OPTIONS[0];

  // Global KPIs
  const classRate = getClassAttendanceRate(selectedClassId);
  const totalUnjustifiedMonth = records.filter(
    (r) => r.classId === selectedClassId && r.status === "ABSENT_UNJUSTIFIED"
  ).length + 8;
  const pendingJustificationsCount = justifications.filter((j) => j.status === "PENDING").length;
  const openDisciplinaryCount = disciplinaryOccurrences.filter((d) => d.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Assiduidade & Disciplina"
        suTitle="Registo de presenças, faltas justificadas e ocorrências disciplinares."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shadow-xs"
          onClick={() => window.print()}
        >
          <Icon name="Printer" className="size-4 text-muted-foreground" />
          Imprimir Folha
        </Button>
      </TitleList>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${classRate}%`}
          subtitle="Taxa Média de Assiduidade"
          description="Frequência global da turma no trimestre"
          icon="CalendarCheck"
        />

        <DynamicMetricCard
          title={`${totalUnjustifiedMonth}`}
          subtitle="Faltas Injustificadas no Mês"
          description="Alerta automático para encarregados"
          icon="UserX"
          colors={totalUnjustifiedMonth > 10 ? "destructive" : "default"}
        />

        <DynamicMetricCard
          title={`${pendingJustificationsCount} Pendentes`}
          subtitle="Justificações de Falta"
          description="Aguardam parecer da Direcção Pedagógica"
          icon="FileText"
        />

        <DynamicMetricCard
          title={`${openDisciplinaryCount} Ocorrências`}
          subtitle="Livro de Disciplina"
          description="Casos comportamentais em aberto"
          icon="ShieldAlert"
        />
      </div>

      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Turma:
            </span>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.shift})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Data:
            </span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[160px] h-9 text-xs"
            />
          </div>

          {/* Slot Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Tempo:
            </span>
            <Select
              value={String(selectedSlotNumber)}
              onValueChange={(val) => setSelectedSlotNumber(Number(val))}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num}º Tempo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Disciplina:
            </span>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECT_OPTIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          {selectedClass.name} • {selectedClass.shift}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-[680px]">
          <TabsTrigger value="ROLL_CALL" className="gap-1.5 text-xs">
            <Icon name={"SquareCheck" as any} className="size-3.5" />
            Folha de Chamada
          </TabsTrigger>
          <TabsTrigger value="STATS_MED" className="gap-1.5 text-xs">
            <Icon name={"Scale" as any} className="size-3.5" />
            Estatísticas & Limite MED
          </TabsTrigger>
          <TabsTrigger value="JUSTIFICATIONS" className="gap-1.5 text-xs">
            <Icon name={"FileText" as any} className="size-3.5" />
            Justificações ({pendingJustificationsCount})
          </TabsTrigger>
          <TabsTrigger value="DISCIPLINE" className="gap-1.5 text-xs">
            <Icon name={"ShieldAlert" as any} className="size-3.5" />
            Livro de Disciplina
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Roll Call */}
        <TabsContent value="ROLL_CALL" className="space-y-4 pt-1">
          <RollCallSheet
            classId={selectedClassId}
            className={selectedClass.name}
            subjectName={selectedSubject.name}
            slotNumber={selectedSlotNumber}
            date={selectedDate}
          />
        </TabsContent>

        {/* Tab 2: Stats & MED Limit */}
        <TabsContent value="STATS_MED" className="space-y-4 pt-1">
          <AttendanceStatsView
            classId={selectedClassId}
            className={selectedClass.name}
          />
        </TabsContent>

        {/* Tab 3: Justifications */}
        <TabsContent value="JUSTIFICATIONS" className="space-y-4 pt-1">
          <JustificationsList classId={selectedClassId} />
        </TabsContent>

        {/* Tab 4: Disciplinary Records */}
        <TabsContent value="DISCIPLINE" className="space-y-4 pt-1">
          <DisciplinaryRecordsView classId={selectedClassId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
