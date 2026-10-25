"use client";

import { Icon } from "@/components/common/icon";
import { Badge } from "@/components/ui/badge";

export interface StatusLegendItem {
  label: string;
  description: string;
  /** Só para quem está nesta fase: o passo seguinte. */
  next?: string;
}

/**
 * Legenda dos estados de um fluxo (candidaturas, faturas, pautas…), recolhida por omissão:
 * diz o que cada estado significa e qual é o passo seguinte.
 */
export function StatusLegend({ title = "Legenda dos estados", items }: { title?: string; items: StatusLegendItem[] }) {
  return (
    <details className="group rounded-lg border bg-card text-xs">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium text-muted-foreground hover:text-foreground">
        <Icon name="Info" className="size-3.5" />
        {title}
        <Icon name="ChevronDown" className="ml-auto size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="space-y-2 border-t px-3 py-2.5">
        {items.map((i) => (
          <li key={i.label} className="flex flex-wrap items-start gap-2">
            <Badge variant="outline" className="shrink-0 text-[11px]">{i.label}</Badge>
            <span className="min-w-0 flex-1 text-muted-foreground">
              {i.description}
              {i.next && <span className="block text-foreground/80">Seguinte: {i.next}</span>}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
