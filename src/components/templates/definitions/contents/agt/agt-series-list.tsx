"use client";

import {
  Button,
  Column,
  EmptyState,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
  Badge,
} from "@/components";
import { useAgtActions, useAgtSeries } from "@/hooks/agt";
import type { AgtSeries } from "@/types";
import { RequestSeriesModal } from "./agt-modals";

function calculateProgress(series: AgtSeries) {
  if (!series.lastDocumentNo || series.lastDocumentNo === "999999999999") {
    return 0;
  }

  const lastDocumentNo = Number.parseInt(series.lastDocumentNo, 10);
  if (Number.isNaN(lastDocumentNo) || lastDocumentNo === 0) return 0;
  return Math.min((series.currentSequence / lastDocumentNo) * 100, 100);
}

function isExhausted(series: AgtSeries) {
  if (!series.lastDocumentNo) return false;
  return series.currentSequence >= Number.parseInt(series.lastDocumentNo, 10);
}

export function AgtSeriesList() {
  const { handlerRequestSeries } = useAgtActions();
  const {
    data: series,
    total,
    totalPages,
    page,
    setPage,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = useAgtSeries();

  const columns: Column<AgtSeries>[] = [
    {
      key: "documentType",
      header: "Tipo",
      render: (_, item) => item.documentType,
    },
    {
      key: "seriesCode",
      header: "Código / ano",
      render: (_, item) => (
        <div className="space-y-0.5">
          <p className="font-medium">{item.seriesCode}</p>
          <p className="text-xs text-muted-foreground">{item.seriesYear}</p>
        </div>
      ),
    },
    {
      key: "currentSequence",
      header: "Sequência",
      render: (_, item) => (
        <span className="font-mono text-sm">
          {item.currentSequence}
          <span className="text-muted-foreground">
            {" / "}
            {item.lastDocumentNo === "999999999999"
              ? "sem limite"
              : item.lastDocumentNo || "-"}
          </span>
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (_, item) => {
        if (!item.isActive) {
          return <ItemStatusBadge status="INACTIVE" />;
        }
        if (isExhausted(item)) {
          return <Badge variant="destructive">Esgotada</Badge>;
        }
        return <ItemStatusBadge status="ACTIVE" />;
      },
    },
    {
      key: "consumo",
      header: "Consumo",
      render: (_, item) => {
        const progress = calculateProgress(item);
        return (
          <div className="ml-auto flex max-w-32 flex-col items-end gap-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {progress.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="justify-start mt-6 space-y-8">
        <ListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar as séries da AGT" />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
        <div className="space-y-1 w-full sm:w-auto">
          <h3 className="text-lg font-semibold">Séries fiscais</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe a utilização das séries de numeração autorizadas pela AGT.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            className="w-full sm:w-auto"
          >
            Actualizar
          </Button>
          <Button
            type="button"
            onClick={handlerRequestSeries}
            className="w-full sm:w-auto"
          >
            Solicitar série
          </Button>
        </div>
      </div>

      {series.length > 0 ? (
        <GenericTable<AgtSeries>
          page={page}
          data={series}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhuma série encontrada"
        />
      ) : (
        <EmptyState
          description="Solicite uma nova série fiscal"
          title="Sem séries AGT"
          icon="ListOrdered"
        />
      )}

      <RequestSeriesModal />
    </div>
  );
}
