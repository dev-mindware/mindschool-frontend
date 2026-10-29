"use client";

import Link from "next/link";
import { Icon } from "@/components/common/icon";

export interface Precondition {
  label: string;
  done: boolean;
  /** Página onde se resolve, quando falta. */
  href?: string;
}

/** O que tem de existir antes de avançar (✓/✗), com ligação à página que falta. Não mostra nada se tudo estiver feito. */
export function PreconditionChecklist({ title = "Antes de começar", items }: { title?: string; items: Precondition[] }) {
  if (items.every((i) => i.done)) return null;
  return (
    <div className="rounded-xs border border-amber-300/60 bg-amber-50/50 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/20">
      <p className="mb-1.5 font-semibold text-foreground">{title}</p>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2">
            <Icon name={i.done ? "CircleCheck" : "CircleX"} className={`size-3.5 ${i.done ? "text-emerald-600" : "text-destructive"}`} />
            <span className={i.done ? "text-muted-foreground line-through" : "text-foreground"}>{i.label}</span>
            {!i.done && i.href && <Link href={i.href} className="ml-auto text-primary underline-offset-2 hover:underline">Resolver</Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}
