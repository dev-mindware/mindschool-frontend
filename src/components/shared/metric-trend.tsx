import { Icon } from "@/components";
import { cn } from "@/lib/utils";

export interface MetricTrend {
    /** Variação em percentagem. O sinal define a seta (▲ / ▼). */
    percent: number;
    /** Texto à direita da percentagem (ex.: "vs. mês anterior"). */
    label?: string;
    /**
     * Se subir é bom. Falso para métricas onde crescer é mau
     * (dívida, rupturas de stock). Por omissão, subir é bom.
     */
    higherIsBetter?: boolean;
}

interface MetricTrendIndicatorProps extends MetricTrend {
    className?: string;
}

/**
 * Seta + percentagem de variação face ao período anterior.
 * A cor não vem do sinal: vem de o movimento ser bom ou mau para a métrica.
 */
export function MetricTrendIndicator({
    percent,
    label,
    higherIsBetter = true,
    className,
}: MetricTrendIndicatorProps) {
    const isUp = percent >= 0;
    const isGood = isUp === higherIsBetter;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[11px] md:text-xs font-medium",
                className
            )}
        >
            <Icon
                name={isUp ? "TrendingUp" : "TrendingDown"}
                className={cn(
                    "size-3.5 shrink-0",
                    isGood ? "text-green-600 dark:text-green-500" : "text-destructive"
                )}
            />
            <span
                className={cn(
                    isGood ? "text-green-600 dark:text-green-500" : "text-destructive"
                )}
            >
                {isUp ? "+" : ""}
                {percent.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%
            </span>
            {label && <span className="text-muted-foreground">{label}</span>}
        </span>
    );
}
