import { cn } from "@/lib/utils";

interface OverviewLegendRowProps {
    /** Classe de fundo do ponto (ex.: "bg-destructive", "bg-primary"). */
    dotClassName: string;
    label: string;
    /** Valor em destaque à direita. */
    value: string | number;
    /** Valor secundário, mostrado entre parênteses (contagem ou percentagem). */
    hint?: string | number;
}

/**
 * Linha de legenda "ponto colorido + rótulo · valor".
 * Partilhada pelo donut de vendas e pelos cartões de stock e contas a receber.
 */
export function OverviewLegendRow({
    dotClassName,
    label,
    value,
    hint,
}: OverviewLegendRowProps) {
    return (
        <li className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span className={cn("size-2.5 shrink-0 rounded-full", dotClassName)} />
                <span className="truncate">{label}</span>
            </span>

            <span className="shrink-0 font-medium tabular-nums">
                {value}
                {hint !== undefined && (
                    <span className="text-muted-foreground"> ({hint})</span>
                )}
            </span>
        </li>
    );
}
