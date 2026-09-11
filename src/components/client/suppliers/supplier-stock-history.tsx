"use client";

import { useMemo } from "react";
import { useGetSupplierStockEntries } from "@/hooks/entities/use-suppliers";
import {
  Card,
  CardContent,
  ListSkeleton,
  RequestError,
  EmptyState,
  Icon,
} from "@/components";
import { formatCurrency, formatDate } from "@/utils";
import { MetricCard } from "./metric-stock-card";
import { GenericTable, type Column } from "@/components/common/generic-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StockEntry, StockEntryItem } from "@/types";

type FlattenedItem = StockEntryItem & { entry: StockEntry };


function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border shadow-none">
          <CardContent className="p-4">
            <div className="h-3 w-20 rounded bg-muted animate-pulse mb-2" />
            <div className="h-6 w-28 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SupplierStockHistory({ supplierId }: { supplierId: string }) {
  const {
    data: entries,
    isLoading,
    isError,
    refetch,
    page,
    totalPages,
    total,
    goToNextPage,
    goToPreviousPage,
    setPage,
  } = useGetSupplierStockEntries(supplierId);

  const summary = useMemo(() => {
    const totalAmount = entries.reduce((sum, e) => sum + e.totalAmount, 0);
    const totalItems = entries.reduce((sum, e) => sum + e.items.length, 0);
    const uniqueProducts = new Set(
      entries.flatMap((e) => e.items.map((i) => i.itemsId)),
    ).size;
    return { totalAmount, totalItems, uniqueProducts };
  }, [entries]);
  const totalQuantity = useMemo(() => {
    return entries.reduce((sum, e) => sum + e.items.reduce((sum, i) => sum + i.quantity, 0), 0);
  }, [entries]);

  const flattenedItems = useMemo<FlattenedItem[]>(() => {
    return entries.flatMap((entry) =>
      entry.items.map((item) => ({
        ...item,
        entry,
      }))
    );
  }, [entries]);

  const columns: Column<FlattenedItem>[] = useMemo(
    () => [
      {
        key: "entry.number",
        header: "Factura",
        render: (_, row) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-medium text-foreground">{row.entry.number ?? "N/A"}</span>
          </div>
        ),
      },
      {
        key: "item.name",
        header: "Produto",
        render: (_, row) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{row.item.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.item.sku}</span>
          </div>
        ),
      },
      {
        key: "entry.entryDate",
        header: "Data",
        render: (_, row) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground text-sm">
            <span>{formatDate(row.entry.entryDate)}</span>
          </div>
        ),
      },
      {
        key: "entry.store.name",
        header: "Loja",
        render: (_, row) => (
          <Badge variant="secondary" className="whitespace-nowrap font-normal">
            <Icon name="Store" className="w-3 h-3 mr-1" />
            {row.entry.store.name}
          </Badge>
        ),
      },
      {
        key: "quantity",
        header: "Qtd.",
        className: "text-center",
        render: (val) => (
          <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
            ×{val}
          </Badge>
        ),
      },
      {
        key: "costAtEntry",
        header: "Custo/Und.",
        className: "text-right",
        render: (val) => (
          <span className="font-semibold whitespace-nowrap">{formatCurrency(val)}</span>
        ),
      },
      {
        key: "previousCost",
        header: "Custo Anterior",
        className: "text-right",
        render: (_, row) => {
          const diff = row.costAtEntry - row.previousCost;
          const isUp = diff > 0;
          const isDown = diff < 0;
          return (
            <div className="flex flex-col items-end gap-0.5 whitespace-nowrap">
              <span className="text-muted-foreground text-xs">{formatCurrency(row.previousCost)}</span>
              {diff !== 0 && (
                <span
                  className={cn(
                    "text-xs font-semibold flex items-center gap-0.5",
                    isUp && "text-red-500 dark:text-red-400",
                    isDown && "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <Icon name={isUp ? "TrendingUp" : "TrendingDown"} className="w-3 h-3" />
                  {isUp ? "+" : ""}
                  {formatCurrency(Math.abs(diff))}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "total",
        header: "Total",
        className: "text-right font-bold text-foreground whitespace-nowrap",
        render: (_, row) => formatCurrency(row.costAtEntry * row.quantity),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SummarySkeleton />
        <ListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError
        message="Erro ao carregar o histórico de entradas de stock"
        refetch={refetch}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="PackageSearch"
        title="Sem entradas de stock"
        description="Ainda não foram registadas entradas de stock para este fornecedor."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-tour="supplier-history-summary">
        <MetricCard
          icon="Receipt"
          label="Entradas"
          value={entries.length}
          sub={`${total} registos no total`}
        />
        <MetricCard
          icon="DollarSign"
          label="Valor"

          value={formatCurrency(summary.totalAmount)}
          sub="Soma financeira das entradas"
        />
        <MetricCard
          icon="Package"
          label="Linhas de produto"
          value={totalQuantity}
          sub="Soma de todas as quantidades"
        />
        <MetricCard
          icon="Layers"
          label="Produtos distintos"
          value={summary.uniqueProducts}
          sub="Tipos de produtos cadastrados"
        />
      </div>

      <div data-tour="supplier-history-list">
        <GenericTable
          page={page}
          total={total}
          columns={columns}
          setPage={setPage}
          data={flattenedItems}
          totalPages={totalPages}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhuma entrada registada."
        />
      </div>
    </div>
  );
}
