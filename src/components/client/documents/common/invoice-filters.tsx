"use client";

import { Button, DatePicker, Input } from "@/components/ui";
import { invoiceByOption, invoiceStatusOptions } from "@/constants";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useInvoiceFilters, useURLSearchParams } from "@/hooks";
import { InvoiceStatus } from "@/types";

type InvoiceType = "invoice" | "proforma" | "invoice-receipt" | "receipt";

type Props = {
  type: InvoiceType;
};

export function InvoiceFiltersTSX({ type }: Props) {
  const prefix = type;
  const { filters, setFilters, clearAllFilters } = useInvoiceFilters(prefix);
  const { search, setSearch } = useURLSearchParams(`search_${prefix}`);

  const hasFilter =
    !!filters.status ||
    !!filters.sortBy ||
    !!filters.sortOrder ||
    !!filters.invoiceNumber ||
    !!filters.clientName ||
    !!filters.startDate ||
    !!filters.endDate ||
    search.length > 0;

  const showStatusFilter = type === "invoice";

  const handleClear = () => {
    void setSearch("");
    clearAllFilters();
  };

  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-0" data-tour="documents-filters">
      {/* Linha 1: pesquisa + popovers (mesmo padrão de clientes/itens) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-baseline">
        <SearchHandlerWrapper
          search={search}
          setSearch={setSearch}
          className="w-full"
          placeholder="Pesquise por cliente ou nº da Factura"
        />

        {showStatusFilter && (
          <FilterPopover
            icon="Tag"
            label="Status"
            value={filters.status}
            options={invoiceStatusOptions}
            onChange={(status) => setFilters({ status: status as InvoiceStatus })}
          />
        )}

        <FilterPopover
          icon="List"
          label="Ordenar por"
          options={invoiceByOption}
          value={filters.sortBy}
          onChange={(sortBy) => setFilters({ sortBy })}
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
      </div>

      {/* Linha 2: filtros secundários agrupados à esquerda */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start sm:items-center gap-3">
        <div className="w-full sm:w-[200px] shrink-0">
          <Input
            type="search"
            placeholder="Cliente"
            value={filters.clientName ?? ""}
            onChange={(e) => setFilters({ clientName: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="w-full sm:w-[180px] shrink-0">
          <Input
            type="search"
            placeholder="N.º da factura"
            value={filters.invoiceNumber ?? ""}
            onChange={(e) => setFilters({ invoiceNumber: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <DatePicker
            value={filters.startDate ? new Date(filters.startDate) : undefined}
            onChange={(_, formatted) => setFilters({ startDate: formatted })}
            placeholder="Data Início"
            className="w-full sm:w-max"
          />
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <DatePicker
            value={filters.endDate ? new Date(filters.endDate) : undefined}
            onChange={(_, formatted) => setFilters({ endDate: formatted })}
            placeholder="Data Fim"
            className="w-full sm:w-max"
          />
        </div>
      </div>

      {hasFilter && (
        <div className="flex justify-center sm:justify-start">
          <Button
            data-tour="documents-filter-clear"
            size="sm"
            variant="outline"
            onClick={handleClear}
            className="h-10 text-destructive hover:text-destructive w-full sm:w-auto"
          >
            <Icon name="X" className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
