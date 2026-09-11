"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  EmptyState,
  Badge,
  Button,
  Icon,
  ItemPaginationControls,
} from "@/components";
import { ButtonOnlyAction } from "@/components/common/button-actions";
import { StockResponse } from "@/types/stock";
import { formatDateTime, formatCurrency } from "@/utils";
import { useDebounce } from "use-debounce";
import { useStockFilters, useStockActions } from "@/hooks/stock";
import { StockFilters } from "./stock-filters";
import {
  StockModal,
  DetailsStockModal,
  DeleteStockModal,
  AdjustStockModal,
  ReserveStockModal,
  UnreserveStockModal,
} from "./stock-modals";
import { useModal } from "@/stores";
import { useAuth } from "@/hooks/auth";

export function StockList() {
  const { user } = useAuth();
  const currentPlan = user?.company?.subscription?.plan?.name;
  const isSmartPlan = currentPlan === "Smart";

  const { search } = useURLSearchParams("search");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useStockFilters();
  const { openModal } = useModal();
  const {
    handlerDetailsStock,
    handlerEditStock,
    handlerDeleteStock,
    handlerAdjustStock,
    handlerReserveStock,
    handlerUnreserveStock,
  } = useStockActions();

  const {
    data: stock,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<StockResponse>({
    endpoint: "/stocks",
    queryKey: ["stocks"],
    queryParams: {
      ...filters,
      page,
      limit: 20,
      includeItem: true,
      includeStore: true,
    },
  });

  const getStockLevelBadge = (level: string) => {
    const variants: Record<string, "success" | "secondary" | "destructive"> = {
      IN_STOCK: "success",
      LOW_STOCK: "secondary",
      OUT_OF_STOCK: "destructive",
    };

    const labels: Record<string, string> = {
      IN_STOCK: "Em stock",
      LOW_STOCK: "Stock baixo",
      OUT_OF_STOCK: "Sem stock",
    };

    return (
      <Badge variant={variants[level] || "default"}>
        {labels[level] || level}
      </Badge>
    );
  };

  const columns: Column<StockResponse>[] = [
    {
      key: "item",
      header: "Produto",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.item?.name || "N/A"}</span>
          {item.item?.sku && (
            <span className="text-xs text-muted-foreground">
              SKU: {item.item.sku}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "store",
      header: "Loja",
      render: (_, item) => (
        <span className="text-sm">{item.store?.name || "N/A"}</span>
      ),
    },
    {
      key: "quantity",
      header: "Quantidade",
      render: (_, item) => <span className="font-medium">{item.quantity}</span>,
    },
    {
      key: "available",
      header: "Disponível",
      render: (_, item) => (
        <span className="text-green-600 font-medium">{item.available}</span>
      ),
    },
    {
      key: "reserved",
      header: "Reservado",
      render: (_, item) => (
        <span className="text-orange-600 font-medium">{item.reserved}</span>
      ),
    },
    {
      key: "stockLevel",
      header: "Nível",
      render: (_, item) => getStockLevelBadge(item.stockLevel),
    },
    {
      key: "price",
      header: "Preço",
      render: (_, item) => (
        <span className="text-sm">
          {item.item?.price ? formatCurrency(item.item.price) : "N/A"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Última actualização",
      render: (_, item) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(item.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acções",
      render: (_, item) => {
        const baseActions: any[] = [
          {
            label: "Ver Detalhes",
            onClick: handlerDetailsStock,
            icon: "Eye" as const,
            variant: "default" as const,
          },
          {
            label: "Apagar",
            onClick: handlerDeleteStock,
            variant: "destructive" as const,
            icon: "Trash2" as const,
          },
          { type: "separator" as const },
          {
            label: "Ajustar Stock",
            onClick: handlerAdjustStock,
            icon: "SlidersHorizontal" as const,
            variant: "default" as const,
          },
        ];

        if (!isSmartPlan) {
          baseActions.push(
            { type: "separator" as const },
            {
              label: "Reservar",
              onClick: handlerReserveStock,
              icon: "CircleArrowUp" as const,
              variant: "default" as const,
            },
            {
              label: "Liberar Reserva",
              onClick: handlerUnreserveStock,
              icon: "CircleArrowDown" as const,
              variant: "default" as const,
            }
          );
        }

        return (
          <ButtonOnlyAction
            data={item}
            actions={baseActions}
          />
        );
      },
    },
  ];

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-6" data-tour="stock-filters">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <StockFilters />
        </div>
        <RequestError refetch={refetch} message="Erro ao carregar o stock" />
      </div>
    );
  }

  if (stock?.length === 0)
    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-6" data-tour="stock-filters">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <StockFilters />
        </div>
        <EmptyState
          description="Não foi encontrado nenhum item em stock."
          title="Sem stock"
          icon="Boxes"
        />
      </div>
    );

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border p-6" data-tour="stock-filters">
         {/*  <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <Button onClick={() => openModal("add-stock")} size="sm">
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Adicionar Stock
            </Button>
          </div> */}
          <StockFilters />
        </div>

        <GenericTable<StockResponse>
          page={page}
          data={stock}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Não foi encontrado nenhum item em stock."
        />

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <ItemPaginationControls
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <StockModal />
      <DetailsStockModal />
      <DeleteStockModal />
      <AdjustStockModal />
      <ReserveStockModal />
      <UnreserveStockModal />
    </>
  );
}
