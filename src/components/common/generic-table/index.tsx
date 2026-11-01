"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/common/skeletons/list-skeleton";
import { DesktopTableView } from "./desktop-table-view";
import { MobileCardStackView } from "./mobile-card-stack-view";
import type { Column, DataTableProps, SharedTableViewProps } from "./types";

export type { Column, DataTableProps };

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

  const handleRowActivate = (item: T) => {
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

  const sharedProps: SharedTableViewProps<T> = {
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
    onRowActivate: handleRowActivate,
    onSelectAll: handleSelectAll,
    onSelectRow: handleSelectRow,
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <DesktopTableView<T> {...sharedProps} />
      <MobileCardStackView<T> {...sharedProps} />

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
