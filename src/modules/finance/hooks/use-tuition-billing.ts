"use client";
import { financeKeys } from "@/modules/finance/query-keys";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { tuitionService, UiPaymentMethod } from "@/modules/finance/services/tuition-service";
import { StudentTuitionFee } from "@/modules/finance/types";
import { getApiErrorMessage } from "@/utils/api-error";

export interface ProcessPaymentParams {
  fee: StudentTuitionFee;
  paymentMethod: UiPaymentMethod;
  paymentReference?: string;
  guardianNif?: string;
  emitFiscalDocument?: boolean;
  notes?: string;
}

export function useTuitionBilling() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Liquidacao de uma propina: regista o pagamento na API (idempotente) e abre o comprovativo em PDF.
   * A certificacao fiscal da factura e feita pela API (Motor Fiscal Mindgest), nao pelo frontend.
   */
  async function processPayment({ fee, paymentMethod, paymentReference }: ProcessPaymentParams) {
    setIsProcessing(true);
    try {
      // Liquida a factura de origem e, no mesmo acto, as multas de mora dela (cada multa e uma factura propria).
      const targets = [
        ...((fee.baseBalance ?? fee.totalAmount) > 0 ? [{ invoiceId: fee.id, amount: fee.baseBalance ?? fee.totalAmount }] : []),
        ...(fee.penalties ?? []).map((p) => ({ invoiceId: p.id, amount: p.balance })),
      ];
      let first: { invoiceId: string; paymentId: string } | null = null;
      for (const t of targets) {
        const { paymentId } = await tuitionService.pay({ ...t, method: paymentMethod, reference: paymentReference });
        first ??= { invoiceId: t.invoiceId, paymentId };
      }
      if (!first) throw new Error("Não há valor em dívida para liquidar.");
      const paymentId = first.paymentId;
      SucessMessage(targets.length > 1 ? "Pagamento registado: propina e multas liquidadas." : "Pagamento registado com sucesso!");
      queryClient.invalidateQueries({ queryKey: financeKeys.feesAll() });
      try {
        const blob = await tuitionService.receiptBlob(first.invoiceId, paymentId);
        window.open(URL.createObjectURL(blob), "_blank");
      } catch {
        // o pagamento ja esta registado; o comprovativo pode ser pedido depois
      }
      return { receiptId: paymentId, receiptNumber: "" };
    } catch (error) {
      ErrorMessage(getApiErrorMessage(error, "Erro ao registar o pagamento da propina."));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * Lembrete de cobrança por e-mail: a API envia o texto oficial ao encarregado principal e devolve o resultado real.
   * Só se diz «enviado» quando a API confirma; falhas (sem encarregado, sem e-mail, canal não configurado) aparecem com o motivo.
   */
  async function sendReminders(fees: StudentTuitionFee[]) {
    try {
      const res = await tuitionService.sendReminders(fees.map((f) => f.id));
      const failures = res.results.filter((r) => r.status === "falhou");
      if (res.sent > 0) SucessMessage(res.sent === 1 ? "Lembrete enviado." : `${res.sent} lembretes enviados.`);
      if (failures.length > 0) {
        const reasons = [...new Set(failures.map((f) => f.error).filter(Boolean))].join(" · ");
        ErrorMessage(`${failures.length} não ${failures.length === 1 ? "foi enviado" : "foram enviados"}: ${reasons || "motivo desconhecido"}`);
      }
      if (res.cancelled > 0) SucessMessage(`${res.cancelled} já estava${res.cancelled === 1 ? "" : "m"} paga${res.cancelled === 1 ? "" : "s"} e não precisava${res.cancelled === 1 ? "" : "m"} de lembrete.`);
      return res;
    } catch (error) {
      ErrorMessage(getApiErrorMessage(error, "Não foi possível enviar os lembretes."));
      throw error;
    }
  }

  return { processPayment, sendReminders, isProcessing };
}

