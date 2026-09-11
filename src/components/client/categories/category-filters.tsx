"use client";
import { Button } from "@/components/ui";
import { useCategoryFilters } from "@/hooks";
import {
  categorySortByOption,
  categorySortOrderOption,
  categoryStatusOptions,
} from "@/constants";
import { Icon, SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useURLSearchParams } from "@/hooks/common";

export function CategoriesFilters() {
  const { filters, setFilters, clearAllFilters } = useCategoryFilters();
  const { search, setSearch } = useURLSearchParams("search-category");

  const hasFilter =
    filters.isActive ||
    filters.sortBy ||
    filters.sortOrder ||
    search.length > 0;

  return (
    <SearchHandlerWrapper
      search={search}
      setSearch={setSearch}
      className="flex flex-col sm:flex-row"
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-2">
        <FilterPopover
          icon="Tag"
          label="Status"
          options={categoryStatusOptions}
          value={filters.isActive}
          onChange={(isActive) => setFilters({ isActive })}
        />

        <FilterPopover
          icon="List"
          label="Ordenar por"
          options={categorySortByOption}
          value={filters.sortBy}
          onChange={(sortBy) => setFilters({ sortBy })}
        />

        <FilterPopover
          label="Ordem"
          icon="ListOrdered"
          options={categorySortOrderOption}
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
