"use client";

import { useMemo, type ReactNode } from "react";
import { icons } from "lucide-react";
import { Button, DatePicker } from "@/components/ui";
import { EmptyState } from "@/components/common/empty-state";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { Icon } from "@/components/common/icon";
import { RequestError } from "@/components/common/request-error";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { ListSkeleton } from "@/components/common/skeletons/list-skeleton";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { useListFilters, type ListFiltersState } from "@/hooks/common/use-list-filters";

export interface ListFilterDef<T> {
  key: string;
  label: string;
  icon: keyof typeof icons;
  options: Array<{ value: string; label: string }>;
  /** Devolve true se a linha corresponde ao valor escolhido. */
  match: (row: T, value: string) => boolean;
}

export interface ListDateFilterDef<T> {
  key: string;
  label: string;
  getDate: (row: T) => string | null | undefined;
}

export interface ListSortDef<T> {
  value: string;
  label: string;
  compare: (a: T, b: T) => number;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Chaves de URL necessárias aos filtros declarados (para `useListFilters`). */
export function filterKeysOf<T>(filters: ListFilterDef<T>[], dateFilters: ListDateFilterDef<T>[] = []) {
  return [...filters.map((f) => f.key), ...dateFilters.flatMap((d) => [`${d.key}-from`, `${d.key}-to`])];
}

/** Aplica pesquisa, filtros, datas e ordenação declarados a um conjunto de linhas. */
export function applyListFilters<T>(rows: T[], f: ListFiltersState, defs: { searchText?: (r: T) => string; filters?: ListFilterDef<T>[]; dateFilters?: ListDateFilterDef<T>[]; sorts?: ListSortDef<T>[] }): T[] {
  let out = rows;
  const q = f.search.trim().toLowerCase();
  if (q && defs.searchText) out = out.filter((r) => defs.searchText!(r).toLowerCase().includes(q));
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
  if (sort) out = [...out].sort((a, b) => (f.order === "asc" ? sort.compare(a, b) : sort.compare(b, a)));
  return out;
}

interface ListFilterBarProps<T> {
  prefix: string;
  f: ListFiltersState;
  searchPlaceholder?: string;
  searchable?: boolean;
  filters?: ListFilterDef<T>[];
  dateFilters?: ListDateFilterDef<T>[];
  sorts?: ListSortDef<T>[];
  toolbar?: ReactNode;
  shown?: number;
  total?: number;
}

/** Barra de filtros padrão MindGest: pesquisa + FilterPopover + datas + ordenação, com botão «Limpar». Estado na URL. */
export function ListFilterBar<T>({ prefix, f, searchPlaceholder = "Pesquisar...", searchable = true, filters = [], dateFilters = [], sorts = [], toolbar, shown, total }: ListFilterBarProps<T>) {
  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-0" data-tour={`${prefix}-filters`}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        {searchable && <SearchHandlerWrapper search={f.search} setSearch={f.setSearch} className="w-full" placeholder={searchPlaceholder} />}
        {filters.map((def) => (
          <FilterPopover key={def.key} icon={def.icon} label={def.label} options={def.options} value={f.get(def.key) || null} onChange={(v) => f.setFilter(def.key, v)} />
        ))}
        {sorts.length > 0 && (
          <>
            <FilterPopover icon="List" label="Ordenar por" options={sorts.map((s) => ({ value: s.value, label: s.label }))} value={f.sort || null} onChange={(v) => f.setSort(v)} />
            <FilterPopover icon="ArrowDownUp" label="Ordem" options={[{ value: "asc", label: "Crescente" }, { value: "desc", label: "Decrescente" }]} value={f.sort ? f.order : null} onChange={(v) => { if (v && v !== f.order) f.toggleOrder(); }} />
          </>
        )}
        {toolbar}
      </div>

      {dateFilters.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {dateFilters.map((d) => (
            <div key={d.key} className="flex flex-col sm:flex-row gap-3">
              <DatePicker value={f.get(`${d.key}-from`) ? new Date(f.get(`${d.key}-from`)) : undefined} onChange={(date) => f.setFilter(`${d.key}-from`, date ? iso(date) : "")} placeholder={`${d.label}: depois de..`} className="w-full sm:w-max" disabledDates={[]} />
              <DatePicker value={f.get(`${d.key}-to`) ? new Date(f.get(`${d.key}-to`)) : undefined} onChange={(date) => f.setFilter(`${d.key}-to`, date ? iso(date) : "")} placeholder={`${d.label}: antes de..`} className="w-full sm:w-max" disabledDates={[]} />
            </div>
          ))}
        </div>
      )}

      {f.activeCount > 0 && (
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <Button size="sm" variant="outline" onClick={f.clear} className="h-10 text-destructive hover:text-destructive w-full sm:w-auto">
            <Icon name="X" className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          {total !== undefined && <span className="text-xs text-muted-foreground">{shown} de {total} registos</span>}
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
  /** Acções da barra de filtros (ex.: exportar). */
  toolbar?: ReactNode;
  /** Rota de detalhe ao duplo clique. */
  route?: string;
  skeletonCols?: number;
}

/**
 * Lista padrão MindSchool seguindo o padrão MindGest: barra de filtros (tudo na URL), `GenericTable` com paginação e os
 * estados skeleton / erro / vazio. Filtra, ordena e pagina no cliente.
 */
export function DataList<T extends { id: string }>({
  prefix, rows, columns, isLoading, isError, refetch, searchPlaceholder = "Pesquisar...", searchText,
  filters = [], dateFilters = [], sorts = [], pageSize = 10, emptyTitle = "Sem resultados", emptyDescription = "Não existem registos para os filtros aplicados.",
  emptyIcon = "Inbox", toolbar, route, skeletonCols,
}: DataListProps<T>) {
  const keys = useMemo(() => filterKeysOf(filters, dateFilters), [filters, dateFilters]);
  const f = useListFilters(prefix, keys, pageSize);
  const processed = useMemo(() => applyListFilters(rows, f, { searchText, filters, dateFilters, sorts }), [rows, f, searchText, filters, dateFilters, sorts]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const page = Math.min(f.page, totalPages);
  const pageRows = processed.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = filters.length + dateFilters.length + sorts.length > 0 || Boolean(searchText);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <ListSkeleton cols={skeletonCols ?? Math.min(columns.length, 6)} rows={5} />
      </div>
    );
  }

  if (isError) return <RequestError refetch={refetch ?? (() => undefined)} message="Erro ao carregar os dados" />;

  return (
    <div className="mt-6 space-y-6">
      {hasFilters && (
        <ListFilterBar<T> prefix={prefix} f={f} searchPlaceholder={searchPlaceholder} searchable={Boolean(searchText)} filters={filters} dateFilters={dateFilters} sorts={sorts} toolbar={toolbar} shown={processed.length} total={rows.length} />
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
          {...(route ? { route } : {})}
        />
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
      )}
    </div>
  );
}

export type { Column };
