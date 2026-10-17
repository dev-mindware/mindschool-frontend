"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/common/icon";
import { downloadElementAsPdf, type ExportPdfOptions } from "@/utils/export-pdf";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";

export interface PrintDownloadDropdownProps {
  elementId?: string;
  getElement?: () => HTMLElement | null;
  filename?: string;
  orientation?: "portrait" | "landscape";
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  onPrint?: () => void;
  pdfOptions?: ExportPdfOptions;
}

export function PrintDownloadDropdown({
  elementId,
  getElement,
  filename = "documento.pdf",
  orientation = "portrait",
  label = "Baixar PDF",
  variant = "outline",
  size = "sm",
  className,
  disabled,
  pdfOptions,
}: PrintDownloadDropdownProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const displayLabel = !label || label.toLowerCase().includes("imprimir") ? "Baixar PDF" : label;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const target = getElement ? getElement() : elementId ? document.getElementById(elementId) : null;
      if (!target) {
        ErrorMessage("Conteúdo para gerar o PDF não foi encontrado na página.");
        return;
      }
      await downloadElementAsPdf(target, {
        filename,
        orientation,
        ...pdfOptions,
      });
      SucessMessage("Download do PDF concluído com sucesso!");
    } catch (err) {
      console.error("PDF generation error:", err);
      ErrorMessage("Erro ao gerar ficheiro PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || isDownloading}
      onClick={handleDownload}
      className={cn("gap-2", className)}
    >
      {isDownloading ? (
        <Icon name="Loader2" className="size-4 animate-spin text-primary" />
      ) : (
        <Icon name="Download" className="size-4" />
      )}
      <span>{displayLabel}</span>
    </Button>
  );
}

export const DownloadPdfButton = PrintDownloadDropdown;

