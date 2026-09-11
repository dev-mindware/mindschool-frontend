import type { TaxpayerStatus, VatRegime } from "@/types/contributor";

export const TAXPAYER_STATUS_LABELS: Record<TaxpayerStatus, string> = {
  A: "Activo",
  C: "Cessado",
  D: "Falecido",
  E: "Herança",
  F: "Anulado",
  G: "Suspenso",
};

export const VAT_REGIME_LABELS: Record<VatRegime, string> = {
  GNAD: "Regime Geral",
  TRAG: "Regime Transitório",
  SIMP: "Regime Simplificado",
  NBND: "Regime de Não Sujeição",
  EXCL: "Regime de Exclusão",
};

export const RESTRICTED_TAXPAYER_STATUSES: TaxpayerStatus[] = [
  "C",
  "D",
  "E",
  "F",
  "G",
];

export const FINAL_CONSUMER_TAX_NUMBER = "999999999";

export function normalizeTaxNumber(value: string): string {
  return value.replace(/\s/g, "").trim().toUpperCase();
}

export function isValidAngolanTaxNumber(value: string): boolean {
  const normalized = normalizeTaxNumber(value);
  return /^\d{9}[A-Z]{2}\d{3}$/.test(normalized) || /^\d{10}$/.test(normalized);
}

export function taxpayerHasRestrictions(status: TaxpayerStatus): boolean {
  return RESTRICTED_TAXPAYER_STATUSES.includes(status);
}
