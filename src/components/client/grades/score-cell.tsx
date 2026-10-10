type ScoreStatus = "avaliado" | "ausente" | "dispensado" | "nao_avaliado";

interface ScoreCellProps {
  /** Nota actual (0–20) ou `undefined` se ainda não lançada. */
  value: number | undefined;
  status: ScoreStatus | undefined;
  readOnly: boolean;
  /** Fundo da coluna (distingue as colunas de avaliação). */
  tone: string;
  onValueChange: (raw: string) => void;
  /** Sem este callback não se mostra o seletor de estado da nota. */
  onStatusChange?: (status: ScoreStatus) => void;
}

/** Célula editável da grelha de notas: valor 0–20 e (opcionalmente) o estado da nota (ausente, dispensado…). */
export function ScoreCell({ value, status, readOnly, tone, onValueChange, onStatusChange }: ScoreCellProps) {
  const current = status ?? "avaliado";
  return (
    <td className={`py-2 px-2 text-center ${tone}`}>
      <input
        type="number"
        step="0.1"
        min="0"
        max="20"
        disabled={readOnly || current !== "avaliado"}
        value={value ?? ""}
        placeholder="0.0 - 20"
        onChange={(e) => onValueChange(e.target.value)}
        className="w-20 text-center font-medium rounded-md border border-input bg-background py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-muted/50 disabled:text-muted-foreground"
      />
      {onStatusChange && (
        <select
          disabled={readOnly}
          value={current}
          onChange={(e) => onStatusChange(e.target.value as ScoreStatus)}
          className="mt-1 block mx-auto w-20 rounded border border-input bg-background text-[10px] py-0.5"
          title="Estado da nota"
        >
          <option value="avaliado">Avaliado</option>
          <option value="ausente">Ausente</option>
          <option value="dispensado">Dispensado</option>
          <option value="nao_avaliado">Não aval.</option>
        </select>
      )}
    </td>
  );
}
