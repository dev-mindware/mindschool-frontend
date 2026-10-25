"use client";

import { readSheet, type Row as ReadRow } from "read-excel-file/browser";
import writeXlsxFile, { type Row as WriteRow } from "write-excel-file/browser";

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Utilitário para ler folhas de cálculo Excel (.xlsx / .xls) e extrair os dados em formato CSV para validação na API.
 */
export async function readExcelAsCsv(file: File): Promise<{ csv: string; rowCount: number; headers: string[] }> {
  const rows: ReadRow[] = await readSheet(file);
  if (!rows || rows.length === 0) {
    throw new Error("A folha de cálculo não contém nenhuma linha com dados.");
  }

  const csv = rows.map((r) => r.map((cell) => escapeCsvCell(cell)).join(",")).join("\n");
  const headers = (rows[0] as unknown[])?.map((h) => String(h ?? "").trim()) || [];

  return {
    csv,
    rowCount: Math.max(0, rows.length - 1),
    headers,
  };
}

/**
 * Cria e descarrega um ficheiro Excel (.xlsx) gerado dinamicamente com cabeçalhos e linhas.
 */
export async function downloadExcelFile(filename: string, sheetName: string, data: Array<Record<string, unknown>>): Promise<void> {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0] || {});

  const headerRow: WriteRow = headers.map((h) => ({
    value: h,
    fontWeight: "bold",
  }));

  const dataRows: WriteRow[] = data.map((item) =>
    headers.map((h) => ({
      value: item[h] !== null && item[h] !== undefined ? String(item[h]) : "",
    }))
  );

  const file = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  await writeXlsxFile([headerRow, ...dataRows], {
    sheet: sheetName || "Dados",
  }).toFile(file);
}

/**
 * Converte texto CSV (de modelos ou relatórios de rejeição) para um ficheiro Excel (.xlsx) nativo e faz o download.
 */
/** O Excel só aceita nomes de folha até 31 caracteres e sem `\ / ? * [ ] :`. */
export function excelSheetName(name: string | undefined): string {
  const clean = (name ?? "").replace(/[\\/?*[\]:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31).trim();
  return clean || "Folha 1";
}

export async function downloadCsvAsExcel(filename: string, sheetName: string, csvContent: string): Promise<void> {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return;

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  };

  const rows: WriteRow[] = lines.map((line, idx) => {
    const cells = parseCsvLine(line);
    return cells.map((cell) => ({
      value: cell,
      fontWeight: idx === 0 ? "bold" : undefined,
    }));
  });

  const file = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  await writeXlsxFile(rows, {
    sheet: excelSheetName(sheetName),
  }).toFile(file);
}
