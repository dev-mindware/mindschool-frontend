"use client";
import { Button, DatePicker, Input } from "@/components/ui";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useItemsFilters } from "@/hooks/items/use-items-filters";
import { useURLSearchParams } from "@/hooks/common";

export function SupplierItemsFiltersTSX({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { filters, setFilters, clearAllFilters } =
    useItemsFilters("supplier_items");
  const { search, setSearch } = useURLSearchParams("search_supplier_items");

  const hasFilter =
    filters.status ||
    filters.sortBy ||
    filters.sortOrder ||
    filters.createdAfter ||
    filters.createdBefore ||
    search.length > 0;

  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-0 mb-4">
      {children && (
        <div className="w-full justify-end sm:w-auto">{children}</div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <SearchHandlerWrapper
          search={search || ""}
          setSearch={setSearch}
          className="w-full"
          placeholder="Pesquisar itens"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <FilterPopover
          icon="Activity"
          label="Status"
          options={[
            { value: "ACTIVE", label: "Ativo" },
            { value: "INACTIVE", label: "Inativo" },
            { value: "OUT_OF_STOCK", label: "Sem stock" },
          ]}
          value={filters.status}
          onChange={(status) => setFilters({ status: status as any })}
        />

        <FilterPopover
          icon="ArrowDownUp"
          label="Ordenar por"
          options={[
            { value: "name", label: "Nome" },
            { value: "sku", label: "SKU" },
            { value: "price", label: "Preço", },
            { value: "createdAt", label: "Data Criação" },
            { value: "updatedAt", label: "Data de actualização" },
          ]}
          value={filters.sortBy}
          onChange={(sortBy) => setFilters({ sortBy })}
        />

        <FilterPopover
          label="Ordem"
          icon="ListFilter"
          options={[
            { value: "asc", label: "ASC" },
            { value: "desc", label: "DESC" },
          ]}
          value={filters.sortOrder}
          onChange={(sortOrder) => setFilters({ sortOrder })}
        />

        <DatePicker
          placeholder="Criado antes de.."
          className="w-full h-10"
          value={
            filters.createdBefore ? new Date(filters.createdBefore) : undefined
          }
          onChange={(_, formatted) => setFilters({ createdBefore: formatted })}
        />

        <DatePicker
          placeholder="Criado depois de.."
          className="w-full h-10"
          value={
            filters.createdAfter ? new Date(filters.createdAfter) : undefined
          }
          onChange={(_, formatted) => setFilters({ createdAfter: formatted })}
        />

        <Input
          placeholder="Preço mínimo"
          value={(filters.minPrice as string) ?? ""}
          onChange={(e) => setFilters({ minPrice: e.target.value })}
          className="w-full"
        />

        <Input
          placeholder="Preço máximo"
          value={(filters.maxPrice as string) ?? ""}
          onChange={(e) => setFilters({ maxPrice: e.target.value })}
          className="w-full"
        />
      </div>

      {hasFilter && (
        <div className="flex justify-center sm:justify-start">
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllFilters}
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
