"use client";
import type React from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { ListSkeleton } from "@/components/common/skeletons/list-skeleton";
import { EmptyState } from "@/components/common/empty-state";

export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  route?: string;
  page?: number;
  total?: number;
  totalPages?: number;
  setPage?: (page: number) => void;
  goToNextPage?: () => void;
  goToPreviousPage?: () => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
}

export function GenericTable<T extends { id: string }>({
  data,
  columns,
  className,
  emptyMessage = "Nenhum dado encontrado",
  emptyDescription = "Não foram encontrados registos para esta consulta.",
  isLoading = false,
  page = 1,
  total = data.length,
  totalPages = 1,
  setPage = () => undefined,
  goToNextPage = () => undefined,
  goToPreviousPage = () => undefined,
  route,
  selectable,
  selectedIds = [],
  onSelectChange,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newId = searchParams.get("newId");

  if (isLoading) {
    return (
      <ListSkeleton
        cols={columns.length + (selectable ? 1 : 0)}
        rows={5}
        className={className}
      />
    );
  }

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((obj: any, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  const handleRowDoubleClick = (item: T) => {
    if (route) router.push(`${route}/${item.id}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      const currentIds = new Set(selectedIds);
      data.forEach((item) => currentIds.add(item.id));
      onSelectChange(Array.from(currentIds));
    } else {
      const pageIds = new Set(data.map((d) => d.id));
      onSelectChange(selectedIds.filter((id) => !pageIds.has(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange(Array.from(new Set([...selectedIds, id])));
    } else {
      onSelectChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const isAllPageSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(item.id));
  const isSomePageSelected =
    data.some((item) => selectedIds.includes(item.id)) && !isAllPageSelected;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* DESKTOP VIEW: Traditional HTML Table in Card Box (Hidden on Mobile) */}
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
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </TableHead>
                )}
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      "text-left text-xs font-medium text-muted-foreground tracking-wider uppercase",
                      column.className
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
                      selectable && selectedIds.includes(item.id) && "bg-muted/30"
                    )}
                    onDoubleClick={() => handleRowDoubleClick(item)}
                  >
                    {selectable && (
                      <TableCell
                        className="w-12 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(item.id, Boolean(checked))
                          }
                          aria-label={`Seleccionar registo ${item.id}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn(
                          "text-sm text-foreground",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(getValue(item, column.key), item)
                          : getValue(item, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MOBILE VIEW: Full-Width Card Stack (Hidden on Desktop) */}
      <div className="block md:hidden w-full space-y-3">
        {data.length === 0 ? (
          <EmptyState
            icon="Inbox"
            title={emptyMessage}
            description={emptyDescription}
          />
        ) : (
            data.map((item, rowIndex) => {
              const headerCol = columns[0];
              const actionCol = columns.find(
                (c) =>
                  String(c.header).toLowerCase().includes("acção") ||
                  String(c.header).toLowerCase().includes("ação") ||
                  String(c.header).toLowerCase().includes("action") ||
                  String(c.key).toLowerCase() === "action"
              );

              const bodyCols = columns.slice(1).filter((c) => c !== actionCol);

              return (
                <div
                  key={item.id || rowIndex}
                  onClick={() => handleRowDoubleClick(item)}
                  className={cn(
                    "relative rounded-xs border border-border bg-card p-4 shadow-xs transition-all active:scale-[0.98]",
                    route && "cursor-pointer",
                    item.id === newId && "ring-2 ring-primary animate-pulse"
                  )}
                >
                  {/* Card Header: Main Title/Key & Action Badge/Button */}
                  <div className="flex items-start justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2 font-medium text-base text-foreground flex-1 line-clamp-1">
                      {selectable && (
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(item.id, Boolean(checked))
                          }
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Seleccionar registo ${item.id}`}
                        />
                      )}
                      {headerCol?.render
                        ? headerCol.render(getValue(item, headerCol.key), item)
                        : getValue(item, headerCol?.key || "")}
                    </div>
                    {actionCol && (
                      <div className="shrink-0">
                        {actionCol.render
                          ? actionCol.render(getValue(item, actionCol.key), item)
                          : getValue(item, actionCol.key)}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  {bodyCols.length > 0 && (
                    <div className="my-2.5 border-t border-border/50" />
                  )}

                  {/* Card Body Sub-Grid: 2 Columns Key-Value Pairs */}
                  {bodyCols.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
                      {bodyCols.map((col, cIdx) => {
                        const val = col.render
                          ? col.render(getValue(item, col.key), item)
                          : getValue(item, col.key);
                        if (val === undefined || val === null || val === "")
                          return null;

                        return (
                          <div key={cIdx} className="flex flex-col space-y-0.5">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                              {col.header}
                            </span>
                            <div className="text-xs font-medium text-foreground truncate">
                              {val}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      {/* PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2 text-xs sm:text-sm">
          <div className="text-muted-foreground text-center sm:text-left">
            Página <strong className="text-foreground">{page}</strong> de{" "}
            <strong className="text-foreground">{totalPages}</strong> — Total:{" "}
            <strong className="text-foreground">{total}</strong>
          </div>

          <Pagination className="w-max mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPreviousPage();
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                .map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {totalPages > page + 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextPage();
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
