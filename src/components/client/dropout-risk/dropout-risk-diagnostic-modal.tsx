"use client";

import React from "react";
import {
  Button,
  Badge,
  Icon,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { DropoutRiskAlert, RiskLevel, AlertStatus } from "@/types/dropout-risk";

interface DropoutRiskDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAlert: DropoutRiskAlert | null;
  onOpenIntervention: (alert: DropoutRiskAlert) => void;
  onResolveAlert: (id: string) => void;
}

export function DropoutRiskDiagnosticModal({
  isOpen,
  onClose,
  selectedAlert,
  onOpenIntervention,
  onResolveAlert,
}: DropoutRiskDiagnosticModalProps) {
  if (!selectedAlert) return null;

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case "HIGH":
        return <Badge variant="destructive" className="font-medium text-xs">Risco Alto</Badge>;
      case "MODERATE":
        return <Badge variant="warning" className="font-medium text-xs">Risco Moderado</Badge>;
      case "LOW":
        return <Badge variant="secondary" className="font-medium text-xs">Risco Baixo</Badge>;
      default:
        return <Badge variant="outline" className="font-medium text-xs">Sob Vigilância</Badge>;
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive" className="font-medium text-xs">Pendente</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info" className="font-medium text-xs">Em Acompanhamento</Badge>;
      case "RESOLVED":
        return <Badge variant="success" className="font-medium text-xs">Resolvido</Badge>;
      case "DROPPED_OUT":
        return <Badge variant="outline" className="text-muted-foreground font-medium text-xs">Abandono Confirmado</Badge>;
      default:
        return <Badge variant="outline" className="font-medium text-xs">Fechado</Badge>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Dossiê Diagnóstico de Abandono Escolar</SheetTitle>
          <SheetDescription>
            Indicadores de assiduidade, desempenho pedagógico e histórico de intervenções.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Cabeçalho do Aluno */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-xs bg-muted/30">
            <div>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">{selectedAlert.studentNumber}</span>
              <h3 className="text-base font-semibold text-foreground">{selectedAlert.studentName}</h3>
              <p className="text-xs text-muted-foreground">{selectedAlert.className} • Ciclo: {selectedAlert.cycle}</p>
            </div>
            <div className="flex items-center gap-2">
              {getRiskBadge(selectedAlert.riskLevel)}
              {getStatusBadge(selectedAlert.status)}
            </div>
          </div>

          <Separator />

          {/* Grid com os 3 Pilares do Risco */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pilar 1: Frequência */}
            <div className="p-3 rounded-xs bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-medium text-xs uppercase tracking-wider">
                <Icon name="Clock" className="w-4 h-4" />
                Assiduidade & Faltas
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                {selectedAlert.signals.consecutiveAbsences} <span className="text-xs font-normal text-muted-foreground">faltas consecutivas</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa de ausência: <strong className="text-foreground">{selectedAlert.signals.absencePercentage}%</strong> das aulas no trimestre.
              </p>
              <div className="text-xs text-rose-600 font-medium">
                {selectedAlert.signals.consecutiveAbsences >= 5 ? "⚠️ Ultrapassa o limiar de alerta imediato" : "Sob vigilância"}
              </div>
            </div>

            {/* Pilar 2: Desempenho (Decreto 424/25) */}
            <div className="p-3 rounded-xs bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-medium text-xs uppercase tracking-wider">
                <Icon name="Award" className="w-4 h-4" />
                Desempenho Pedagógico
              </div>
              <div className="text-2xl font-semibold font-mono text-foreground">
                {selectedAlert.signals.currentAverage.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">valores</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Disciplinas com quebra acentuada:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedAlert.signals.gradeDropSubjects.map((sub) => (
                  <Badge key={sub} variant="warning" className="text-[11px] font-medium">
                    {sub}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pilar 3: Encarregado & Financeiro */}
            <div className="p-3 rounded-xs bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-medium text-xs uppercase tracking-wider">
                <Icon name="Users" className="w-4 h-4" />
                Encarregado & Família
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedAlert.guardianName}</p>
                <p className="text-xs font-mono text-muted-foreground">{selectedAlert.guardianPhone}</p>
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t border-border/40">
                Propinas em atraso: <strong className="text-foreground">{selectedAlert.signals.tuitionOverdueMonths} mês(es)</strong>
              </p>
            </div>
          </div>

          <Separator />

          {/* Linha do Tempo de Intervenções */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="History" className="w-4 h-4 text-primary" />
                Histórico de Intervenções e Acompanhamento
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenIntervention(selectedAlert);
                }}
                className="h-7 text-xs gap-1"
              >
                <Icon name="Plus" className="w-3.5 h-3.5" />
                Nova Intervenção
              </Button>
            </div>

            {selectedAlert.actionsHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-xs border border-dashed border-border">
                Nenhuma intervenção registada para este aluno até ao momento.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedAlert.actionsHistory.map((action) => (
                  <div key={action.id} className="p-3 rounded-xs bg-muted/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <Icon name="CircleCheck" className="w-3.5 h-3.5 text-primary" />
                        {action.title}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">{action.recordedAt}</span>
                    </div>
                    <p className="text-muted-foreground">{action.notes}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span>Registado por: <strong>{action.recordedBy}</strong></span>
                      {action.nextFollowUpDate && (
                        <span className="text-primary font-medium">Retorno agendado: {action.nextFollowUpDate}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          {selectedAlert.status !== "RESOLVED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResolveAlert(selectedAlert.id)}
              className="gap-1.5 text-xs font-medium"
            >
              <Icon name="CheckCheck" className="w-4 h-4" />
              Marcar Caso Como Resolvido
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
