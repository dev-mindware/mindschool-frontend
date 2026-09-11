"use client";

import { Button, DatePicker, Input } from "@/components/ui";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useURLSearchParams } from "@/hooks/common";
import { useCreditNotesFilters } from "@/hooks/credit-notes";

export function CreditNotesFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useCreditNotesFilters();
  const { search, setSearch } = useURLSearchParams("search-credit-note");

  const hasFilter =
    !!filters.reason ||
    !!filters.sortBy ||
    !!filters.sortOrder ||
    !!filters.creditNoteNumber ||
    !!filters.endDate ||
    !!filters.startDate;
  search.length > 0

  return (
    <div className="w-full flex flex-col gap-4">
      <SearchHandlerWrapper
        search={search}
        setSearch={setSearch}
        className="flex flex-col sm:flex-row"
      >
        <Input
          placeholder="Nº da Nota"
          value={filters.creditNoteNumber || ""}
          onChange={(e) => setFilters({ creditNoteNumber: e.target.value })}
        />
      </SearchHandlerWrapper>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-2">
        <DatePicker
          value={filters.startDate ? new Date(filters.startDate) : undefined}
          onChange={(date) => setFilters({ startDate: date?.toISOString() })}
          placeholder="Data de fim"
          className="w-full sm:w-max"
        />
        <DatePicker
          value={filters.endDate ? new Date(filters.endDate) : undefined}
          onChange={(date) => setFilters({ endDate: date?.toISOString() })}
          placeholder="Data de inicio"
          className="w-full sm:w-max"
        />

        <FilterPopover
          icon="FileMinus"
          label="Motivo"
          value={filters.reason}
          options={[
            { label: "Rectificação", value: "CORRECTION" },
            { label: "Devolução", value: "RETURN" },
            { label: "Desconto", value: "DISCOUNT" },
            { label: "Anulação", value: "ANNULMENT" },
          ]}
          onChange={(reason) => setFilters({ reason })}
        />

        <FilterPopover
          icon="List"
          label="Ordenar por"
          value={filters.sortBy}
          onChange={(sortBy) => setFilters({ sortBy })}
          options={[
            { value: "createdAt", label: "Mais Recente" },
            { value: "updatedAt", label: "Mais Antigo" },
          ]}
        />

        <FilterPopover
          label="Ordem"
          icon="ArrowDownUp"
          options={[
            { value: "asc", label: "ASC" },
            { value: "desc", label: "DESC" },
          ]}
          value={filters.sortOrder}
          onChange={(sortOrder) => setFilters({ sortOrder })}
        />

        {hasFilter && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllFilters}
            className="h-10 text-destructive hover:text-destructive"
          >
            <Icon name="X" className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
