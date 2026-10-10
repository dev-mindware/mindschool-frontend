import { Badge } from "@/components/ui/badge";

export interface StatusStyle {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning";
}

interface StatusBadgeProps {
  status: string;
  /** Tabela de estados do domínio: rótulo + variante do `Badge`. */
  map: Record<string, StatusStyle>;
  className?: string;
}

/** Estado de uma entidade como `Badge`. Um estado desconhecido mostra-se tal como vem (nunca rebenta). */
export function StatusBadge({ status, map, className }: StatusBadgeProps) {
  const s = map[status];
  return <Badge variant={s?.variant ?? "outline"} className={className ?? "font-normal"}>{s?.label ?? status}</Badge>;
}
