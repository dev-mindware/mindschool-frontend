import { PackageOpen, icons } from "lucide-react";
import { Icon } from "../icon";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon: keyof typeof icons;
  className?: string;
}

export function EmptyState({
  title = "Nenhum item adicionado",
  description = "Adicione novos itens para começar.",
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center w-full p-8 mt-4 text-center border border-border rounded-xl bg-card", className)}>
      <Icon name={icon} className="w-12 h-12 mb-4 text-foreground" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-foreground">{description}</p>
    </div>
  );
}
