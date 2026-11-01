"use client";

import { useMemo, useState, type ReactNode } from "react";
import { icons } from "lucide-react";
import { Button, DatePicker } from "@/components/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/common/empty-state";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { Icon } from "@/components/common/icon";
import { RequestError } from "@/components/common/request-error";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { ListSkeleton } from "@/components/common/skeletons/list-skeleton";
import { FilterBarSkeleton } from "@/components/common/skeletons/filter-bar-skeleton";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { useListFilters, type ListFiltersState } from "@/hooks/common/use-list-filters";
import { cn } from "@/lib/utils";
import { normalize } from "@/utils/normalize-string";

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
  // sem acentos nem maiúsculas: «ângelo» encontra «Angelo» e vice-versa
  const q = normalize(f.search.trim());
  if (q && defs.searchText) out = out.filter((r) => normalize(defs.searchText!(r)).includes(q));
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

/** Barra de filtros padrão MindGest: em Desktop usa FilterPopovers inline; em Mobile abre um Bottom Sheet Drawer com rascunho (draft vs applied). */
export function ListFilterBar<T>({ prefix, f, searchPlaceholder = "Pesquisar...", searchable = true, filters = [], dateFilters = [], sorts = [], toolbar, shown, total }: ListFilterBarProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const hasSheetControls = filters.length + dateFilters.length + sorts.length > 0;

  const buildCurrentDraft = () => {
    const next: Record<string, string> = {
      sort: f.sort,
      order: f.order,
    };
    for (const def of filters) next[def.key] = f.get(def.key);
    for (const d of dateFilters) {
      next[`${d.key}-from`] = f.get(`${d.key}-from`);
      next[`${d.key}-to`] = f.get(`${d.key}-to`);
    }
    return next;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(buildCurrentDraft());
    }
    setOpen(nextOpen);
  };

  const handleResetDraft = () => {
    const empty: Record<string, string> = { sort: "", order: "asc" };
    for (const def of filters) empty[def.key] = "";
    for (const d of dateFilters) {
      empty[`${d.key}-from`] = "";
      empty[`${d.key}-to`] = "";
    }
    setDraft(empty);
  };

  const handleApplyDraft = () => {
    f.setBatch(draft);
    setOpen(false);
  };

  const draftActiveCount = Object.entries(draft).filter(
    ([k, v]) => k !== "order" && Boolean(v)
  ).length;

  const appliedSheetCount =
    filters.filter((def) => Boolean(f.get(def.key))).length +
    dateFilters.reduce(
      (acc, d) =>
        acc +
        (f.get(`${d.key}-from`) ? 1 : 0) +
        (f.get(`${d.key}-to`) ? 1 : 0),
      0
    ) +
    (f.sort ? 1 : 0);

  return (
    <div className="w-full flex flex-col gap-3 px-2 sm:px-0" data-tour={`${prefix}-filters`}>
      {/* MOBILE BAR: Pesquisa + Botão de Drawer Inferior */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        <div className="flex items-center gap-2">
          {searchable && (
            <SearchHandlerWrapper
              search={f.search}
              setSearch={f.setSearch}
              className="flex-1 min-w-0"
              placeholder={searchPlaceholder}
            />
          )}
          {hasSheetControls && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(true)}
              className={cn(
                "h-10 shrink-0 gap-2 rounded-xs px-3.5 font-medium",
                !searchable && "w-full justify-between"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon name="SlidersHorizontal" className="size-4 text-primary" />
                <span>Filtros</span>
              </span>
              {appliedSheetCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {appliedSheetCount}
                </span>
              )}
            </Button>
          )}
        </div>
        {toolbar && <div className="w-full [&>*]:w-full">{toolbar}</div>}
      </div>

      {/* MOBILE BOTTOM SHEET DRAWER */}
      {hasSheetControls && (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] flex flex-col gap-0 p-0 rounded-t-xl border-t sm:hidden"
          >
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
            <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3 space-y-0">
              <button
                type="button"
                onClick={handleResetDraft}
                disabled={draftActiveCount === 0}
                className="text-xs font-medium text-destructive transition-opacity hover:underline disabled:opacity-40"
              >
                Repor
              </button>
              <SheetTitle className="text-base font-semibold text-foreground">
                Filtros
              </SheetTitle>
              <div className="w-10" aria-hidden="true" />
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
              {/* Intervalos de Datas */}
              {dateFilters.map((d) => (
                <div key={d.key} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{d.label}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <DatePicker
                      value={draft[`${d.key}-from`] ? new Date(draft[`${d.key}-from`]) : undefined}
                      onChange={(date) =>
                        setDraft((prev) => ({ ...prev, [`${d.key}-from`]: date ? iso(date) : "" }))
                      }
                      placeholder="De..."
                      className="w-full"
                      disabledDates={[]}
                    />
                    <DatePicker
                      value={draft[`${d.key}-to`] ? new Date(draft[`${d.key}-to`]) : undefined}
                      onChange={(date) =>
                        setDraft((prev) => ({ ...prev, [`${d.key}-to`]: date ? iso(date) : "" }))
                      }
                      placeholder="Até..."
                      className="w-full"
                      disabledDates={[]}
                    />
                  </div>
                </div>
              ))}

              {/* Filtros de Categoria / Estado (Pills interactivos) */}
              {filters.map((def) => {
                const selectedVal = draft[def.key] ?? "";
                return (
                  <div key={def.key} className="space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Icon name={def.icon} className="size-3.5 text-muted-foreground" />
                      {def.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {def.options.map((opt) => {
                        const active = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                [def.key]: active ? "" : opt.value,
                              }))
                            }
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground hover:bg-muted/60"
                            )}
                          >
                            <span>{opt.label}</span>
                            {active && <Icon name="Check" className="size-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Ordenação (Radio List estilo Sort Sheet) */}
              {sorts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Ordenar por</p>
                    {draft["sort"] && (
                      <div className="inline-flex rounded-xs border border-border p-0.5 bg-muted/30">
                        <button
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, order: "asc" }))}
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-medium rounded-xs transition-colors",
                            draft["order"] === "asc"
                              ? "bg-background text-foreground shadow-2xs"
                              : "text-muted-foreground"
                          )}
                        >
                          Crescente
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, order: "desc" }))}
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-medium rounded-xs transition-colors",
                            draft["order"] === "desc"
                              ? "bg-background text-foreground shadow-2xs"
                              : "text-muted-foreground"
                          )}
                        >
                          Decrescente
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="divide-y divide-border/60 rounded-xs border border-border bg-card">
                    {sorts.map((s) => {
                      const isSelected = draft["sort"] === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              sort: isSelected ? "" : s.value,
                            }))
                          }
                          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                        >
                          <span>{s.label}</span>
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-[5px] border-foreground"
                                : "border-muted-foreground/40"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDraft}
                disabled={draftActiveCount === 0}
                className="h-10 w-full rounded-xs text-xs font-medium"
              >
                Limpar tudo
              </Button>
              <Button
                type="button"
                onClick={handleApplyDraft}
                className="h-10 w-full rounded-xs text-xs font-semibold"
              >
                {draftActiveCount > 0 ? `Aplicar (${draftActiveCount})` : "Aplicar"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* DESKTOP BAR: Pesquisa + Popovers Inline */}
      <div className="hidden sm:flex sm:flex-row sm:flex-wrap sm:items-center gap-3">
        {searchable && (
          <SearchHandlerWrapper
            search={f.search}
            setSearch={f.setSearch}
            className="w-auto min-w-64 flex-1"
            placeholder={searchPlaceholder}
          />
        )}
        {filters.map((def) => (
          <FilterPopover
            key={def.key}
            icon={def.icon}
            label={def.label}
            options={def.options}
            value={f.get(def.key) || null}
            onChange={(v) => f.setFilter(def.key, v)}
          />
        ))}
        {sorts.length > 0 && (
          <>
            <FilterPopover
              icon="List"
              label="Ordenar por"
              options={sorts.map((s) => ({ value: s.value, label: s.label }))}
              value={f.sort || null}
              onChange={(v) => f.setSort(v)}
            />
            <FilterPopover
              icon="ArrowDownUp"
              label="Ordem"
              options={[
                { value: "asc", label: "Crescente" },
                { value: "desc", label: "Decrescente" },
              ]}
              value={f.sort ? f.order : null}
              onChange={(v) => {
                if (v && v !== f.order) f.toggleOrder();
              }}
            />
          </>
        )}
        {toolbar && <div>{toolbar}</div>}
      </div>

      {dateFilters.length > 0 && (
        <div className="hidden sm:flex flex-row gap-3 flex-wrap">
          {dateFilters.map((d) => (
            <div key={d.key} className="flex flex-row gap-3">
              <DatePicker
                value={f.get(`${d.key}-from`) ? new Date(f.get(`${d.key}-from`)) : undefined}
                onChange={(date) => f.setFilter(`${d.key}-from`, date ? iso(date) : "")}
                placeholder={`${d.label}: depois de..`}
                className="w-max"
                disabledDates={[]}
              />
              <DatePicker
                value={f.get(`${d.key}-to`) ? new Date(f.get(`${d.key}-to`)) : undefined}
                onChange={(date) => f.setFilter(`${d.key}-to`, date ? iso(date) : "")}
                placeholder={`${d.label}: antes de..`}
                className="w-max"
                disabledDates={[]}
              />
            </div>
          ))}
        </div>
      )}

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
  prefix, rows, columns, isLoading, isError, refetch, searchPlaceholder = "Pesquisar...", searchText,
  filters = [], dateFilters = [], sorts = [], pageSize = 10, emptyTitle = "Sem resultados", emptyDescription = "Não existem registos para os filtros aplicados.",
  emptyIcon = "Inbox", toolbar, route, skeletonCols, selectable, selectedIds, onSelectChange,
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
        {hasFilters && (
          <FilterBarSkeleton
            filterCount={Math.min(filters.length, 4)}
            hasSort={sorts.length > 0}
            searchable={Boolean(searchText)}
          />
        )}
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
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectChange={onSelectChange}
          {...(route ? { route } : {})}
        />
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
      )}
    </div>
  );
}

export type { Column };
