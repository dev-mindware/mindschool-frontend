"use client";
import { Button } from "@/components/ui";
import { FilterPopover } from "@/components/shared";
import { useURLSearchParams } from "@/hooks/common";
import { usersByOption, categoryStatusOptions } from "@/constants";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { useStoresFilters } from "@/hooks/entities/stores-filters";

export function StoresFiltersTSX() {
  const { search, setSearch } = useURLSearchParams("search");
  const { filters, setFilters, clearAllFilters } = useStoresFilters();

  const hasFilter =
    filters.status || filters.sortBy || filters.sortOrder || (search && search.length > 0);

  return (
    <SearchHandlerWrapper
      search={search || ""}
      setSearch={setSearch}
      className="flex flex-col sm:flex-row"
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-2">
        <FilterPopover
          icon="Tag"
          label="Status"
          options={categoryStatusOptions}
          value={filters.status}
          onChange={(status) => setFilters({ status })}
        />

        <FilterPopover
          icon="List"
          label="Ordenar por"
          options={usersByOption}
          value={filters.sortBy}
          onChange={(sortBy) => setFilters({ sortBy })}
        />

        <FilterPopover
          label="Sortear por"
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
    </SearchHandlerWrapper>
  );
}