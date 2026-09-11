"use client";
import { Button, Input } from "@/components/ui";
import { useStockFilters } from "@/hooks/stock";
import { Icon } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useGetStores } from "@/hooks/entities";
import { useGetItems } from "@/hooks/stock/use-items";
import { useState } from "react";

const sortByOptions = [
  { label: "Quantidade", value: "quantity" },
  { label: "Disponível", value: "available" },
  { label: "Reservado", value: "reserved" },
  { label: "Data de Criação", value: "createdAt" },
  { label: "Data de actualização", value: "updatedAt" },
];

const sortOrderOptions = [
  { label: "Crescente", value: "asc" },
  { label: "Decrescente", value: "desc" },
];

const booleanOptions = [
  { label: "Todos", value: "" },
  { label: "Sim", value: "true" },
  { label: "Não", value: "false" },
];

import { ItemsFiltersSkeleton } from "@/components";

export function StockFilters() {
  const { items, isLoading: itemsLoading } = useGetItems();
  const { stores, isLoading: storesLoading } = useGetStores();
  const { filters, setFilters, clearAllFilters } = useStockFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isLoading = itemsLoading || storesLoading;

  if (isLoading) return <ItemsFiltersSkeleton />;

  const hasFilter = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPopover
          icon="Package"
          label="Produto"
          options={items}
          value={filters.itemsId}
          onChange={(itemsId) => setFilters({ itemsId })}
        />

        <FilterPopover
          icon="Store"
          label="Loja"
          options={stores}
          value={filters.storeId}
          onChange={(storeId) => setFilters({ storeId })}
        />

        <FilterPopover
          icon="List"
          label="Ordenar por"
          value={filters.sortBy}
          options={sortByOptions}
          onChange={(sortBy) => setFilters({ sortBy })}
        />

        <FilterPopover
          label="Ordem"
          icon="ArrowDownUp"
          options={sortOrderOptions}
          value={filters.sortOrder}
          onChange={(sortOrder) => setFilters({ sortOrder })}
        />

        <FilterPopover
          icon="Archive"
          label="Stock baixo"
          options={booleanOptions}
          value={
            filters.lowStock === true
              ? "true"
              : filters.lowStock === false
                ? "false"
                : ""
          }
          onChange={(value) => {
            const lowStock =
              value === "true" ? true : value === "false" ? false : undefined;
            setFilters({ lowStock });
          }}
        />

        <FilterPopover
          icon="CircleAlert"
          label="Sem stock"
          options={booleanOptions}
          value={
            filters.outOfStock === true
              ? "true"
              : filters.outOfStock === false
                ? "false"
                : ""
          }
          onChange={(value) => {
            const outOfStock =
              value === "true" ? true : value === "false" ? false : undefined;
            setFilters({ outOfStock });
          }}
        />

        <FilterPopover
          icon="Package2"
          label="Tem Reservado"
          options={booleanOptions}
          value={
            filters.hasReserved === true
              ? "true"
              : filters.hasReserved === false
                ? "false"
                : ""
          }
          onChange={(value) => {
            const hasReserved =
              value === "true" ? true : value === "false" ? false : undefined;
            setFilters({ hasReserved });
          }}
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-10"
        >
          <Icon
            name={showAdvanced ? "ChevronUp" : "ChevronDown"}
            className="w-4 h-4 mr-2"
          />
          Filtros Avançados
        </Button>

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

      {showAdvanced && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade Mínima</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minQuantity || ""}
              onChange={(e) =>
                setFilters({
                  minQuantity: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade Máxima</label>
            <Input
              type="number"
              placeholder="100"
              value={filters.maxQuantity || ""}
              onChange={(e) =>
                setFilters({
                  maxQuantity: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disponível Mínimo</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minAvailable || ""}
              onChange={(e) =>
                setFilters({
                  minAvailable: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disponível Máximo</label>
            <Input
              type="number"
              placeholder="100"
              value={filters.maxAvailable || ""}
              onChange={(e) =>
                setFilters({
                  maxAvailable: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Criado Após</label>
            <Input
              type="date"
              value={filters.createdAfter || ""}
              onChange={(e) =>
                setFilters({ createdAfter: e.target.value || undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Criado Antes</label>
            <Input
              type="date"
              value={filters.createdBefore || ""}
              onChange={(e) =>
                setFilters({ createdBefore: e.target.value || undefined })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
