"use client";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import type { DownloadType } from "@/types";
import { useDownloadDocument } from "@/hooks/common/use-download-document";
import type { DocumentType } from "@/types/documents";
import { FeatureGate } from "@/components/common/feature-gate";

type Props = {
  id: string;
  documentType: DocumentType;
  filenameBase: string;
};

export function DownloadDocumentButton({
  id,
  documentType,
  filenameBase,
}: Props) {
  const { mutate, isPending } = useDownloadDocument();

  function handleDownload(format: DownloadType) {
    mutate({
      id,
      documentType,
      format,
      filename: `${filenameBase}.pdf`, // Always use .pdf extension
    });
  }

  const showThermalOption =
    documentType === "invoice-receipt" || documentType === "proforma";

  // If no thermal option, show simple button with direct download
  if (!showThermalOption) {
    return (
      <Button
        onClick={() => handleDownload("pdf")}
        disabled={isPending}
      >
        {isPending ? "A descarregar..." : "Descarregar documento"}
      </Button>
    );
  }

  // Show dropdown for documents with thermal option
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending}>
          {isPending ? "A descarregar..." : "Descarregar documento"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("pdf")}>
          Formato A4
        </DropdownMenuItem>

        {showThermalOption && (
          <DropdownMenuItem onClick={() => handleDownload("thermal")}>
            Talão
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
