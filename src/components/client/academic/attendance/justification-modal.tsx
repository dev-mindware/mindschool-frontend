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
import { toast } from "sonner";

interface JustificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
}

export function JustificationModal({
  open,
  onOpenChange,
  classId,
}: JustificationModalProps) {
  const { students, submitJustification } = useStudentAttendanceStore();
  const classStudents = students.filter((s) => s.classId === classId);

  const [studentId, setStudentId] = useState<string>(classStudents[0]?.id || "");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState<
    "MEDICAL" | "FAMILY_BEREAVEMENT" | "OFFICIAL_CONVOCATION" | "FORCE_MAJEURE" | "OTHER"
  >("MEDICAL");
  const [documentRef, setDocumentRef] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const selectedStudent = students.find((s) => s.id === studentId) || classStudents[0];

  const getReasonLabel = (r: string) => {
    switch (r) {
      case "MEDICAL":
        return "Consulta Médica / Baixa Hospitalar";
      case "FAMILY_BEREAVEMENT":
        return "Falecimento / Nojo Familiar";
      case "OFFICIAL_CONVOCATION":
        return "Convocatória Oficial / Selecção";
      case "FORCE_MAJEURE":
        return "Motivo de Força Maior";
      default:
        return "Outros Motivos Justificados";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Seleccione o estudante.");
      return;
    }
    if (!description) {
      toast.error("Insira a descrição ou motivo da ausência.");
      return;
    }

    submitJustification({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      startDate,
      endDate,
      reason,
      reasonLabel: getReasonLabel(reason),
      documentRef: documentRef || undefined,
      description,
    });

    toast.success("Justificação de falta submetida com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name={"FileText" as any} className="size-4 text-primary" />
            Registar Justificação de Falta Escolar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Student selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Estudante:
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

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Data Inicial:
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Data Final:
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tipo / Motivo da Falta:
            </label>
            <Select
              value={reason}
              onValueChange={(val: any) => setReason(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDICAL">Consulta Médica / Baixa Hospitalar</SelectItem>
                <SelectItem value="FAMILY_BEREAVEMENT">Falecimento / Nojo Familiar</SelectItem>
                <SelectItem value="OFFICIAL_CONVOCATION">Convocatória Oficial / Desporto</SelectItem>
                <SelectItem value="FORCE_MAJEURE">Força Maior (Calamidade / Acidente)</SelectItem>
                <SelectItem value="OTHER">Outros Motivos Justificados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nº do Documento / Atestado (Opcional):
            </label>
            <Input
              placeholder="Ex: AM-1234/26 Clínica Girassol"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Descrição / Observações do Motivo:
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[80px]"
              placeholder="Detalhes sobre a situação do estudante..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
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
              Submeter Justificação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
