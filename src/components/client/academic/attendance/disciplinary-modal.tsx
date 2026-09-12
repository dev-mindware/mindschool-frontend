"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { DisciplinarySeverity } from "@/types";
import { toast } from "sonner";

interface DisciplinaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
}

export function DisciplinaryModal({
  open,
  onOpenChange,
  classId,
}: DisciplinaryModalProps) {
  const { students, addDisciplinaryOccurrence } = useStudentAttendanceStore();
  const classStudents = students.filter((s) => s.classId === classId);

  const [studentId, setStudentId] = useState<string>(classStudents[0]?.id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [severity, setSeverity] = useState<DisciplinarySeverity>("MEDIUM");
  const [category, setCategory] = useState<any>("DISRUPTIVE_BEHAVIOR");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [reportedBy, setReportedBy] = useState<string>("Docente em Serviço");
  const [actionTaken, setActionTaken] = useState<string>("");
  const [parentNotified, setParentNotified] = useState<boolean>(true);

  const selectedStudent = students.find((s) => s.id === studentId) || classStudents[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Seleccione o estudante.");
      return;
    }
    if (!title || !description) {
      toast.error("Preencha o título e a descrição da ocorrência.");
      return;
    }

    addDisciplinaryOccurrence({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      date,
      severity,
      category,
      title,
      description,
      reportedBy,
      actionTaken: actionTaken || "Advertência e registo no processo individual.",
      parentNotified,
    });

    toast.success("Ocorrência disciplinar registada no Livro de Ponto!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name={"ShieldAlert" as any} className="size-4 text-amber-500" />
            Lavrar Ocorrência Disciplinar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Student selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Estudante Envolvido:
            </label>
            <Select value={studentId || classStudents[0]?.id} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {classStudents.map((std) => (
                  <SelectItem key={std.id} value={std.id}>
                    {std.number} - {std.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Data do Facto:
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nível de Gravidade:
              </label>
              <Select
                value={severity}
                onValueChange={(val: any) => setSeverity(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Leve (Advertência Verbal)</SelectItem>
                  <SelectItem value="MEDIUM">Média (Repreensão Registada)</SelectItem>
                  <SelectItem value="HIGH">Grave (Suspensão / Conselho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tipo de Infração:
            </label>
            <Select
              value={category}
              onValueChange={(val: any) => setCategory(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISRUPTIVE_BEHAVIOR">Comportamento Perturbador em Sala</SelectItem>
                <SelectItem value="INSUBORDINATION">Desrespeito / Insubordinação ao Docente</SelectItem>
                <SelectItem value="UNIFORM_INFRACTION">Infração de Uniforme ou Apresentação</SelectItem>
                <SelectItem value="UNAUTHORIZED_LEAVE">Saída do Recinto Escolar Sem Autorização</SelectItem>
                <SelectItem value="FIGHT">Agressão Física ou Verbal / Vias de Facto</SelectItem>
                <SelectItem value="VANDALISM">Danos ao Património Escolar</SelectItem>
                <SelectItem value="ACADEMIC_DISHONESTY">Fraude Académica (Cópia em Exame)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Título Síntese:
            </label>
            <Input
              placeholder="Ex: Utilização de telemóvel e recusa de entrega"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Relato Circunstanciado dos Factos:
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[75px]"
              placeholder="Descreva o que ocorreu em sala ou no recinto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Action Taken */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Medida Pedagógica Adotada:
            </label>
            <Input
              placeholder="Ex: Notificação do Encarregado e suspensão preventiva por 2 tempos"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
            />
          </div>

          {/* Reported by & notify parent */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reportado por:
              </label>
              <Input
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
              />
            </div>

            <div className="pt-5 flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyParent"
                checked={parentNotified}
                onChange={(e) => setParentNotified(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="notifyParent" className="text-xs text-foreground cursor-pointer">
                Notificar Encarregado via SMS/WhatsApp
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Registar Ocorrência
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
