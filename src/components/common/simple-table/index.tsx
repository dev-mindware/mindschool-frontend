import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
 * Tabela de leitura, pequena e estática (quadros dentro de um cartão: evolução por disciplina, extracto por mês).
 * Para listas com pesquisa, filtros ou paginação usa-se `DataList`.
 */
export function SimpleTable<T>({ rows, columns, rowKey, className }: SimpleTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border bg-card", className)}>
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.header} className={cn("h-auto p-3 text-xs font-medium text-muted-foreground", ALIGN[c.align ?? "left"])}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={rowKey(r)} className="hover:bg-transparent">
              {columns.map((c) => (
                <TableCell key={c.header} className={cn("p-3", ALIGN[c.align ?? "left"], c.className)}>{c.render(r)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
