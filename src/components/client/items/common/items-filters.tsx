"use client";
import { Button, Input } from "@/components/ui";
import { useAuth, useGetCategories, useItemsFilters } from "@/hooks";
import { ItemStatus } from "@/types/items";
import {
  itemsByOption,
  itemsOrderOption,
  itemsStatusOptions,
} from "@/constants";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { PaginatedSelect } from "@/components/shared/filters/paginated-select";
import { useURLSearchParams } from "@/hooks/common";
import { useGetSuppliersSelect } from "@/hooks/entities/use-suppliers";
import { PLAN_HIERARCHY, PlanType } from "@/types/subscription";

export function ItemsFiltersTSX({ prefix }: { prefix: string }) {
  const { user } = useAuth();
  const { filters, setFilters, clearAllFilters } = useItemsFilters(prefix);
  const { search, setSearch } = useURLSearchParams(`search_${prefix}`);
  const { categoryOptions, isLoading, isError, refetch, pagination, setPage } =
    useGetCategories();

  const currentPlan = (user?.company?.subscription?.plan.name as PlanType) || "Base";
  const planLevel = PLAN_HIERARCHY[currentPlan] || 0;
  const hasSuppliers =
    user?.company?.subscription?.plan?.features?.hasSuppliers ??
    (planLevel >= PLAN_HIERARCHY.Pro);

  const {
    supplierOptions,
    isLoading: isLoadingSuppliers,
    isError: isErrorSuppliers,
    refetch: refetchSuppliers,
    pagination: paginationSuppliers,
    setPage: setPageSuppliers,
  } = useGetSuppliersSelect(hasSuppliers);

  const hasFilter =
    filters.status ||
    filters.categoryId ||
    filters.supplierId ||
    filters.sortBy ||
    filters.sortOrder ||
    filters.minPrice ||
    filters.maxPrice ||
    search.length > 0;

  if (isError || (hasSuppliers && isErrorSuppliers))
    return (
      <div className="flex items-center gap-2">
        <span className="text-destructive text-sm">
          Erro ao carregar as categorias ou fornecedores
        </span>
        <Button
          variant="outline"
          onClick={() => {
            if (hasSuppliers) refetchSuppliers();
            refetch();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-0" data-tour="items-filters">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-baseline">
        <SearchHandlerWrapper
          search={search}
          setSearch={setSearch}
          className="w-full"
        />
        <PaginatedSelect
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(categoryId) => setFilters({ categoryId })}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          placeholder="Categoria"
        />
        {hasSuppliers && (
          <PaginatedSelect
            options={supplierOptions}
            value={filters.supplierId}
            onChange={(supplierId) => setFilters({ supplierId })}
            isLoading={isLoadingSuppliers}
            pagination={paginationSuppliers}
            onPageChange={setPageSuppliers}
            placeholder="Fornecedor"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <FilterPopover
          icon="Tag"
          label="Status"
          options={itemsStatusOptions}
          value={filters.status}
          onChange={(status) => setFilters({ status: status as ItemStatus })}
        />

        <FilterPopover
          icon="List"
          label="Ordenar por"
          options={itemsByOption}
          value={filters.sortBy}
          onChange={(sortBy) => setFilters({ sortBy })}
        />

        <FilterPopover
          label="Ordem"
          icon="ListOrdered"
          options={itemsOrderOption}
          value={filters.sortOrder}
          onChange={(sortOrder) => setFilters({ sortOrder })}
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
