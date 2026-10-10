"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const REASONS: Record<string, string> = {
  access_denied: "A autorização foi recusada no Google. Pode tentar de novo quando quiser.",
  no_refresh_token: "O Google não concedeu acesso duradouro. Remova a aplicação em myaccount.google.com/permissions e tente de novo.",
  expired: "O pedido de ligação expirou. Volte a ligar.",
  invalid: "O pedido de ligação é inválido. Volte a ligar.",
  missing_code: "O Google não devolveu o código de autorização. Volte a ligar.",
  integration_error: "O Google recusou a ligação. Tente de novo dentro de instantes.",
  feature_not_in_plan: "O plano da escola não inclui a integração com o Google.",
};

/**
 * Depois do consentimento no Google a API devolve o navegador a esta página com `?google=connected` ou
 * `?google=error&reason=...`: mostra o resultado, actualiza o estado da ligação e limpa o endereço.
 */
export function useGoogleReturn() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("google");
    if (!status) return;
    const reason = url.searchParams.get("reason") ?? "";
    url.searchParams.delete("google");
    url.searchParams.delete("reason");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    if (status === "connected") {
      SucessMessage("Ligação ao Google concluída.");
      void queryClient.invalidateQueries({ queryKey: ["google-integration"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-google"] });
    } else {
      ErrorMessage(REASONS[reason] ?? "Não foi possível concluir a ligação ao Google.");
    }
  }, [queryClient]);
}
