"use client";

import type { ReactNode } from "react";
import type { icons } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/common/icon";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  icon: keyof typeof icons;
  description?: string;
  /** Acção à direita do título (ex.: botão "Ver tudo"). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Cartão padrão dos painéis (MindGest): título com ícone, descrição e conteúdo (gráfico, lista, indicadores). */
export function ChartCard({ title, icon, description, action, className, children }: ChartCardProps) {
  return (
    <Card className={cn("flex h-full flex-col gap-0 py-4", className)}>
      <CardHeader className="px-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name={icon} className="size-4" /></span>
              <span className="truncate">{title}</span>
            </CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-2 sm:px-4">{children}</CardContent>
    </Card>
  );
}

export function ChartEmpty({
  text,
  icon = "ChartBar",
  title,
  className,
}: {
  text?: string;
  icon?: keyof typeof icons;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 px-4 text-center my-auto min-h-[160px]", className)}>
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted/50 border border-border/40 text-muted-foreground/70 mb-2.5">
        <Icon name={icon} className="size-5" />
      </div>
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      <p className={cn("text-xs text-muted-foreground leading-relaxed max-w-[280px]", title && "mt-1")}>
        {text || "Sem dados para apresentar neste período."}
      </p>
    </div>
  );
}

/** Linha de legenda / ranking: marcador colorido, rótulo, valor e nota. */
export function LegendRow({ color, label, value, hint, className }: { color?: string; label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <li className={cn("flex items-center justify-between gap-3 text-sm", className)}>
      <span className="flex min-w-0 items-center gap-2">
        {color && <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />}
        <span className="truncate">{label}</span>
      </span>
      <span className="flex shrink-0 items-baseline gap-2">
        <span className="font-medium tabular-nums">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
    </li>
  );
}

/** Barra de progresso fina com percentagem (taxas de cobrança, ocupação…). */
export function RateBar({ value, tone = "primary" }: { value: number | null; tone?: "primary" | "success" | "warning" | "danger" }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const color = { primary: "bg-primary", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-destructive" }[tone];
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", color)} style={{ width: `${v}%` }} /></div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{value === null ? "—" : `${value}%`}</span>
    </div>
  );
}
