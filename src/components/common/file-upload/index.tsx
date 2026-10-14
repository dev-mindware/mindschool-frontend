"use client";

import { useDropzone, type Accept } from "react-dropzone";
import { Icon } from "@/components/common/icon";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@/utils/messages";

/** Comprovativos de pagamento: PDF ou imagem. */
export const PROOF_ACCEPT: Accept = { "application/pdf": [".pdf"], "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] };
/** Comprovativos que o servidor só aceita em PDF ou PNG (subscrições). */
export const PROOF_ACCEPT_PDF_PNG: Accept = { "application/pdf": [".pdf"], "image/png": [".png"] };
export const CSV_ACCEPT: Accept = { "text/csv": [".csv"] };
export const EXCEL_ACCEPT: Accept = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
};

interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept: Accept;
  /** Tamanho máximo em bytes (por omissão 10 MB). */
  maxBytes?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

const kb = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const extensions = (accept: Accept) => [...new Set(Object.values(accept).flat().map((e) => e.replace(".", "").toUpperCase()))].join(", ");

/**
 * Carregamento de um ficheiro (arrastar ou escolher): o único componente de upload da aplicação. Controlado
 * (`value`/`onChange`), valida tipo e tamanho no cliente (o servidor valida sempre o conteúdo real).
 */
export function FileUpload({ value, onChange, accept, maxBytes = 10 * 1024 * 1024, label = "Anexar ficheiro", hint, disabled, className }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize: maxBytes,
    multiple: false,
    disabled,
    onDropAccepted: (files) => onChange(files[0] ?? null),
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      ErrorMessage(code === "file-too-large" ? `O ficheiro excede ${kb(maxBytes)}.` : `Tipo de ficheiro não suportado. Use ${extensions(accept)}.`);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-5 text-center text-sm transition-colors hover:border-primary/60 hover:bg-muted/30",
        isDragActive && "border-primary bg-primary/5",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input {...getInputProps()} />
      <Icon name={value ? "FileCheck" : "Upload"} className="size-6 text-primary" />
      <span className="font-medium">{value ? value.name : label}</span>
      <span className="text-xs text-muted-foreground">
        {value ? `${kb(value.size)} · clique ou arraste para trocar` : (hint ?? `${extensions(accept)} · máximo ${kb(maxBytes)}`)}
      </span>
      {value && (
        <button type="button" className="mt-1 text-xs text-destructive hover:underline" onClick={(e) => { e.stopPropagation(); onChange(null); }}>
          Remover
        </button>
      )}
    </div>
  );
}
