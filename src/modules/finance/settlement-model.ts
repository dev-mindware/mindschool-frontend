// Tipos e regras puras da liquidação (sem chamadas à API: testáveis sem o cliente HTTP).

/** Método de pagamento na interface -> valor da API. */
export const METHOD_TO_API = { MULTICAIXA: "multicaixa_express", CASH: "numerario", TRANSFER: "transferencia_bancaria", EXPRESS: "emis_gpo" } as const;
export type UiPaymentMethod = keyof typeof METHOD_TO_API;

// ---- Tipos (API) ----------------------------------------------------------------------------------------------------

/** Estado do documento fiscal (fatura-recibo) emitido no MindGest. */
export type FiscalDocumentStatus = "sem_ligacao" | "sem_catalogo" | "pausada" | "pendente_fiscal" | "certificada" | "rejeitada" | "erro";

export interface ApiFiscalDocument {
  id: string;
  type: "factura_recibo" | "nota_credito";
  status: FiscalDocumentStatus;
  settlement_id: string | null;
  origin_id: string | null;
  number: string | null;
  series: string | null;
  issued_at: string | null;
  total: string;
  currency: string;
  error: { code: string | null; message: string } | null;
  attempts: number;
  next_retry_at: string | null;
  pdf_available: boolean;
  /** 5.º dia útil seguinte ao pagamento (DP 71/25, art. 8.º): data-limite legal para emitir a fatura-recibo. */
  legal_deadline: string | null;
  /** Passou o prazo sem fatura emitida (ou foi emitida depois dele). */
  deadline_passed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiFiscalDocumentRow extends ApiFiscalDocument {
  student: { id: string; full_name: string } | null;
  customer: { kind: CustomerKind; name: string; nif: string | null } | null;
  method: string | null;
  paid_at: string | null;
  invoices: Array<{ id: string; type: string; due_date: string; description: string | null; amount: string }>;
  credit_notes: ApiFiscalDocument[];
  /** Há nota(s) de crédito emitida(s) no MindGest sobre esta fatura-recibo (a cobrança não muda sozinha). */
  corrected: boolean;
  correction_notice: string | null;
}

export type CustomerKind = "encarregado" | "aluno" | "consumidor_final";

export interface ApiCustomerOptions {
  default: { kind: CustomerKind; guardian_id: string | null };
  guardians: Array<{ guardian_id: string; full_name: string; nif: string | null; is_primary_contact: boolean }>;
  student: { student_id: string; full_name: string; nif: string | null };
  /** `ready`: a fatura-recibo segue logo; `sem_ligacao`/`sem_catalogo`: fica em espera (o pagamento regista-se na mesma). */
  integration: "ready" | "sem_ligacao" | "sem_catalogo" | "pausada";
}

export interface ApiSettlement {
  id: string;
  total: string;
  customer: { kind: CustomerKind; guardian_id: string | null; name: string; nif: string | null };
  invoice_ids: string[];
  payments: Array<{ id: string; invoice_id: string; amount: string }>;
  fiscal_document: ApiFiscalDocument | null;
}

export interface SettlementInput {
  invoiceIds: string[];
  method: UiPaymentMethod;
  reference?: string;
  customer?: { kind: CustomerKind; guardianId?: string };
}


/** Corpo de `POST /s/settlements` (puro, testável): as cobranças do mesmo aluno pagas pelo valor total em dívida. */
export function settlementBody(v: SettlementInput) {
  return {
    invoice_ids: v.invoiceIds,
    method: METHOD_TO_API[v.method],
    ...(v.reference ? { reference_code: v.reference.slice(0, 50) } : {}),
    ...(v.customer ? { customer: { kind: v.customer.kind, ...(v.customer.guardianId ? { guardian_id: v.customer.guardianId } : {}) } } : {}),
  };
}

/** Texto único para o estado fiscal, usado na lista de faturas e depois de marcar como pago. */
export const FISCAL_STATUS: Record<FiscalDocumentStatus | "sem_submissao", { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "info"; hint: string }> = {
  certificada: { label: "Certificada", variant: "success", hint: "Fatura-recibo certificada, com número fiscal." },
  pendente_fiscal: { label: "A aguardar MindGest", variant: "warning", hint: "Enviada ao MindGest, à espera da certificação. Não precisa de fazer nada." },
  sem_ligacao: { label: "Escola não ligada", variant: "secondary", hint: "A escola não está ligada ao MindGest. O pagamento ficou registado; a fatura-recibo é emitida quando o titular ligar a escola." },
  sem_catalogo: { label: "Falta o imposto", variant: "secondary", hint: "Há serviços sem imposto definido no MindGest. O pagamento ficou registado; a fatura-recibo segue quando o imposto for definido." },
  pausada: { label: "Emissão em pausa", variant: "secondary", hint: "O titular suspendeu as emissões pelo MindGest. O pagamento ficou registado; a fatura-recibo segue quando as emissões forem reativadas." },
  rejeitada: { label: "Rejeitada", variant: "destructive", hint: "A certificação fiscal rejeitou o documento. Veja o motivo e corrija no MindGest." },
  erro: { label: "Erro", variant: "destructive", hint: "Não foi possível emitir. Veja o motivo e use «Reprocessar»." },
  sem_submissao: { label: "Sem fatura", variant: "secondary", hint: "Ainda não foi paga, por isso não tem fatura-recibo." },
};
