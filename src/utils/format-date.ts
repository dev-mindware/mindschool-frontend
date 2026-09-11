import { format, isValid } from "date-fns";
import { pt } from "date-fns/locale";

/**
 * Formata uma data no padrão dd/MM/yyyy HH:mm com locale pt
 * @param date Date ou string no formato ISO
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return "N/A";
  const dateObj = new Date(date);
  if (!isValid(dateObj)) return "Data inválida";
  return format(dateObj, "dd/MM/yyyy, HH:mm", { locale: pt });
}

/**
 * Converte uma string ISO em Date sem aplicar o shift UTC→local.
 * Remove o sufixo Z ou ±HH:MM para que a hora guardada seja
 * interpretada como hora local (o backend grava wall-clock mas
 * etiqueta como UTC, o que provocaria um desvio do fuso).
 */
export function parseRawDate(date: Date | string): Date {
  if (typeof date !== "string") return new Date(date);
  const raw = date.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(raw);
}

/**
 * Formata uma string ISO sem converter fuso horário.
 * Remove o sufixo Z ou ±HH:MM antes de parsear para mostrar
 * exactamente a hora guardada (sem shift UTC→local).
 */
export function formatDateTimeRaw(date: Date | string): string {
  if (!date) return "N/A";
  const dateObj = parseRawDate(date);
  if (!isValid(dateObj)) return "Data inválida";
  return format(dateObj, "dd/MM/yyyy, HH:mm", { locale: pt });
}

export function formatDate(date: Date | string): string {
  if (!date) return "N/A";
  const dateObj = new Date(date);
  if (!isValid(dateObj)) return "Data inválida";
  return format(dateObj, "dd/MM/yyyy", { locale: pt });
}
