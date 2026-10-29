"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

/** Célula editável da grelha de notas: valor 0–20 e (opcionalmente) o estado da nota (ausente, dispensado…). */
export function ScoreCell({ value, status, readOnly, tone, onValueChange, onStatusChange, label }: ScoreCellProps) {
  const current = status ?? "avaliado";
  return (
    <div className={`flex flex-col items-center gap-1 ${tone ?? ""}`}>
      <input
        type="number"
        step="0.1"
        min="0"
        max="20"
        disabled={readOnly || current !== "avaliado"}
        value={value ?? ""}
        placeholder="0.0 - 20"
        aria-label={label ? `Nota: ${label}` : "Nota"}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            onValueChange("");
            return;
          }
          const n = Number(val);
          if (!isNaN(n)) {
            if (n < 0) onValueChange("0");
            else if (n > 20) onValueChange("20");
            else onValueChange(val);
          } else {
            onValueChange(val);
          }
        }}
        className="w-20 text-center font-medium rounded-xs border border-input bg-background py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-muted/50 disabled:text-muted-foreground"
      />
      {onStatusChange && (
        <Select
          disabled={readOnly}
          value={current}
          onValueChange={(val) => onStatusChange(val as ScoreStatus)}
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
