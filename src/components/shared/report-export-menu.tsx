"use client";

import { useState } from "react";
import { Button, Icon } from "@/components";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { REPORT_FORMATS, reportModelsService, type ReportFormat, type ReportModel, type ReportParams } from "@/services/report-models-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

export interface ReportExportItem {
  /** Chave única na lista (vários itens podem usar o mesmo modelo, p.ex. uma mini-pauta por disciplina). */
  key?: string;
  model: ReportModel;
  label: string;
  /** Pode ser assíncrono (ex.: resolver o id do período). */
  params: () => ReportParams | Promise<ReportParams>;
}

interface Props {
  items: ReportExportItem[];
  label?: string;
  size?: "sm" | "default";
  disabled?: boolean;
}

const FORMAT_SHORT: Record<ReportFormat, string> = { pdf: "PDF", docx: "Word", xlsx: "Excel" };

/** «Exportar»: cada relatório sai em PDF, Word ou Excel, com o mesmo cabeçalho oficial e a mesma grelha. */
export function ReportExportMenu({ items, label = "Exportar", size = "sm", disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (item: ReportExportItem, format: ReportFormat) => {
    const id = `${item.key ?? item.model}:${format}`;
    setBusy(id);
    try {
      await reportModelsService.download(item.model, await item.params(), format);
      SucessMessage(`Ficheiro gerado: ${item.label}.`);
      setOpen(false);
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível gerar o relatório."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size={size} className="gap-2" disabled={disabled || items.length === 0}>
          <Icon name={busy ? "Loader2" : "Download"} className={busy ? "size-4 animate-spin" : "size-4"} />
          {busy ? "A gerar…" : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[26rem] max-w-[92vw] max-h-80 overflow-y-auto p-1">
        <ul className="divide-y">
          {items.map((item) => {
            const key = item.key ?? item.model;
            return (
              <li key={key} className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="min-w-0 text-sm leading-tight">{item.label}</span>
                <span className="flex shrink-0 gap-1">
                  {REPORT_FORMATS.map((f) => (
                    <Button
                      key={f.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={busy !== null}
                      aria-label={`${item.label} em ${f.label}`}
                      onClick={() => void run(item, f.value)}
                    >
                      {busy === `${key}:${f.value}` ? <Icon name="Loader2" className="size-3 animate-spin" /> : FORMAT_SHORT[f.value]}
                    </Button>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
