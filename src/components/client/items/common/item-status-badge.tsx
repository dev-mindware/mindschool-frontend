import { ItemStatus } from "@/types";
import { Badge } from "@/components/ui";

interface StatusBadgeProps {
  status: ItemStatus;
}

export function ItemStatusBadge({ status }: StatusBadgeProps) {
  let statusStyles: string;
  switch (status) {
    case "ACTIVE":
      statusStyles =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "OUT_OF_STOCK":
      statusStyles =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    default:
      statusStyles =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
  }

  return (
    <Badge variant="secondary" className={statusStyles}>
      {displayStatusLabel(status)}
    </Badge>
  );
}

// O restante do seu código permanece o mesmo
export const statusMap: Record<ItemStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  OUT_OF_STOCK: "Sem stock",
};

export const displayStatusLabel = (status: ItemStatus): string => {
  if (!status) return "----";
  return statusMap[status] || "----";
};
