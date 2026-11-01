/** Descarrega linhas como CSV que o Excel abre bem em português: separador «;» e BOM UTF-8 (acentos). */
export function downloadCsv(filename: string, rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>): void {
  const cell = (c: string | number | null | undefined) => `"${String(c ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
