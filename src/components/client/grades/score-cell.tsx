"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { schoolGradeSchema } from "@/schemas";
import { cn } from "@/lib/utils";

type ScoreStatus = "avaliado" | "ausente" | "dispensado" | "nao_avaliado";

interface ScoreCellProps {
  /** Nota atual (0–20) ou `undefined` se ainda não lançada. */
  value: number | undefined;
  status: ScoreStatus | undefined;
  readOnly: boolean;
  /** Fundo da coluna (distingue as colunas de avaliação). */
  tone?: string;
  onValueChange: (raw: string) => void;
  /** Sem este callback não se mostra o seletor de estado da nota. */
  onStatusChange?: (status: ScoreStatus) => void;
  /** Nome acessível (leitores de ecrã): ex. «Mateus Silva — MAC». */
  label?: string;
}

const gradeValidator = schoolGradeSchema("A nota");

/** Célula editável da grelha de notas: valor 0–20 (até 2 casas decimais) e estado da nota. */
export function ScoreCell({ value, status, readOnly, tone, onValueChange, onStatusChange, label }: ScoreCellProps) {
  const current = status ?? "avaliado";
  const [cellError, setCellError] = useState<string | undefined>(undefined);

  const handleChange = (val: string) => {
    if (val === "") {
      setCellError(undefined);
      onValueChange("");
      return;
    }
    const parsed = gradeValidator.safeParse(val);
    if (!parsed.success) {
      setCellError(parsed.error.issues[0]?.message ?? "Nota inválida (0 a 20).");
      const n = Number(val.replace(",", "."));
      if (!isNaN(n)) {
        if (n < 0) onValueChange("0");
        else if (n > 20) onValueChange("20");
        else onValueChange(val);
      }
      return;
    }
    setCellError(undefined);
    onValueChange(val);
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", tone)}>
      <input
        type="number"
        step="0.1"
        min="0"
        max="20"
        disabled={readOnly || current !== "avaliado"}
        value={value ?? ""}
        placeholder="0.0 - 20"
        aria-label={label ? `Nota: ${label}` : "Nota"}
        aria-invalid={Boolean(cellError) || undefined}
        title={cellError}
        onKeyDown={(e) => {
          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
        }}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          if (value !== undefined && !gradeValidator.safeParse(value).success) {
            setCellError("Nota inválida (0 a 20, máx. 2 casas decimais).");
          } else {
            setCellError(undefined);
          }
        }}
        className={cn(
          "w-20 text-center font-medium rounded-xs border bg-background py-1.5 text-xs shadow-xs focus:ring-1 focus:outline-none disabled:bg-muted/50 disabled:text-muted-foreground",
          cellError ? "border-red-500 ring-1 ring-red-400 text-destructive" : "border-input focus:ring-primary"
        )}
      />
      {cellError && <span role="alert" className="max-w-28 text-center text-[10px] leading-tight text-destructive">{cellError}</span>}
      {onStatusChange && (
        <Select
          disabled={readOnly}
          value={current}
          onValueChange={(val) => {
            if (val !== "avaliado") setCellError(undefined);
            onStatusChange(val as ScoreStatus);
          }}
        >
          <SelectTrigger
            aria-label={label ? `Estado da nota: ${label}` : "Estado da nota"}
            className="w-24 text-[10px] px-2 py-0.5"
            title="Ausente: faltou (conta 0 ou sai da média, conforme a política da escola). Dispensado / Não avaliado: não conta para este aluno e sai da média."
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="avaliado">Avaliado</SelectItem>
            <SelectItem value="ausente">Ausente</SelectItem>
            <SelectItem value="dispensado">Dispensado</SelectItem>
            <SelectItem value="nao_avaliado">Não aval.</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
