"use client";

import { DatePicker } from "@/components/ui";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { formatIsoDate, type ListFilterBarProps } from "./types";

/**
 * Vista Desktop da Barra de Filtros (`hidden sm:flex`):
 * Apresenta pesquisa, popovers inline de filtros/ordenação e selectores de datas lado a lado.
 */
export function DesktopFilterBar<T>({
  f,
  searchPlaceholder = "Pesquisar...",
  searchable = true,
  filters = [],
  dateFilters = [],
  sorts = [],
  toolbar,
}: ListFilterBarProps<T>) {
  return (
    <>
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
                onChange={(date) => f.setFilter(`${d.key}-from`, date ? formatIsoDate(date) : "")}
                placeholder={`${d.label}: depois de..`}
                className="w-max"
                disabledDates={[]}
              />
              <DatePicker
                value={f.get(`${d.key}-to`) ? new Date(f.get(`${d.key}-to`)) : undefined}
                onChange={(date) => f.setFilter(`${d.key}-to`, date ? formatIsoDate(date) : "")}
                placeholder={`${d.label}: antes de..`}
                className="w-max"
                disabledDates={[]}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

