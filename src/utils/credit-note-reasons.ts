// Terminologia legal dos motivos de nota de crédito (D.P. 71/25).
// Art. 8.º n.º 5: a NC deve conter a expressão «anulação» ou «rectificação».
// Devolução e desconto (art. 3.º l)) são sub-motivos da rectificação.
export type CreditNoteReason =
  | "CORRECTION"
  | "RETURN"
  | "DISCOUNT"
  | "ANNULMENT";

export const CREDIT_NOTE_REASON_LABELS: Record<CreditNoteReason, string> = {
  CORRECTION: "Rectificação",
  RETURN: "Devolução",
  DISCOUNT: "Desconto",
  ANNULMENT: "Anulação",
};

export function creditNoteReasonLabel(reason?: string | null): string {
  if (!reason) return "—";
  return CREDIT_NOTE_REASON_LABELS[reason as CreditNoteReason] ?? reason;
}

// Opções para o select de criação. A anulação está sempre disponível;
// os motivos de rectificação só fazem sentido sobre uma factura.
export const CREDIT_NOTE_CORRECTION_OPTIONS = (["CORRECTION"] as const).map((value) => ({
  value,
  label: CREDIT_NOTE_REASON_LABELS[value],
}));

export const CREDIT_NOTE_ANNULMENT_OPTION = {
  value: "ANNULMENT" as const,
  label: CREDIT_NOTE_REASON_LABELS.ANNULMENT,
};
