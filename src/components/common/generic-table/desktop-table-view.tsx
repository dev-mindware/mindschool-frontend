"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/common/empty-state";
import { getColumnValue, type SharedTableViewProps } from "./types";

/**
 * Vista Desktop de `GenericTable` (`hidden md:block`):
 * Tabela HTML tradicional em contentor Card com selecção e duplo clique para detalhe.
 */
export function DesktopTableView<T extends { id: string }>({
  data,
  columns,
  emptyMessage,
  emptyDescription,
  route,
  newId,
  selectable,
  selectedIds,
  isAllPageSelected,
  isSomePageSelected,
  onRowActivate,
  onSelectAll,
  onSelectRow,
}: SharedTableViewProps<T>) {
  return (
    <div className="hidden md:block rounded-xs border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      isAllPageSelected
                        ? true
                        : isSomePageSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "text-left text-xs font-medium text-muted-foreground tracking-wider uppercase",
                    column.className,
                  )}
                >
                  {column.header || "----------"}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-4"
                >
                  <EmptyState
                    icon="Inbox"
                    title={emptyMessage}
                    description={emptyDescription}
                    className="border-none bg-transparent shadow-none my-2"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={item.id || rowIndex}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    route && "cursor-pointer",
                    item.id === newId && "animate-pulse-twice",
                    selectable &&
                      selectedIds.includes(item.id) &&
                      "bg-muted/30",
                  )}
                  onDoubleClick={() => onRowActivate(item)}
                >
                  {selectable && (
                    <TableCell
                      className="w-12 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          onSelectRow(item.id, Boolean(checked))
                        }
                        aria-label={`Seleccionar registo ${item.id}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={cn("text-sm text-foreground", column.className)}
                    >
                      {column.render
                        ? column.render(getColumnValue(item, column.key), item)
                        : getColumnValue(item, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

