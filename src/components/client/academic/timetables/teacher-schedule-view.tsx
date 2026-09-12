"use client";

import React, { useState, useMemo } from "react";
import { useTimetableStore } from "@/stores/school/timetable-store";
import { DayOfWeek, TimeSlotDefinition } from "@/types";
import {
  Badge,
  Icon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components";

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 1, label: "Segunda-feira", short: "Seg" },
  { key: 2, label: "Terça-feira", short: "Ter" },
  { key: 3, label: "Quarta-feira", short: "Qua" },
  { key: 4, label: "Quinta-feira", short: "Qui" },
  { key: 5, label: "Sexta-feira", short: "Sex" },
];

export function TeacherScheduleView() {
  const { entries, morningSlots, afternoonSlots, getTeacherWeeklyLoad } = useTimetableStore();

  // Extract unique teachers from entries or default pool
  const teachers = useMemo(() => {
    const map = new Map<string, string>();
    map.set("tea-1", "Prof. Manuel dos Santos");
    map.set("tea-2", "Profª. Teresa Silva");
    map.set("tea-3", "Prof. Alberto Silva");
    map.set("tea-4", "Profª. Maria Afonso");
    map.set("tea-5", "Prof. Domingos Kiala");
    map.set("tea-6", "Profª. Ana Gaspar");
    map.set("tea-7", "Prof. Lucas Varela");
    map.set("tea-8", "Prof. John Doe");
    map.set("tea-9", "Prof. Paulo Cassoma");
    map.set("tea-10", "Prof. Carlos Kiala");

    entries.forEach((e) => {
      map.set(e.teacherId, e.teacherName);
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || "tea-1"
  );

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const teacherEntries = entries.filter((e) => e.teacherId === selectedTeacherId);
  const weeklyLoad = getTeacherWeeklyLoad(selectedTeacherId);

  // Unique classes taught by teacher
  const assignedClasses = useMemo(() => {
    const set = new Set<string>();
    teacherEntries.forEach((e) => set.add(e.className));
    return Array.from(set);
  }, [teacherEntries]);

  // Unique subjects taught
  const assignedSubjects = useMemo(() => {
    const set = new Set<string>();
    teacherEntries.forEach((e) => set.add(e.subjectName));
    return Array.from(set);
  }, [teacherEntries]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-semibold text-foreground whitespace-nowrap">
            Seleccionar Docente:
          </label>
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Escolha um professor" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            <Icon name={"Clock" as any} className="size-3.5 mr-1.5 text-primary" />
            Carga Semanal: <strong className="ml-1 text-foreground">{weeklyLoad.totalSlots} tempos ({weeklyLoad.totalSlots * 45} min)</strong>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 font-medium">
            <Icon name={"Users" as any} className="size-3.5 mr-1.5 text-muted-foreground" />
            {assignedClasses.length} Turmas Atribuídas
          </Badge>
          <Badge variant="outline" className="px-3 py-1 font-medium">
            <Icon name={"BookOpen" as any} className="size-3.5 mr-1.5 text-muted-foreground" />
            {assignedSubjects.length} Disciplinas
          </Badge>
        </div>
      </div>

      {/* Teacher Profile Mini Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/70 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Turmas sob Responsabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((cls) => (
                  <Badge key={cls} variant="secondary" className="text-xs font-normal">
                    {cls}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">Nenhuma turma com tempos alocados</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Disciplinas Leccionadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {assignedSubjects.length > 0 ? (
                assignedSubjects.map((sub) => (
                  <Badge key={sub} variant="outline" className="text-xs font-normal border-primary/30 text-primary">
                    {sub}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">Sem disciplinas registadas</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dias com Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {DAYS.map((d) => {
                const count = teacherEntries.filter((e) => e.dayOfWeek === d.key).length;
                return (
                  <div
                    key={d.key}
                    className={`flex-1 flex flex-col items-center p-1.5 rounded text-center border ${
                      count > 0 ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/30 border-border text-muted-foreground/50"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{d.short}</span>
                    <span className="text-xs font-semibold mt-0.5">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Schedule Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name={"Calendar" as any} className="size-4 text-primary" />
            Grade Horária Individual: {selectedTeacher?.name}
          </h3>
          <span className="text-xs text-muted-foreground">
            Ano Lectivo 2025/2026 • Ministério da Educação (MED)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-32 px-4 py-3 text-center">Tempo / Horário</th>
                {DAYS.map((day) => (
                  <th key={day.key} className="min-w-[170px] px-4 py-3 text-center">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {/* Morning Shift */}
              <tr className="bg-muted/50 font-medium text-xs text-muted-foreground">
                <td colSpan={6} className="px-4 py-1.5 uppercase tracking-wider text-primary">
                  Turno da Manhã (07:30 - 12:45)
                </td>
              </tr>
              {morningSlots.map((slot: TimeSlotDefinition) => (
                <tr key={slot.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-center bg-muted/20 border-r border-border font-medium">
                    <span className="text-xs font-medium text-foreground block">{slot.slotNumber}º Tempo</span>
                    <span className="text-[11px] text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
                  </td>
                  {DAYS.map((day) => {
                    const entry = teacherEntries.find(
                      (e) => e.dayOfWeek === day.key && e.slotNumber === slot.slotNumber && e.shift === "MORNING"
                    );
                    return (
                      <td key={day.key} className="px-2 py-2 border-r border-border last:border-r-0 align-middle">
                        {entry ? (
                          <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/10 space-y-1 shadow-2xs">
                            <div className="font-medium text-xs text-primary line-clamp-1">
                              {entry.subjectName}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="font-medium text-foreground">{entry.className}</span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-background">
                                {entry.roomName}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center text-[11px] text-muted-foreground/40 font-mono">
                            Livre
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Afternoon Shift */}
              <tr className="bg-muted/50 font-medium text-xs text-muted-foreground">
                <td colSpan={6} className="px-4 py-1.5 uppercase tracking-wider text-primary">
                  Turno da Tarde (13:00 - 18:15)
                </td>
              </tr>
              {afternoonSlots.map((slot: TimeSlotDefinition) => (
                <tr key={slot.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-center bg-muted/20 border-r border-border font-medium">
                    <span className="text-xs font-medium text-foreground block">{slot.slotNumber}º Tempo</span>
                    <span className="text-[11px] text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
                  </td>
                  {DAYS.map((day) => {
                    const entry = teacherEntries.find(
                      (e) => e.dayOfWeek === day.key && e.slotNumber === slot.slotNumber && e.shift === "AFTERNOON"
                    );
                    return (
                      <td key={day.key} className="px-2 py-2 border-r border-border last:border-r-0 align-middle">
                        {entry ? (
                          <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1 shadow-2xs">
                            <div className="font-medium text-xs text-emerald-600 dark:text-emerald-400 line-clamp-1">
                              {entry.subjectName}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="font-medium text-foreground">{entry.className}</span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-background">
                                {entry.roomName}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center text-[11px] text-muted-foreground/40 font-mono">
                            Livre
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
