import { Badge } from "@/components/ui/badge";

interface DocumentoStatusBadgeProps {
  status: "DRAFT" | "CANCELLED" | "PAID" | string;
}

export function DocumentStatusBadge({ status }: DocumentoStatusBadgeProps) {
  const labelMap: Record<string, string> = {
    DRAFT: "Pendente",
    CANCELLED: "Cancelada",
    PAID: "Paga",
    // Motivos de nota de crédito (D.P. 71/25).
    CORRECTION: "Rectificação",
    RETURN: "Devolução",
    DISCOUNT: "Desconto",
    ANNULMENT: "Anulação",
  };

  const variantMap: Record<string, "default" | "success" | "destructive" | "outline" | "pending"> = {
    DRAFT: "pending",
    CANCELLED: "destructive",
    PAID: "success",
    CORRECTION: "outline",
    RETURN: "outline",
    DISCOUNT: "outline",
    ANNULMENT: "destructive",
  };

  const currentStatus = status ?? "DRAFT";

  return (
    <Badge variant={variantMap[currentStatus] ?? "outline"}>
      {labelMap[currentStatus] || currentStatus}
    </Badge>
  );
}