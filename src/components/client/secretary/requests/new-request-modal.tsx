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
import { useSecretaryRequestStore } from "@/stores/school/secretary-request-store";
import { RequestType, RequestPriority, SecretaryRequest } from "@/types";
import { toast } from "sonner";

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newReq: SecretaryRequest) => void;
}

const SAMPLE_STUDENTS = [
  { id: "stu-01", name: "Afonso Sebastião Bento", number: "MS-2026-0012", class: "9ª Classe A", guardian: "Eng. Sebastião Bento", phone: "+244 923 111 222" },
  { id: "stu-02", name: "Ana Beatriz Domingos", number: "MS-2026-0013", class: "9ª Classe A", guardian: "Sr. Fernando Domingos", phone: "+244 945 888 111" },
  { id: "stu-03", name: "Carlos Daniel Kiala", number: "MS-2026-0025", class: "9ª Classe A", guardian: "Sr. Daniel Kiala", phone: "+244 924 777 888" },
  { id: "stu-04", name: "Domingas Teresa Manuel", number: "MS-2026-0044", class: "9ª Classe A", guardian: "Sra. Teresa Manuel", phone: "+244 912 555 666" },
  { id: "stu-05", name: "Eduardo José Van-Dúnem", number: "MS-2026-0050", class: "9ª Classe A", guardian: "Sra. Teresa Van-Dúnem", phone: "+244 912 333 999" },
  { id: "stu-08", name: "Helena Luísa Kapita", number: "MS-2026-0038", class: "9ª Classe A", guardian: "Dra. Luísa Kapita", phone: "+244 931 444 555" },
];

const SERVICE_TYPES: {
  type: RequestType;
  label: string;
  defaultSla: number;
  defaultFee: number;
}[] = [
  { type: "DECLARATION_SIMPLE", label: "Declaração de Matrícula (Simples / Sem Notas)", defaultSla: 2, defaultFee: 2000 },
  { type: "DECLARATION_GRADES", label: "Declaração com Notas / Histórico Escolar", defaultSla: 4, defaultFee: 4000 },
  { type: "DECLARATION_VISA", label: "Declaração para Embaixada / Visto Consular", defaultSla: 2, defaultFee: 5000 },
  { type: "TRANSFER_GUIDE", label: "Guia de Transferência Escolar Oficial", defaultSla: 5, defaultFee: 8000 },
  { type: "CLASS_SHIFT_CHANGE", label: "Mudança de Turma ou Turno", defaultSla: 3, defaultFee: 3000 },
  { type: "GRADE_REVIEW", label: "Revisão de Prova / Reclamação de Avaliação", defaultSla: 3, defaultFee: 2500 },
  { type: "STUDENT_CARD_REISSUE", label: "2ª Via de Cartão de Estudante (Extravio)", defaultSla: 1, defaultFee: 2000 },
  { type: "ENROLLMENT_CANCELLATION", label: "Anulação de Matrícula / Desistência", defaultSla: 3, defaultFee: 0 },
];

export function NewRequestModal({ open, onOpenChange, onSuccess }: NewRequestModalProps) {
  const { submitRequest } = useSecretaryRequestStore();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(SAMPLE_STUDENTS[0].id);
  const [requestType, setRequestType] = useState<RequestType>("DECLARATION_SIMPLE");
  const [priority, setPriority] = useState<RequestPriority>("NORMAL");
  const [purpose, setPurpose] = useState<string>("");
  const [guardianName, setGuardianName] = useState<string>(SAMPLE_STUDENTS[0].guardian);
  const [guardianPhone, setGuardianPhone] = useState<string>(SAMPLE_STUDENTS[0].phone);
  const [feeAmountKz, setFeeAmountKz] = useState<number>(2000);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");

  const handleStudentSelect = (stdId: string) => {
    setSelectedStudentId(stdId);
    const std = SAMPLE_STUDENTS.find((s) => s.id === stdId);
    if (std) {
      setGuardianName(std.guardian);
      setGuardianPhone(std.phone);
    }
  };

  const handleTypeSelect = (t: RequestType) => {
    setRequestType(t);
    const srv = SERVICE_TYPES.find((s) => s.type === t);
    if (srv) {
      setFeeAmountKz(srv.defaultFee);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = SAMPLE_STUDENTS.find((s) => s.id === selectedStudentId);
    if (!student) {
      toast.error("Seleccione o estudante.");
      return;
    }

    const srv = SERVICE_TYPES.find((s) => s.type === requestType);
    const typeLabel = srv ? srv.label : "Requerimento";
    const slaDays = priority === "URGENT" ? 1 : srv ? srv.defaultSla : 3;

    const newReq = submitRequest({
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.number,
      className: student.class,
      guardianName,
      guardianPhone,
      type: requestType,
      typeLabel,
      priority,
      purpose: purpose || "Requerido para os devidos efeitos legais.",
      slaDays,
      feeAmountKz,
      isPaid,
      notes,
    });

    toast.success(`Requerimento aberto com sucesso! Protocolo: ${newReq.protocolNumber}`);
    onOpenChange(false);
    if (onSuccess) onSuccess(newReq);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name={"FilePlus" as any} className="size-4 text-primary" />
            Abertura de Requerimento na Secretaria Digital
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Student selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Estudante:
            </label>
            <Select value={selectedStudentId} onValueChange={handleStudentSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_STUDENTS.map((std) => (
                  <SelectItem key={std.id} value={std.id}>
                    {std.number} - {std.name} ({std.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tipo de Documento / Serviço:
            </label>
            <Select value={requestType} onValueChange={(val: any) => handleTypeSelect(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((srv) => (
                  <SelectItem key={srv.type} value={srv.type}>
                    {srv.label} • {srv.defaultFee > 0 ? `${srv.defaultFee.toLocaleString("pt-AO")} Kz` : "Gratuito"} (SLA: {srv.defaultSla}d)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Finalidade / Destino do Documento:
            </label>
            <Input
              placeholder="Ex: Fins de abono familiar no INSS, Embaixada de Portugal, etc."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {/* Priority & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Regime de Prioridade:
              </label>
              <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal (Prazo padrão do serviço)</SelectItem>
                  <SelectItem value="URGENT">Urgente (SLA de 24 horas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Emolumento / Taxa de Secretaria (Kz):
              </label>
              <Input
                type="number"
                value={feeAmountKz}
                onChange={(e) => setFeeAmountKz(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Guardian Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nome do Requerente / Encarregado:
              </label>
              <Input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Contacto Telefónico:
              </label>
              <Input
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Observações Adicionais da Secretaria:
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[70px]"
              placeholder="Notas para o atendimento ou despachante..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isPaid" className="text-xs text-foreground cursor-pointer font-medium">
              Taxa de expediente cobrada e liquidada na tesouraria
            </label>
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
              Emitir Protocolo Oficial
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
