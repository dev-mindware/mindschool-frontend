/** Guarda um Blob como ficheiro no browser (o nome vem do servidor, quando o indica). */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Nome do ficheiro no cabeçalho `content-disposition` (ou o nome por omissão). */
export function fileNameFrom(disposition: unknown, fallback: string): string {
  const m = typeof disposition === "string" ? /filename="?([^";]+)"?/i.exec(disposition) : null;
  return m?.[1] ?? fallback;
}
