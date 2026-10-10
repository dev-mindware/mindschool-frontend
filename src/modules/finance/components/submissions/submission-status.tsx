import { Badge } from "@/components";
import type { PaymentMethodApi, SubmissionStatus } from "@/modules/finance/services/tuition-payments-service";

export const SUBMISSION_STATUS: Record<SubmissionStatus, { label: string; variant: "info" | "warning" | "success" | "destructive" | "secondary" | "outline" }> = {
  submetido: { label: "Por validar", variant: "info" },
  em_analise: { label: "Em análise", variant: "warning" },
  aprovado: { label: "Pagamento confirmado", variant: "success" },
  rejeitado: { label: "Não validado", variant: "destructive" },
  substituicao_pedida: { label: "Novo comprovativo pedido", variant: "warning" },
  cancelado: { label: "Cancelado", variant: "secondary" },
};

export const METHOD_LABEL: Record<PaymentMethodApi, string> = { transferencia_bancaria: "Transferência bancária", multicaixa_express: "Multicaixa Express", numerario: "Depósito / numerário" };

export function SubmissionBadge({ status }: { status: SubmissionStatus }) {
  const c = SUBMISSION_STATUS[status];
  return <Badge variant={c.variant} className="font-normal">{c.label}</Badge>;
}

export const OPEN_SUBMISSION: SubmissionStatus[] = ["submetido", "em_analise", "substituicao_pedida"];
