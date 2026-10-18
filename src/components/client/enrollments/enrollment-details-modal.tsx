"use client";

import React from "react";
import { Enrollment } from "@/types";
import {
  Button,
  Badge,
  DetailRow,
  Icon,
} from "@/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface EnrollmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: Enrollment | null;
}

const SHIFT_LABEL: Record<string, string> = { MORNING: "Manhã", AFTERNOON: "Tarde", EVENING: "Noite", DIURNO: "Diurno" };

const STATUS_LABELS: Record<string,{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Matrícula Efectiva (Activa)", variant: "default" },
  TRANSFERRED: { label: "Transferido", variant: "secondary" },
  CANCELLED: { label: "Cancelada / Anulada", variant: "destructive" },
};

import { useEnrollmentProof } from "./use-enrollment-proof";

export function EnrollmentDetailsModal({
  isOpen,
  onClose,
  enrollment,
}: EnrollmentDetailsModalProps) {
  const proof = useEnrollmentProof();
  if (!enrollment || !isOpen) return null;

  const statusConfig = STATUS_LABELS[enrollment.status] || {
    label: enrollment.status,
    variant: "outline" as const,
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="FileCheck2" className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg font-bold">
                Boletim de Matrícula: {enrollment.enrollmentNumber}
              </SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ano Lectivo: {enrollment.academicYear}</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Informações do Estudante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-card border">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Identificação do Estudante
            </h4>
            <DetailRow label="Nome do Aluno" value={enrollment.studentName} />
            <DetailRow label="N.º de Processo (aluno)" value={enrollment.studentNumber} />
            <DetailRow label="N.º de Matrícula (esta matrícula)" value={enrollment.enrollmentNumber} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Alocação de Turma
            </h4>
            <DetailRow label="Turma Alocada" value={enrollment.sectionName} />
            <DetailRow label="Turno" value={SHIFT_LABEL[enrollment.shift] ?? enrollment.shift} />
            <DetailRow label="Classe" value={enrollment.classLevelName} />
          </div>
        </div>

        {/* Informações Administrativas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border">
          <div>
            <span className="text-xs text-muted-foreground block">Data de Matrícula</span>
            <span className="text-sm font-semibold">{enrollment.enrollmentDate}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Plano de Propinas</span>
            <span className="text-sm font-semibold">{enrollment.tuitionPlanId || "Plano Geral"}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Ano Lectivo</span>
            <span className="text-sm font-semibold">{enrollment.academicYear}</span>
          </div>
        </div>

        {/* Se foi cancelada: auditoria de cancelamento */}
        {enrollment.status === "CANCELLED" && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
              <Icon name="TriangleAlert" className="h-4 w-4" />
              Auditoria de Cancelamento da Vaga
            </div>
            <DetailRow label="Motivo da Anulação" value={enrollment.cancellationReason || undefined} />
            <DetailRow label="Data de Anulação" value={enrollment.cancellationDate || undefined} />
          </div>
        )}

        {/* Observações */}
        {enrollment.notes && (
          <div className="space-y-1.5 p-3 rounded-lg bg-card border text-xs">
            <span className="font-semibold text-muted-foreground block">Notas da Secretaria:</span>
            <p className="text-foreground">{enrollment.notes}</p>
          </div>
        )}
      </div>
      </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => void proof.emit(enrollment)} disabled={proof.isPending}>
            <Icon name="FileText" className="h-4 w-4" />
            Emitir Comprovativo (PDF)
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
