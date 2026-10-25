import type { ReactNode } from "react";
import { icons } from "lucide-react";
import { Icon } from "../icon";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon: keyof typeof icons;
  className?: string;
  /** Botões / ligações de ação (ex.: "Criar horário"). */
  children?: ReactNode;
}

/** Estado vazio padrão: ícone em círculo, título, descrição e (opcional) acções. */
export function EmptyState({
  title = "Nenhum item adicionado",
  description = "Adicione novos itens para começar.",
  icon,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center", className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name={icon} className="size-7" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {children && <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
