"use client";

import React, { useState, useMemo } from "react";
import { useTimetableStore } from "@/stores/school/timetable-store";
import { TimetableGrid } from "./timetable-grid";
import { TeacherScheduleView } from "./teacher-schedule-view";
import { RoomOccupancyView } from "./room-occupancy-view";
import { TimetablePrintModal } from "./timetable-print-modal";
import {
  Button,
  Icon,
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
import { Shift, TimeSlotDefinition } from "@/types";

interface ClassOption {
  id: string;
  name: string;
  shift: Shift;
  room: string;
}

const CLASS_OPTIONS: ClassOption[] = [
  { id: "sec-1", name: "9ª Classe A", shift: "MORNING", room: "Sala 14 - Bloco B" },
  { id: "sec-2", name: "9ª Classe B", shift: "AFTERNOON", room: "Sala 15 - Bloco B" },
  { id: "sec-3", name: "10ª Classe A (Ciências Físicas)", shift: "MORNING", room: "Sala 01 - Bloco A" },
  { id: "sec-4", name: "12ª Classe TI (Técnico de Informática)", shift: "MORNING", room: "Laboratório de Informática" },
];

export function TimetablesPageContent() {
  const { entries, morningSlots, afternoonSlots } = useTimetableStore();
  const [selectedClassId, setSelectedClassId] = useState<string>("sec-1");
  const [activeTab, setActiveTab] = useState<string>("CLASS_GRID");
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const selectedClass = CLASS_OPTIONS.find((c) => c.id === selectedClassId) || CLASS_OPTIONS[0];

  // Calculations for current class
  const classEntries = useMemo(() => {
    return entries.filter((e) => e.classId === selectedClass.id);
  }, [entries, selectedClass.id]);

  const slotsForShift: TimeSlotDefinition[] =
    selectedClass.shift === "MORNING" ? morningSlots : afternoonSlots;
  const totalPossibleSlots = slotsForShift.length * 5;
  const coveragePercent = Math.round((classEntries.length / Math.max(1, totalPossibleSlots)) * 100);

  // Unique teachers for this class
  const uniqueTeachersCount = useMemo(() => {
    const set = new Set<string>();
    classEntries.forEach((e) => set.add(e.teacherId));
    return set.size;
  }, [classEntries]);

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Horários Escolares"
        suTitle="Grelha semanal de aulas, prevenção de choques e alocação de salas."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shadow-xs"
          onClick={() => setPrintModalOpen(true)}
        >
          <Icon name="Printer" className="size-4 text-muted-foreground" />
          Imprimir Horário A4
        </Button>
      </TitleList>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${classEntries.length} / ${totalPossibleSlots}`}
          subtitle="Tempos Alocados na Turma"
          description={`${coveragePercent}% da grade curricular preenchida`}
          icon="Calendar"
        />

        <DynamicMetricCard
          title={`${uniqueTeachersCount} Professores`}
          subtitle="Docentes Atribuídos"
          description="A leccionar nesta turma"
          icon="UserCheck"
        />

        <DynamicMetricCard
          title={selectedClass.shift === "MORNING" ? "Manhã" : "Tarde"}
          subtitle="Turno & Regime"
          description={selectedClass.shift === "MORNING" ? "07:30 às 12:45 (6 tempos)" : "13:00 às 18:15 (6 tempos)"}
          icon="Clock"
        />

        <DynamicMetricCard
          title="0 Detectados"
          subtitle="Conflitos / Choques"
          description="Validação de docentes e salas activa"
          icon="ShieldCheck"
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-[480px]">
            <TabsTrigger value="CLASS_GRID" className="gap-1.5 text-xs">
              <Icon name={"LayoutGrid" as any} className="size-3.5" />
              Grade por Turma
            </TabsTrigger>
            <TabsTrigger value="TEACHER_SCHEDULE" className="gap-1.5 text-xs">
              <Icon name={"GraduationCap" as any} className="size-3.5" />
              Por Docente
            </TabsTrigger>
            <TabsTrigger value="ROOM_OCCUPANCY" className="gap-1.5 text-xs">
              <Icon name={"Building2" as any} className="size-3.5" />
              Ocupação de Salas
            </TabsTrigger>
          </TabsList>

          {/* Quick Filter: Turma (Active when CLASS_GRID is open) */}
          {activeTab === "CLASS_GRID" && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Turma Activa:
              </span>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-[280px] h-9">
                  <SelectValue placeholder="Seleccionar turma" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.shift === "MORNING" ? "Manhã" : "Tarde"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tab 1: Weekly Grid by Class */}
        <TabsContent value="CLASS_GRID" className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{selectedClass.name}</span>
              <span>•</span>
              <span>Sala Padrão: <strong>{selectedClass.room}</strong></span>
              <span>•</span>
              <span>Ano Lectivo: <strong>2025/2026</strong></span>
            </div>
            <div className="text-xs text-primary font-medium">
              Turno: {selectedClass.shift === "MORNING" ? "Manhã (07:30 - 12:45)" : "Tarde (13:00 - 18:15)"}
            </div>
          </div>

          <TimetableGrid
            classId={selectedClass.id}
            className={selectedClass.name}
            shift={selectedClass.shift}
          />
        </TabsContent>

        {/* Tab 2: Teacher Weekly Schedule */}
        <TabsContent value="TEACHER_SCHEDULE" className="space-y-4 pt-2">
          <TeacherScheduleView />
        </TabsContent>

        {/* Tab 3: Room Occupancy & Capacity */}
        <TabsContent value="ROOM_OCCUPANCY" className="space-y-4 pt-2">
          <RoomOccupancyView />
        </TabsContent>
      </Tabs>

      {/* Print Modal */}
      <TimetablePrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        classId={selectedClass.id}
        className={selectedClass.name}
        shift={selectedClass.shift}
      />
    </div>
  );
}
