"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useExtracurricularStore } from "@/stores/school/extracurricular-store";
import { toast } from "sonner";

interface ActivityEnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedActivityId?: string;
}

const SAMPLE_STUDENTS = [
  { id: "stu-01", number: "MS-2026-0042", name: "Nzuzi Maria Afonso", class: "10ª Classe", section: "Turma 10A", guardian: "Ana Paula Afonso", phone: "+244 923 456 789" },
  { id: "stu-02", number: "MS-2026-0089", name: "Mauro António Gaspar", class: "11ª Classe", section: "Turma 11B", guardian: "António Gaspar", phone: "+244 931 112 233" },
  { id: "stu-03", number: "MS-2026-0105", name: "Esperança Domingos", class: "8ª Classe", section: "Turma 8A", guardian: "Teresa Manuel Domingos", phone: "+244 945 889 900" },
  { id: "stu-04", number: "MS-2026-0120", name: "Joaquim Bernardo Silva", class: "7ª Classe", section: "Turma 7C", guardian: "Helena Silva", phone: "+244 912 345 678" },
  { id: "stu-05", number: "MS-2026-0013", name: "Ana Beatriz Domingos", class: "9ª Classe", section: "Turma 9A", guardian: "Manuel Domingos", phone: "+244 922 778 899" },
  { id: "stu-06", number: "MS-2026-0025", name: "Carlos Daniel Kiala", class: "9ª Classe", section: "Turma 9A", guardian: "Sousa Kiala", phone: "+244 933 445 566" },
];

export function ActivityEnrollmentModal({
  open,
  onOpenChange,
  preselectedActivityId,
}: ActivityEnrollmentModalProps) {
  const { activities, enrollments, enrollStudent } = useExtracurricularStore();

  const [activityId, setActivityId] = useState(
    preselectedActivityId || activities[0]?.id || ""
  );
  const [studentId, setStudentId] = useState(SAMPLE_STUDENTS[4].id);
  const [notes, setNotes] = useState("");

  const selectedActivity = activities.find((a) => a.id === activityId) || activities[0];
  const selectedStudent = SAMPLE_STUDENTS.find((s) => s.id === studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivity || !selectedStudent) {
      toast.error("Seleccione a actividade e o estudante");
      return;
    }

    // Check if already enrolled in this activity
    const isEnrolled = enrollments.some(
      (e) => e.activityId === selectedActivity.id && e.studentId === selectedStudent.id && e.status === "ACTIVE"
    );
    if (isEnrolled) {
      toast.error("O aluno já está inscrito nesta actividade.");
      return;
    }

    // Check capacity
    if (selectedActivity.enrolledCount >= selectedActivity.maxCapacity) {
      toast.error("Esta actividade já atingiu a capacidade máxima de vagas.");
      return;
    }

    enrollStudent({
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      studentId: selectedStudent.id,
      studentNumber: selectedStudent.number,
      studentName: selectedStudent.name,
      classLevel: selectedStudent.class,
      sectionName: selectedStudent.section,
      guardianName: selectedStudent.guardian,
      guardianPhone: selectedStudent.phone,
      notes: notes || undefined,
    });

    toast.success(`${selectedStudent.name} inscrito em ${selectedActivity.name}!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="Sparkles" className="size-5 text-amber-500" />
            Inscrição em Clube / Actividade Extracurricular
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Clube ou Modalidade *</label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activities.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.enrolledCount}/{a.maxCapacity} vagas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Estudante *</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_STUDENTS.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} — {st.class} ({st.number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedActivity && (
            <div className="p-3 bg-muted/20 rounded border space-y-1 text-[11px]">
              <div><strong>Instrutor:</strong> {selectedActivity.instructorName}</div>
              <div><strong>Horário:</strong> {selectedActivity.scheduleDays} ({selectedActivity.scheduleTime})</div>
              <div><strong>Local:</strong> {selectedActivity.location}</div>
              <div><strong>Público-Alvo:</strong> {selectedActivity.targetGrades}</div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-medium text-foreground">Observações / Motivo da Inscrição</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Interesse em competir no torneio interescolar"
              className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Confirmar Inscrição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
