"use client";

import React from "react";
import { Enrollment } from "@/types";
import {
  GlobalModal,
  Button,
  Badge,
  DetailRow,
  Icon,
} from "@/components";

interface EnrollmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: Enrollment | null;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
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
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="FileCheck2" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Boletim de Matrícula: {enrollment.enrollmentNumber}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Ano Lectivo: {enrollment.academicYear}
              </span>
              <Badge variant={statusConfig.variant} className="text-xs">
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      }
      className="!max-h-[85vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void proof.emit(enrollment)}
            disabled={proof.isPending}
            className="gap-1.5 text-blue-600 border-blue-200"
          >
            <Icon name="FileText" className="h-4 w-4" />
            Emitir Comprovativo (PDF)
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Informações do Estudante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-card border">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Identificação do Estudante
            </h4>
            <DetailRow label="Nome do Aluno" value={enrollment.studentName} />
            <DetailRow label="Número de Processo" value={enrollment.enrollmentNumber} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Alocação de Turma
            </h4>
            <DetailRow label="Turma Alocada" value={enrollment.sectionName} />
            <DetailRow label="Turno" value={enrollment.shift === "MORNING" ? "Manhã" : "Tarde"} />
            <DetailRow label="Ano de Escolaridade" value={enrollment.classLevelId} />
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
    </GlobalModal>
  );
}
