"use client";

import { Button, Icon } from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

/** Conteúdo do ficheiro descarregado: um código por linha, com aviso. */
export const recoveryCodesFile = (codes: readonly string[], now: Date = new Date()) =>
  `MindSchool: códigos de recuperação (${now.toISOString().slice(0, 10)})\nCada código serve uma só vez. Guarde este ficheiro num local seguro.\n\n${codes.join("\n")}\n`;

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Códigos de recuperação do segundo factor, com copiar e descarregar (só se mostram esta vez). */
export function RecoveryCodesBody({ codes }: { codes: readonly string[] }) {
  const copyAll = () => navigator.clipboard.writeText(codes.join("\n")).then(() => SucessMessage("Códigos copiados.")).catch(() => ErrorMessage("Não foi possível copiar."));
  return (
    <div className="sm:col-span-2 space-y-3">
      <div className="flex items-start gap-2 rounded-xs border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>Se perder o telemóvel, estes códigos são a única forma de entrar. Cada um serve uma só vez e <strong>não voltam a ser mostrados</strong>.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-xs border bg-muted/40 p-3 font-mono text-sm">{codes.map((c) => <span key={c} className="select-all">{c}</span>)}</div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => void copyAll()}><Icon name="Copy" className="size-4" />Copiar todos</Button>
        <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => download(recoveryCodesFile(codes), "mindschool-codigos-de-recuperacao.txt")}><Icon name="Download" className="size-4" />Descarregar (.txt)</Button>
      </div>
    </div>
  );
}
