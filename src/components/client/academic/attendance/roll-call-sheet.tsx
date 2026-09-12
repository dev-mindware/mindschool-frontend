"use client";

import React, { useState } from "react";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { AttendanceStatus } from "@/types";
import { Button, Badge, Icon, Input } from "@/components";
import { toast } from "sonner";

interface RollCallSheetProps {
  classId: string;
  className: string;
  subjectName: string;
  slotNumber: number;
  date: string;
}

export function RollCallSheet({
  classId,
  className,
  subjectName,
  slotNumber,
  date,
}: RollCallSheetProps) {
  const {
    students,
    records,
    markAttendance,
    markAllPresent,
  } = useStudentAttendanceStore();

  const [notesInput, setNotesInput] = useState<{ [studentId: string]: string }>({});

  const classStudents = students.filter((s) => s.classId === classId);

  // Get records for this specific class, date, and slot
  const currentSessionRecords = records.filter(
    (r) => r.classId === classId && r.date === date && r.slotNumber === slotNumber
  );

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const rec = currentSessionRecords.find((r) => r.studentId === studentId);
    return rec?.status || "PRESENT"; // Default to present if not marked
  };

  const getStudentNotes = (studentId: string): string => {
    if (notesInput[studentId] !== undefined) return notesInput[studentId];
    const rec = currentSessionRecords.find((r) => r.studentId === studentId);
    return rec?.notes || "";
  };

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    const note = notesInput[studentId];
    markAttendance(studentId, newStatus, note);
  };

  const handleNotesChange = (studentId: string, val: string) => {
    setNotesInput((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleNotesBlur = (studentId: string) => {
    const currentStatus = getStudentStatus(studentId);
    const note = notesInput[studentId];
    markAttendance(studentId, currentStatus, note);
  };

  const handleMarkAllPresent = () => {
    markAllPresent(
      classId,
      "sub-1",
      subjectName,
      date,
      slotNumber,
      "Docente em Serviço"
    );
    toast.success("Todos os alunos foram marcados como Presentes!");
  };

  // Counts for summary footer
  const presentCount = classStudents.filter((s) => getStudentStatus(s.id) === "PRESENT").length;
  const unjustifiedCount = classStudents.filter((s) => getStudentStatus(s.id) === "ABSENT_UNJUSTIFIED").length;
  const justifiedCount = classStudents.filter((s) => getStudentStatus(s.id) === "ABSENT_JUSTIFIED").length;
  const lateCount = classStudents.filter((s) => getStudentStatus(s.id) === "LATE").length;

  return (
    <div className="space-y-4">
      {/* Session Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Icon name={"CalendarCheck" as any} className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {className} • {subjectName}
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                {slotNumber}º Tempo Lectivo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Data da Aula: <strong>{new Date(date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
            onClick={handleMarkAllPresent}
          >
            <Icon name={"CheckCheck" as any} className="size-3.5" />
            Marcar Todos Presentes
          </Button>
        </div>
      </div>

      {/* Roll Call Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-16 px-4 py-3 text-center">Nº</th>
                <th className="min-w-[220px] px-4 py-3">Estudante</th>
                <th className="w-24 px-4 py-3 text-center">Gênero</th>
                <th className="min-w-[280px] px-4 py-3 text-center">Marcação de Assiduidade</th>
                <th className="min-w-[220px] px-4 py-3">Observações / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {classStudents.map((student) => {
                const currentStatus = getStudentStatus(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-muted/10 transition-colors ${
                      currentStatus === "ABSENT_UNJUSTIFIED"
                        ? "bg-rose-500/5"
                        : currentStatus === "ABSENT_JUSTIFIED"
                        ? "bg-blue-500/5"
                        : currentStatus === "LATE"
                        ? "bg-amber-500/5"
                        : ""
                    }`}
                  >
                    {/* Student number */}
                    <td className="px-4 py-3 text-center font-mono text-xs font-medium text-muted-foreground">
                      {student.number}
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                          {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs leading-snug">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            ID: {student.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-[10px] font-normal px-2 py-0">
                        {student.gender === "M" ? "Masc" : "Fem"}
                      </Badge>
                    </td>

                    {/* Quick Status Buttons */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "PRESENT")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 border ${
                            currentStatus === "PRESENT"
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-500"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-emerald-500/10 hover:text-emerald-700"
                          }`}
                          title="Presente"
                        >
                          <Icon name={"Check" as any} className="size-3" />
                          <span>P</span>
                        </button>

                        {/* Unjustified Absence */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "ABSENT_UNJUSTIFIED")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 border ${
                            currentStatus === "ABSENT_UNJUSTIFIED"
                              ? "bg-rose-600 text-white border-rose-700 shadow-xs ring-1 ring-rose-500"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-rose-500/10 hover:text-rose-700"
                          }`}
                          title="Falta Injustificada"
                        >
                          <Icon name={"X" as any} className="size-3" />
                          <span>FI</span>
                        </button>

                        {/* Justified Absence */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "ABSENT_JUSTIFIED")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 border ${
                            currentStatus === "ABSENT_JUSTIFIED"
                              ? "bg-blue-600 text-white border-blue-700 shadow-xs ring-1 ring-blue-500"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-blue-500/10 hover:text-blue-700"
                          }`}
                          title="Falta Justificada (Atestado)"
                        >
                          <Icon name={"FileText" as any} className="size-3" />
                          <span>FJ</span>
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "LATE")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 border ${
                            currentStatus === "LATE"
                              ? "bg-amber-600 text-white border-amber-700 shadow-xs ring-1 ring-amber-500"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-700"
                          }`}
                          title="Atraso"
                        >
                          <Icon name={"Clock" as any} className="size-3" />
                          <span>A</span>
                        </button>
                      </div>
                    </td>

                    {/* Notes / Observation */}
                    <td className="px-4 py-3">
                      <Input
                        value={getStudentNotes(student.id)}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        onBlur={() => handleNotesBlur(student.id)}
                        placeholder="Adicionar nota..."
                        className="h-8 text-xs bg-background/50 focus:bg-background"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Real-time Summary Footer */}
        <div className="flex flex-wrap items-center justify-between p-3.5 bg-muted/20 border-t border-border text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-emerald-500" />
              Presentes: <strong className="text-foreground">{presentCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-rose-500" />
              Faltas Injustificadas: <strong className="text-rose-600">{unjustifiedCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-blue-500" />
              Faltas Justificadas: <strong className="text-blue-600">{justifiedCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-amber-500" />
              Atrasos: <strong className="text-amber-600">{lateCount}</strong>
            </span>
          </div>

          <div className="text-muted-foreground italic text-[11px]">
            As alterações são gravadas instantaneamente na base lectiva.
          </div>
        </div>
      </div>
    </div>
  );
}
