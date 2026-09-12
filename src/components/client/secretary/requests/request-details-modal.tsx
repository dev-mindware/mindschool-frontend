"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Badge,
  Input,
  Icon,
} from "@/components";
import { SecretaryRequest, RequestStatus } from "@/types";
import { useSecretaryRequestStore } from "@/stores/school/secretary-request-store";
import { toast } from "sonner";

interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SecretaryRequest | null;
  onPrintSlip: (req: SecretaryRequest) => void;
}

export function RequestDetailsModal({
  open,
  onOpenChange,
  request,
  onPrintSlip,
}: RequestDetailsModalProps) {
  const { updateStatus, dispatchRequest, markAsDelivered } = useSecretaryRequestStore();

  const [dispatchDecision, setDispatchDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [dispatchObs, setDispatchObs] = useState<string>("");
  const [directorName, setDirectorName] = useState<string>("Dr. Alberto Manuel Domingos (Director Geral)");
  const [deliveredTo, setDeliveredTo] = useState<string>("");

  if (!request) return null;

  const handleAdvanceStatus = (newStatus: RequestStatus) => {
    updateStatus(request.id, newStatus);
    toast.success(`Estado do processo actualizado para: ${getStatusLabel(newStatus)}`);
  };

  const handleSaveDispatch = () => {
    if (!dispatchObs) {
      toast.error("Insira o despacho ou parecer fundamentado.");
      return;
    }

    dispatchRequest(request.id, {
      decision: dispatchDecision,
      observations: dispatchObs,
      dispatchedBy: directorName,
      dispatchedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });

    toast.success("Despacho oficial da Direcção registado!");
  };

  const handleMarkDelivered = () => {
    if (!deliveredTo) {
      toast.error("Indique o nome da pessoa que levantou o documento.");
      return;
    }
    markAsDelivered(request.id, deliveredTo);
    toast.success("Entrega de documento confirmada e processo concluído!");
  };

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "Submetido (Aguardando Triagem)";
      case "UNDER_REVIEW":
        return "Em Análise na Secretaria";
      case "PENDING_DIRECTOR":
        return "Aguardando Despacho";
      case "APPROVED":
        return "Deferido / Aprovado";
      case "REJECTED":
        return "Indeferido";
      case "READY_FOR_PICKUP":
        return "Pronto para Levantamento";
      case "COMPLETED":
        return "Entregue / Concluído";
      default:
        return status;
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "READY_FOR_PICKUP":
        return <Badge className="bg-emerald-600 text-white text-xs">Pronto para Levantamento</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary" className="text-xs font-normal">Entregue / Concluído</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-600 text-white text-xs">Deferido pela Direcção</Badge>;
      case "PENDING_DIRECTOR":
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 text-xs">Aguardando Despacho</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="text-xs">Indeferido</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="outline" className="border-primary text-primary bg-primary/5 text-xs">Em Análise</Badge>;
      case "SUBMITTED":
      default:
        return <Badge variant="outline" className="text-xs">Submetido</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Icon name={"FileText" as any} className="size-4 text-primary" />
              Processo: {request.protocolNumber}
            </DialogTitle>
            {getStatusBadge(request.status)}
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-xs">
          {/* Main Info Card */}
          <div className="p-3.5 rounded-xl border border-border bg-card/60 grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground block text-[11px]">Estudante:</span>
              <strong className="text-foreground text-sm">{request.studentName}</strong> ({request.studentNumber})
              <div className="text-muted-foreground text-[11px]">{request.className}</div>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Requerente / Encarregado:</span>
              <strong className="text-foreground">{request.guardianName}</strong>
              <div className="text-muted-foreground font-mono">{request.guardianPhone}</div>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Tipo de Serviço:</span>
              <span className="font-semibold text-primary">{request.typeLabel}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Previsão de Entrega (SLA):</span>
              <span className="font-semibold text-foreground">
                {new Date(request.targetDate).toLocaleDateString("pt-PT")} ({request.slaDays} dias úteis)
              </span>
            </div>
          </div>

          {/* Purpose & Notes */}
          <div className="space-y-1 p-3 rounded-lg border border-border/60 bg-muted/20">
            <div className="font-semibold text-foreground">Finalidade Declarada:</div>
            <p className="text-muted-foreground italic">{request.purpose || "Não especificado."}</p>
            {request.notes && (
              <div className="pt-2 text-muted-foreground border-t border-border/40 mt-2">
                <strong>Notas da Secretaria:</strong> {request.notes}
              </div>
            )}
          </div>

          {/* Director Dispatch Section */}
          {request.dispatch ? (
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Icon name={"Stamp" as any} className="size-3.5" />
                  Despacho da Direcção: {request.dispatch.decision === "APPROVED" ? "DEFERIDO" : "INDEFERIDO"}
                </span>
                <span className="text-[11px] text-muted-foreground">{request.dispatch.dispatchedAt}</span>
              </div>
              <p className="text-muted-foreground italic text-xs">{request.dispatch.observations}</p>
              <div className="text-[11px] font-medium text-foreground pt-1 border-t border-blue-500/20">
                Por: {request.dispatch.dispatchedBy}
              </div>
            </div>
          ) : request.status === "PENDING_DIRECTOR" ? (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Icon name={"PenTool" as any} className="size-3.5" />
                Registar Despacho da Direcção
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={dispatchDecision === "APPROVED" ? "default" : "outline"}
                  onClick={() => setDispatchDecision("APPROVED")}
                  className="text-xs"
                >
                  Deferir (Aprovar Pedido)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={dispatchDecision === "REJECTED" ? "destructive" : "outline"}
                  onClick={() => setDispatchDecision("REJECTED")}
                  className="text-xs"
                >
                  Indeferir (Rejeitar)
                </Button>
              </div>
              <Input
                placeholder="Texto do despacho / fundamentação..."
                value={dispatchObs}
                onChange={(e) => setDispatchObs(e.target.value)}
              />
              <Button size="sm" onClick={handleSaveDispatch} className="w-full text-xs">
                Assinar e Registar Despacho
              </Button>
            </div>
          ) : null}

          {/* Delivery Section */}
          {request.status === "READY_FOR_PICKUP" && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Icon name={"CircleCheck" as any} className="size-3.5" />
                Entrega do Documento ao Requerente
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome de quem levantou (ex: Encarregado Sebastião Bento)"
                  value={deliveredTo}
                  onChange={(e) => setDeliveredTo(e.target.value)}
                  className="text-xs"
                />
                <Button size="sm" onClick={handleMarkDelivered} className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  Confirmar Entrega
                </Button>
              </div>
            </div>
          )}

          {request.status === "COMPLETED" && (
            <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Documento entregue a: <strong className="text-foreground">{request.deliveredTo}</strong>
              </span>
              <span className="text-muted-foreground">{request.deliveredAt}</span>
            </div>
          )}

          {/* Workflow Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPrintSlip(request)}
              className="gap-1.5 text-xs"
            >
              <Icon name={"Printer" as any} className="size-3.5" />
              Imprimir Comprovativo
            </Button>

            <div className="flex items-center gap-2">
              {request.status === "SUBMITTED" && (
                <Button
                  size="sm"
                  onClick={() => handleAdvanceStatus("UNDER_REVIEW")}
                  className="text-xs"
                >
                  Iniciar Análise
                </Button>
              )}

              {request.status === "UNDER_REVIEW" && (
                <Button
                  size="sm"
                  onClick={() => handleAdvanceStatus("PENDING_DIRECTOR")}
                  className="text-xs"
                >
                  Remeter à Direcção
                </Button>
              )}

              {request.status === "APPROVED" && (
                <Button
                  size="sm"
                  onClick={() => handleAdvanceStatus("READY_FOR_PICKUP")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  Marcar Pronto para Levantamento
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
