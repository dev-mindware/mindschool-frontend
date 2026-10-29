import type { ReactNode } from "react";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { cn } from "@/lib/utils";

export interface SimpleColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface SimpleTableProps<T> {
  rows: T[];
  columns: SimpleColumn<T>[];
  rowKey: (row: T) => string;
  className?: string;
}

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;

/**
 * Wrapper de compatibilidade que delega diretamente ao `GenericTable`.
 */
export function SimpleTable<T>({ rows, columns, rowKey, className }: SimpleTableProps<T>) {
  const mappedData = rows.map((row) => ({ ...row, id: rowKey(row) }));
  const mappedColumns: Column<T & { id: string }>[] = columns.map((col, idx) => ({
    key: `col_${idx}`,
    header: col.header,
    className: cn(ALIGN[col.align ?? "left"], col.className),
    render: (_, item) => col.render(item),
  }));

  return (
    <GenericTable
      data={mappedData}
      columns={mappedColumns}
      className={className}
    />
  );
}
