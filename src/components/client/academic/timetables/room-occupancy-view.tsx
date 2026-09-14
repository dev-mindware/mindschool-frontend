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
} from "@/components";

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 1, label: "Segunda-feira", short: "Seg" },
  { key: 2, label: "Terça-feira", short: "Ter" },
  { key: 3, label: "Quarta-feira", short: "Qua" },
  { key: 4, label: "Quinta-feira", short: "Qui" },
  { key: 5, label: "Sexta-feira", short: "Sex" },
];

const ROOM_OPTIONS = [
  { id: "room-1", name: "Sala 14 - Bloco B", type: "Teórica", capacity: 45 },
  { id: "room-2", name: "Sala 02", type: "Teórica", capacity: 45 },
  { id: "room-3", name: "Sala 03", type: "Teórica", capacity: 40 },
  { id: "room-inf", name: "Laboratório de Informática", type: "Prática / TI", capacity: 35 },
  { id: "room-lab1", name: "Laboratório de Ciências", type: "Química / Física", capacity: 30 },
  { id: "room-court", name: "Quadra Polidesportiva", type: "Desporto", capacity: 60 },
];

export function RoomOccupancyView() {
  const { entries, morningSlots, afternoonSlots } = useTimetableStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("room-1");

  const selectedRoom = ROOM_OPTIONS.find((r) => r.id === selectedRoomId) || ROOM_OPTIONS[0];

  // All entries allocated to this room
  const roomEntries = useMemo(() => {
    return entries.filter(
      (e) => e.roomName.toLowerCase() === selectedRoom.name.toLowerCase() || e.roomId === selectedRoom.id
    );
  }, [entries, selectedRoom]);

  // Total possible slots in the week
  const totalSlotsPerWeek = (morningSlots.length + afternoonSlots.length) * 5;
  const occupancyPercentage = Math.round((roomEntries.length / Math.max(1, totalSlotsPerWeek)) * 100);

  return (
    <div className="space-y-6">
      {/* Selector & Top Metric Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-semibold text-foreground whitespace-nowrap">
            Espaço / Sala:
          </label>
          <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Escolha um espaço" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_OPTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Room metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            <Icon name={"Users" as any} className="size-3.5 mr-1.5 text-primary" />
            Capacidade: <strong className="ml-1 text-foreground">{selectedRoom.capacity} alunos</strong>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 font-medium">
            <Icon name={"Tag" as any} className="size-3.5 mr-1.5 text-muted-foreground" />
            Tipo: {selectedRoom.type}
          </Badge>
          <Badge
            variant={occupancyPercentage > 75 ? "default" : "secondary"}
            className="px-3 py-1 font-medium"
          >
            <Icon name={"Activity" as any} className="size-3.5 mr-1.5" />
            Ocupação Semanal: {occupancyPercentage}% ({roomEntries.length} tempos)
          </Badge>
        </div>
      </div>

      {/* Quick Overview Cards for all spaces */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROOM_OPTIONS.map((r) => {
          const count = entries.filter(
            (e) => e.roomName.toLowerCase() === r.name.toLowerCase() || e.roomId === r.id
          ).length;
          const isSelected = r.id === selectedRoomId;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRoomId(r.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-card/60 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-foreground truncate">{r.name}</span>
                <span className="text-[10px] text-muted-foreground">{r.capacity}l</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{r.type.split(" ")[0]}</span>
                <span className="font-bold text-foreground">{count}t</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Occupancy Grid */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name={"Building2" as any} className="size-4 text-primary" />
            Ocupação e Horário de Utilização: {selectedRoom.name}
          </h3>
          <span className="text-xs text-muted-foreground">
            Verde = Disponível | Colorido = Em Uso Lectivo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-32 px-4 py-3 text-center">Horário / Tempo</th>
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
                    const entry = roomEntries.find(
                      (e) => e.dayOfWeek === day.key && e.slotNumber === slot.slotNumber && e.shift === "MORNING"
                    );
                    return (
                      <td key={day.key} className="px-2 py-2 border-r border-border last:border-r-0 align-middle">
                        {entry ? (
                          <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/10 space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-xs text-primary">{entry.className}</span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-background">
                                {entry.subjectName.slice(0, 4)}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-foreground font-medium truncate">
                              {entry.subjectName}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {entry.teacherName}
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center rounded border border-dashed border-success-border bg-success-muted text-[11px] text-success font-medium">
                            Disponível
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
                    const entry = roomEntries.find(
                      (e) => e.dayOfWeek === day.key && e.slotNumber === slot.slotNumber && e.shift === "AFTERNOON"
                    );
                    return (
                      <td key={day.key} className="px-2 py-2 border-r border-border last:border-r-0 align-middle">
                        {entry ? (
                          <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/10 space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-xs text-primary">
                                {entry.className}
                              </span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-background">
                                {entry.subjectName.slice(0, 4)}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-foreground font-medium truncate">
                              {entry.subjectName}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {entry.teacherName}
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center rounded border border-dashed border-success-border bg-success-muted text-[11px] text-success font-medium">
                            Disponível
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
