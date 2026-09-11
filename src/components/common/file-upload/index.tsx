"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { File as MyFile } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "../icon";

interface FileUploadProps<T extends FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  accept?: string[];
  label: string;
  info?: string;
  maxSize?: number;
  onChange?: (file: MyFile) => void;
  value?: MyFile;
  disabled?: boolean;
}

const DropzoneContent = ({
  onChange,
  value,
  error,
  label,
  info,
  maxSize,
  disabled,
  name,
}: {
  onChange: (file: MyFile | null) => void;
  value: MyFile | null;
  error?: boolean;
  info?: string;
  label: string;
  maxSize: number;
  disabled?: boolean;
  name: string;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: globalThis.File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > maxSize) {
          alert(
            `O ficheiro excede o tamanho máximo de ${(
              maxSize /
              1024 /
              1024
            ).toFixed(1)}MB.`
          );
          return;
        }
        const customFile: MyFile = {
          fieldname: name, // Using the field name from props
          originalname: file.name,
          encoding: "7bit",
          mimetype: file.type,
          buffer: file, // Store the file object itself as the buffer for now
          size: file.size,
          url: URL.createObjectURL(file),
        };
        onChange(customFile);
      }
    },
    [onChange, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/image": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },
    multiple: false,
    disabled,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      <label className="block text-foreground font-medium text-sm mb-2">
        {label}{" "}
        {info && (
          <span className="text-xs text-muted-foreground ml-1">({info})</span>
        )}
      </label>

      {!value ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg transition-all",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/30 hover:bg-muted/50",
            error ? "border-destructive bg-destructive/10" : "",
            "p-6 flex flex-col items-center justify-center cursor-pointer",
            disabled && "opacity-60 cursor-not-allowed pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-muted rounded-full">
              <Icon name="CloudUpload" className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive
                  ? "Largue o ficheiro aqui"
                  : "Arraste e largue ou seleccione o ficheiro"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ficheiros PDF/imagens (máx. {(maxSize / 1024 / 1024).toFixed(1)}
                MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          <div className="p-4 flex items-center gap-4 border-b border-border bg-muted/30">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon name="FileText" className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="text-sm font-medium text-foreground truncate"
                title={value.originalname}
              >
                {value.originalname}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(value.size)} • PDF
              </p>
            </div>
          </div>

          <div className="p-4 flex flex-wrap gap-2 justify-end bg-card">
            {value.url && (
              <Link
                href={value.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-md transition-colors"
              >
                <Icon name="Eye" className="h-4 w-4" />
                <span>Visualizar</span>
              </Link>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium rounded-md transition-colors"
            >
              <Icon name="X" className="h-4 w-4" />
              <span>Remover</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-destructive">
          <Icon name="CircleAlert" className="h-4 w-4" />
          <p className="text-xs">Seleccione um ficheiro PDF válido.</p>
        </div>
      )}
    </div>
  );
};

export function FileUpload<T extends FieldValues>({
  label,
  name,
  info,
  control,
  maxSize = 1024 * 1024 * 2,
  disabled,
}: FileUploadProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <DropzoneContent
          onChange={onChange}
          value={value}
          error={!!error}
          label={label}
          maxSize={maxSize}
          info={info}
          disabled={disabled}
          name={name as string}
        />
      )}
    />
  );
}
