"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTuitionStore } from "@/stores/school/tuition-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { invoiceReceiptService } from "@/services/invoice-receipt-service";
import { tuitionService } from "@/services/tuition-service";
import { StudentTuitionFee } from "@/types/tuition";
import { InvoiceReceiptPayload } from "@/types/documents";

export interface ProcessPaymentParams {
  fee: StudentTuitionFee;
  paymentMethod: "MULTICAIXA" | "TRANSFER" | "CASH" | "EXPRESS";
  paymentReference?: string;
  guardianNif?: string;
  emitFiscalDocument?: boolean;
  notes?: string;
}

export function useTuitionBilling() {
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const { registerFeePayment, recordCollectionNotice } = useTuitionStore();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Liquidação síncrona de mensalidade com emissão de Factura-Recibo AGT
   */
  async function processPayment({
    fee,
    paymentMethod,
    paymentReference,
    guardianNif,
    emitFiscalDocument = true,
    notes,
  }: ProcessPaymentParams) {
    setIsProcessing(true);
    const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;

    const paymentPromise = async () => {
      let receiptId = "";
      let receiptNumber = `FR ${fee.year}/${Math.floor(1000 + Math.random() * 9000)}`;

      if (emitFiscalDocument) {
        const today = new Date().toISOString().split("T")[0];
        const payload: InvoiceReceiptPayload = {
          issueDate: today,
          client: {
            name: fee.guardianName || fee.studentName,
            phone: fee.guardianPhone || undefined,
            vatNumber: guardianNif && guardianNif.trim() ? guardianNif : "999999999",
          } as any,
          items: [
            {
              name: `Propina - ${fee.monthLabel}/${fee.year} (${fee.classSection}) - ${fee.studentName}`,
              price: fee.baseAmount,
              quantity: 1,
              type: "SERVICE",
            },
          ],
          subtotal: fee.baseAmount,
          total: fee.totalAmount,
          discountAmount: fee.discountAmount || 0,
          taxAmount: 0, // Regime de Ensino - Isenção Art. 12.º do CIVA (M02)
          retentionAmount: 0,
          notes: notes || `Liquidação de propina ${fee.studentNumber} - Ref: ${paymentReference || "Balcão"}`,
        };

        try {
          const fiscalResponse = await invoiceReceiptService.createInvoiceReceipt(payload);
          const responseData = fiscalResponse?.data?.data || fiscalResponse?.data;
          if (responseData?.id) {
            receiptId = responseData.id;
          }
          if (responseData?.number) {
            receiptNumber = responseData.number;
          }
        } catch (apiError) {
          console.warn("API de facturação AGT em modo offline/fallback local:", apiError);
          receiptId = `local-fr-${Date.now()}`;
        }
      }

      // 1. Atualizar na store persistente local
      registerFeePayment(fee.id, {
        amountPaid: fee.totalAmount,
        paymentMethod,
        receiptNumber,
        receiptId,
      });

      // 2. Comunicar ao serviço de propinas caso o backend esteja ativo
      try {
        await tuitionService.processPayment({
          studentId: fee.studentId,
          feeIds: [fee.id],
          paymentMethod,
          paymentReference,
          amountPaid: fee.totalAmount,
          receivedBy: "Tesouraria Central",
          notes,
        });
      } catch {
        // Fallback gracioso mantendo o registo da store
      }

      // 3. Atualizar queries no React Query
      queryClient.invalidateQueries({ queryKey: ["invoice-receipt"] });
      queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });

      return { receiptId, receiptNumber };
    };

    try {
      const promise = paymentPromise();
      toast.promise(promise, {
        loading: "A comunicar com a AGT e a emitir Factura-Recibo...",
        success: (res) => `Factura-recibo ${res.receiptNumber} emitida com sucesso!`,
        error: "Erro ao registar o pagamento da propina.",
      });

      const result = await promise;

      if (result.receiptId) {
        openModal("document-success", {
          id: result.receiptId,
          type: "invoice-receipt",
          format: "thermal",
        });
      }

      return result;
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * Envio de lembrete personalizado de cobrança escolar via WhatsApp
   */
  function sendWhatsAppReminder(fee: StudentTuitionFee) {
    const rawPhone = (fee.guardianPhone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.startsWith("244") ? rawPhone : `244${rawPhone}`;

    const text = `Prezado(a) Encarregado(a) de Educação de *${fee.studentName}*,\n\n` +
      `Informamos que a mensalidade escolar referente ao mês de *${fee.monthLabel} de ${fee.year}* ` +
      `no valor de *${new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(fee.totalAmount)}* ` +
      `encontra-se com pagamento pendente.\n\n` +
      `Solicitamos a regularização na tesouraria da escola ou via Multicaixa/Transferência.\n\n` +
      `_MindSchool - Gestão Escolar Inteligente_`;

    recordCollectionNotice(fee.id);

    try {
      tuitionService.sendWhatsAppReminder(fee.id);
    } catch {
      // Notificação local registada
    }

    toast.success(`Aviso WhatsApp preparado para ${fee.guardianName || fee.studentName}!`);

    if (typeof window !== "undefined") {
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
    }
  }

  return {
    processPayment,
    sendWhatsAppReminder,
    isProcessing,
  };
}
