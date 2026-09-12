"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
} from "@/components";
import { SecretaryRequest } from "@/types";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";

interface ProtocolSlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SecretaryRequest | null;
}

export function ProtocolSlipModal({
  open,
  onOpenChange,
  request,
}: ProtocolSlipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { profile } = useSchoolSettingsStore();

  if (!request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name={"Printer" as any} className="size-4 text-primary" />
            Comprovativo de Entrada & Protocolo Oficial
          </DialogTitle>
          <Button onClick={handlePrint} size="sm" className="gap-1.5 mr-6">
            <Icon name={"Printer" as any} className="size-3.5" />
            Imprimir Comprovativo
          </Button>
        </DialogHeader>

        {/* Printable Canvas */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-6 rounded-lg border border-slate-200 shadow-xs space-y-5 font-sans print:p-0 print:border-0 print:shadow-none"
        >
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-4 border-slate-300">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              REPÚBLICA DE ANGOLA • MINISTÉRIO DA EDUCAÇÃO
            </div>
            <div className="text-sm font-black uppercase text-slate-900">
              {profile.schoolName || "COLÉGIO PRIVADO MINDSCHOOL"}
            </div>
            <div className="text-[10px] text-slate-500">
              SECRETARIA-GERAL & PROTOCOLO CENTRAL • NIF: {profile.taxNumber || "5417082910"}
            </div>
          </div>

          {/* Protocol Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded border border-slate-200">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Número de Protocolo
              </div>
              <div className="text-xl font-mono font-black text-slate-900">
                {request.protocolNumber}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Previsão de Entrega
              </div>
              <div className="text-sm font-bold text-slate-800">
                {new Date(request.targetDate).toLocaleDateString("pt-PT")} ({request.slaDays} dias úteis)
              </div>
            </div>
          </div>

          {/* Request and Student Details */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="text-slate-500">Estudante:</span>{" "}
                <strong className="text-slate-900">{request.studentName}</strong> ({request.studentNumber})
              </div>
              <div>
                <span className="text-slate-500">Turma / Ano:</span>{" "}
                <span className="text-slate-900 font-medium">{request.className}</span>
              </div>
              <div>
                <span className="text-slate-500">Requerente (Encarregado):</span>{" "}
                <strong className="text-slate-900">{request.guardianName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Contacto:</span>{" "}
                <span className="text-slate-900 font-mono">{request.guardianPhone}</span>
              </div>
            </div>

            <div className="space-y-1 border-b border-slate-200 pb-2">
              <div>
                <span className="text-slate-500">Serviço Solicitado:</span>{" "}
                <strong className="text-slate-900">{request.typeLabel}</strong>
              </div>
              <div>
                <span className="text-slate-500">Finalidade Declarada:</span>{" "}
                <span className="text-slate-800 italic">{request.purpose}</span>
              </div>
              <div>
                <span className="text-slate-500">Data e Hora de Entrada:</span>{" "}
                <span className="text-slate-800 font-medium">{request.submittedAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-slate-500">Taxa de Expediente:</span>{" "}
                <strong className="text-slate-900 font-mono">
                  {request.feeAmountKz > 0 ? `${request.feeAmountKz.toLocaleString("pt-AO")} Kz` : "Gratuito"}
                </strong>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                  {request.isPaid ? "Liquidado" : "Pendente"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Prioridade:</span>{" "}
                <span className="font-semibold text-slate-800">
                  {request.priority === "URGENT" ? "URGENTE (24h)" : "NORMAL"}
                </span>
              </div>
            </div>
          </div>

          {/* Legal notes */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 space-y-1">
            <p>
              • O requerente deve apresentar este comprovativo acompanhado do seu documento de identificação para o levantamento do documento.
            </p>
            <p>
              • Os prazos de emissão contam a partir da data de entrada na Secretaria Central.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
            <div className="space-y-8">
              <div className="text-slate-600 text-[11px]">O / A Requerente</div>
              <div className="border-t border-slate-400 mx-6 pt-1 text-[10px] font-semibold text-slate-800">
                Assinatura do Encarregado
              </div>
            </div>
            <div className="space-y-8">
              <div className="text-slate-600 text-[11px]">Pela Secretaria Escolar</div>
              <div className="border-t border-slate-400 mx-6 pt-1 text-[10px] font-semibold text-slate-800">
                Atendente em Serviço (Selo Branco)
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 pt-2">
            MindSchool Secretary Cloud • Código de Autenticidade: MS-SEC-{request.id.slice(-6).toUpperCase()}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Icon name={"Printer" as any} className="size-3.5" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
