"use client";

import type { icons } from "lucide-react";
import { Icon } from "@/components/common/icon";
import { cn } from "@/lib/utils";

export interface ChartEmptyProps {
  text?: string;
  icon?: keyof typeof icons;
  title?: string;
  className?: string;
}

/**
 * Estado vazio padronizado para cartões de gráficos e visualizações compactas de dados.
 */
export function ChartEmpty({
  text,
  icon = "ChartBar",
  title,
  className,
}: ChartEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 px-4 text-center my-auto min-h-[160px]", className)}>
      <div className="flex size-11 items-center justify-center rounded-xs bg-muted/50 border border-border/40 text-muted-foreground/70 mb-2.5">
        <Icon name={icon} className="size-5" />
      </div>
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      <p className={cn("text-xs text-muted-foreground leading-relaxed max-w-[280px]", title && "mt-1")}>
        {text || "Sem dados para apresentar neste período."}
      </p>
    </div>
  );
}

