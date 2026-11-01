"use client";

import { useState } from "react";
import { Button, Icon } from "@/components";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

/** «Exportar»: cada relatório sai em PDF, Word ou Excel, com o mesmo cabeçalho oficial e a mesma grelha. */
export function ReportExportMenu({ items, label = "Exportar", size = "sm", disabled }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async (item: ReportExportItem, format: ReportFormat) => {
    setBusy(true);
    try {
      await reportModelsService.download(item.model, await item.params(), format);
      SucessMessage(`${item.label} exportado.`);
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível gerar o relatório."));
    } finally {
      setBusy(false);
    }
  };

  const formats = (item: ReportExportItem) =>
    REPORT_FORMATS.map((f) => (
      <DropdownMenuItem key={f.value} className="cursor-pointer gap-2" onClick={() => void run(item, f.value)}>
        <Icon name={f.value === "xlsx" ? "FileSpreadsheet" : "FileText"} className="size-4 text-muted-foreground" />
        {f.label}
      </DropdownMenuItem>
    ));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="gap-2" disabled={disabled || busy || items.length === 0}>
          <Icon name={busy ? "Loader2" : "Download"} className={busy ? "size-4 animate-spin" : "size-4"} />
          {busy ? "A gerar…" : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48 max-h-80 overflow-y-auto">
        {items.length === 1
          ? formats(items[0]!)
          : items.map((item) => (
              <DropdownMenuSub key={item.key ?? item.model}>
                <DropdownMenuSubTrigger className="cursor-pointer">{item.label}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>{formats(item)}</DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
