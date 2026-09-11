"use client";
import { Button, DatePicker } from "@/components/ui";
import { FilterPopover } from "@/components/shared";
import { useURLSearchParams } from "@/hooks/common";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { useSuppliersFilters } from "@/hooks/entities/suppliers-filters";

export function SupplierFiltersTSX({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { search, setSearch } = useURLSearchParams("search");
  const { filters, setFilters, clearAllFilters } = useSuppliersFilters();

  const hasFilter =
    filters.status ||
    filters.sortBy ||
    filters.sortOrder ||
    filters.createdAfter ||
    filters.createdBefore ||
    search.length > 0;

  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-0">
      {children && (
        <div className="w-full justify-end sm:w-auto">{children}</div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <SearchHandlerWrapper
          search={search || ""}
          setSearch={setSearch}
          className="w-full"
          placeholder="Pesquisar fornecedores"
        />
        <FilterPopover
          icon="Activity"
          label="Status"
          options={[
            { value: "ACTIVE", label: "Ativo" },
            { value: "INACTIVE", label: "Inativo" },
          ]}
          value={filters.status}
          onChange={(status) => setFilters({ status })}
        />

        <FilterPopover
          icon="ArrowDownUp"
          label="Ordenar por"
          options={[
            { value: "name", label: "Nome" },
            { value: "createdAt", label: "Data de Criação" },
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
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <DatePicker
          value={
            filters.createdBefore ? new Date(filters.createdBefore) : undefined
          }
          onChange={(_, formatted) => setFilters({ createdBefore: formatted })}
          placeholder="Criado antes de.."
          className="w-full sm:w-max"
        />

        <DatePicker
          value={
            filters.createdAfter ? new Date(filters.createdAfter) : undefined
          }
          onChange={(_, formatted) => setFilters({ createdAfter: formatted })}
          placeholder="Criado depois de.."
          className="w-full sm:w-max"
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
