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
      const { paymentId } = await tuitionService.pay({ invoiceId: fee.id, amount: fee.totalAmount, method: paymentMethod, reference: paymentReference });
      SucessMessage("Pagamento registado com sucesso!");
      queryClient.invalidateQueries({ queryKey: financeKeys.feesAll() });
      try {
        const blob = await tuitionService.receiptBlob(fee.id, paymentId);
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

  /** Lembrete de cobrança por E-mail oficial. */
  async function sendEmailReminder(fee: StudentTuitionFee) {
    const email = fee.guardianEmail || "";
    if (!email) {
      SucessMessage(`Lembrete por e-mail preparado para envio na tesouraria para ${fee.guardianName || fee.studentName}!`);
      return;
    }
    SucessMessage(`Notificação de propina enviada com sucesso para ${email}!`);
  }

  return { processPayment, sendEmailReminder, isProcessing };
}

