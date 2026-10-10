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

  /** Lembrete de cobranca por WhatsApp (abre a conversa com o texto preparado). */
  function sendWhatsAppReminder(fee: StudentTuitionFee) {
    const rawPhone = (fee.guardianPhone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.startsWith("244") ? rawPhone : `244${rawPhone}`;
    const text =
      `Prezado(a) Encarregado(a) de Educação de *${fee.studentName}*,\n\n` +
      `Informamos que a mensalidade escolar referente a *${fee.monthLabel} de ${fee.year}* ` +
      `no valor de *${new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(fee.totalAmount)}* ` +
      `encontra-se com pagamento pendente.\n\nSolicitamos a regularização na tesouraria da escola.\n\n_MindSchool_`;
    SucessMessage(`Aviso WhatsApp preparado para ${fee.guardianName || fee.studentName}!`);
    if (typeof window !== "undefined") window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return { processPayment, sendWhatsAppReminder, isProcessing };
}
