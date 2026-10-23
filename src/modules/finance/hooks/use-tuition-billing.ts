"use client";

import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { tuitionService } from "@/modules/finance/services/tuition-service";
import type { StudentTuitionFee } from "@/modules/finance/types";
import { getApiErrorMessage } from "@/utils/api-error";

export function useTuitionBilling() {

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

  return { sendReminders };
}

