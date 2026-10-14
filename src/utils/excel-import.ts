"use client";

import * as XLSX from "xlsx";

/**
 * Utilitário para ler folhas de cálculo Excel (.xlsx / .xls) e gerar ficheiros para descarregamento.
 */
export async function readExcelAsCsv(file: File): Promise<{ csv: string; rowCount: number; headers: string[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("A folha de cálculo não contém nenhuma aba com dados.");
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
  const headers = (rows[0] as string[]) || [];

  return {
    csv,
    rowCount: Math.max(0, rows.length - 1),
    headers,
  };
}

/**
 * Cria e descarrega um ficheiro Excel (.xlsx) gerado dinamicamente com cabeçalhos e linhas.
 */
export function downloadExcelFile(filename: string, sheetName: string, data: Array<Record<string, unknown>>): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/**
 * Converte texto CSV (de modelos ou rejeições) para um ficheiro Excel (.xlsx) nativo e faz o download.
 */
export function downloadCsvAsExcel(filename: string, sheetName: string, csvContent: string): void {
  const workbook = XLSX.read(csvContent, { type: "string" });
  const firstSheetName = workbook.SheetNames[0] || "Dados";
  const worksheet = workbook.Sheets[firstSheetName] || XLSX.utils.aoa_to_sheet([]);
  
  const targetWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(targetWb, worksheet, sheetName);
  XLSX.writeFile(targetWb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
