"use client";

import { useMemo, type ReactNode } from "react";
import { icons } from "lucide-react";
import { Button } from "@/components/ui";
import { EmptyState } from "@/components/common/empty-state";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { Icon } from "@/components/common/icon";
import { RequestError } from "@/components/common/request-error";
import { ListSkeleton } from "@/components/common/skeletons/list-skeleton";
import { FilterBarSkeleton } from "@/components/common/skeletons/filter-bar-skeleton";
import { useListFilters, type ListFiltersState } from "@/hooks/common/use-list-filters";
import { normalize } from "@/utils/normalize-string";
import { DesktopFilterBar } from "./desktop-filter-bar";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import type {
  ListDateFilterDef,
  ListFilterBarProps,
  ListFilterDef,
  ListSortDef,
} from "./types";

export type { Column, ListDateFilterDef, ListFilterBarProps, ListFilterDef, ListSortDef };

/** Chaves de URL necessárias aos filtros declarados (para `useListFilters`). */
export function filterKeysOf<T>(
  filters: ListFilterDef<T>[],
  dateFilters: ListDateFilterDef<T>[] = [],
) {
  return [
    ...filters.map((f) => f.key),
    ...dateFilters.flatMap((d) => [`${d.key}-from`, `${d.key}-to`]),
  ];
}

/** Aplica pesquisa, filtros, datas e ordenação declarados a um conjunto de linhas. */
export function applyListFilters<T>(
  rows: T[],
  f: ListFiltersState,
  defs: {
    searchText?: (r: T) => string;
    filters?: ListFilterDef<T>[];
    dateFilters?: ListDateFilterDef<T>[];
    sorts?: ListSortDef<T>[];
  },
): T[] {
  let out = rows;
  // sem acentos nem maiúsculas: «ângelo» encontra «Angelo» e vice-versa
  const q = normalize(f.search.trim());
  if (q && defs.searchText) {
    out = out.filter((r) => normalize(defs.searchText!(r)).includes(q));
  }
  for (const def of defs.filters ?? []) {
    const v = f.get(def.key);
    if (v) out = out.filter((r) => def.match(r, v));
  }
  for (const d of defs.dateFilters ?? []) {
    const from = f.get(`${d.key}-from`);
    const to = f.get(`${d.key}-to`);
    if (from) out = out.filter((r) => (d.getDate(r) ?? "").slice(0, 10) >= from);
    if (to) out = out.filter((r) => (d.getDate(r) ?? "").slice(0, 10) <= to);
  }
  const sort = (defs.sorts ?? []).find((s) => s.value === f.sort);
  if (sort) {
    out = [...out].sort((a, b) =>
      f.order === "asc" ? sort.compare(a, b) : sort.compare(b, a),
    );
  }
  return out;
}

/**
 * Barra de filtros padrão MindGest:
 * - Mobile (`sm:hidden`): `MobileFilterSheet` (pesquisa + botão gatilho + Bottom Sheet Drawer com estado draft).
 * - Desktop (`hidden sm:flex`): `DesktopFilterBar` (pesquisa + popovers inline + selectores de datas).
 */
export function ListFilterBar<T>(props: ListFilterBarProps<T>) {
  const { prefix, f, shown, total } = props;

  return (
    <div
      className="w-full flex flex-col gap-3 px-2 sm:px-0"
      data-tour={`${prefix}-filters`}
    >
      <MobileFilterSheet<T> {...props} />
      <DesktopFilterBar<T> {...props} />

      {f.activeCount > 0 && (
        <div className="flex items-center gap-3 justify-between sm:justify-start">
          <Button
            size="sm"
            variant="outline"
            onClick={f.clear}
            className="h-9 text-xs text-destructive hover:text-destructive"
          >
            <Icon name="X" className="w-3.5 h-3.5 mr-1.5" />
            Limpar filtros
          </Button>
          {total !== undefined && (
            <span className="text-xs text-muted-foreground">
              {shown} de {total} registos
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface DataListProps<T extends { id: string }> {
  /** Prefixo dos parâmetros da URL (único por lista). */
  prefix: string;
  rows: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
  searchPlaceholder?: string;
  /** Texto pesquisável da linha. Sem isto, a pesquisa fica escondida. */
  searchText?: (row: T) => string;
  filters?: ListFilterDef<T>[];
  /** Cada filtro cria o par "depois de" / "antes de" sobre a data devolvida. */
  dateFilters?: ListDateFilterDef<T>[];
  sorts?: ListSortDef<T>[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: keyof typeof icons;
  /** Ações da barra de filtros (ex.: exportar). */
  toolbar?: ReactNode;
  /** Rota de detalhe ao duplo clique. */
  route?: string;
  skeletonCols?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
}

/**
 * Lista padrão MindSchool seguindo o padrão MindGest: barra de filtros (tudo na URL), `GenericTable` com paginação e os
 * estados skeleton / erro / vazio. Filtra, ordena e pagina no cliente.
 */
export function DataList<T extends { id: string }>({
  prefix,
  rows,
  columns,
  isLoading,
  isError,
  refetch,
  searchPlaceholder = "Pesquisar...",
  searchText,
  filters = [],
  dateFilters = [],
  sorts = [],
  pageSize = 10,
  emptyTitle = "Sem resultados",
  emptyDescription = "Não existem registos para os filtros aplicados.",
  emptyIcon = "Inbox",
  toolbar,
  route,
  skeletonCols,
  selectable,
  selectedIds,
  onSelectChange,
}: DataListProps<T>) {
  const keys = useMemo(
    () => filterKeysOf(filters, dateFilters),
    [filters, dateFilters],
  );
  const f = useListFilters(prefix, keys, pageSize);
  const processed = useMemo(
    () => applyListFilters(rows, f, { searchText, filters, dateFilters, sorts }),
    [rows, f, searchText, filters, dateFilters, sorts],
  );

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const page = Math.min(f.page, totalPages);
  const pageRows = processed.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters =
    filters.length + dateFilters.length + sorts.length > 0 ||
    Boolean(searchText);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-6">
        {hasFilters && (
          <FilterBarSkeleton
            filterCount={Math.min(filters.length, 4)}
            hasSort={sorts.length > 0}
            searchable={Boolean(searchText)}
          />
        )}
        <ListSkeleton
          cols={skeletonCols ?? Math.min(columns.length, 6)}
          rows={5}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError
        refetch={refetch ?? (() => undefined)}
        message="Erro ao carregar os dados"
      />
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {hasFilters && (
        <ListFilterBar<T>
          prefix={prefix}
          f={f}
          searchPlaceholder={searchPlaceholder}
          searchable={Boolean(searchText)}
          filters={filters}
          dateFilters={dateFilters}
          sorts={sorts}
          toolbar={toolbar}
          shown={processed.length}
          total={rows.length}
        />
      )}

      {processed.length > 0 ? (
        <GenericTable<T>
          page={page}
          data={pageRows}
          columns={columns}
          total={processed.length}
          totalPages={totalPages}
          setPage={f.setPage}
          goToNextPage={() => f.setPage(Math.min(page + 1, totalPages))}
          goToPreviousPage={() => f.setPage(Math.max(page - 1, 1))}
          emptyMessage={emptyTitle}
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectChange={onSelectChange}
          {...(route ? { route } : {})}
        />
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
        />
      )}
    </div>
  );
}
