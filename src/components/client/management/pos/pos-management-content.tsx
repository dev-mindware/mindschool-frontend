"use client";

import { useState } from "react";
import { Button, Icon } from "@/components";
import { formatCurrency } from "@/utils";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores";
import { PosRequestsModal, PosOpeningModal, PosDeleteModal } from "./modal";
import { PosCashierList } from "./pos-cashier-list";
import { summaryCards } from "./data";
import { DynamicMetricCard } from "@/components";
import { useCurrentCashierStore } from "@/stores/pos/current-cashier-store";
import { PosFilters } from "./pos-filters";
import {
  useGetCashSessions,
  useCashSessionFilters,
  useGetOpeningRequests,
} from "@/hooks/entities";
import { usePosManagementDashboard } from "@/hooks/reports";
import { currentStoreStore } from "@/stores/store/current-store-store";

export function PosManagementContent() {
  const { openModal } = useModal();
  const { setCurrentCashier } = useCurrentCashierStore();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const { currentStore } = currentStoreStore();
  const { filters, page, setPage } = useCashSessionFilters();

  const {
    data: sessions,
    isLoading,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  } = useGetCashSessions({
    ...filters,
    storeId: currentStore?.id,
    page,
  });

  const { data: requests } = useGetOpeningRequests({
    status: "PENDING",
  });
  const { data: dashboard } = usePosManagementDashboard();

  const summary = dashboard?.summary;
  const requestsCount =
    summary?.pendingRequestsCount ??
    (Array.isArray(requests) ? requests.length : 0);
  const hasPendingRequests = requestsCount > 0;

  const dynamicSummaryCards = summaryCards.map((card) => {
    if (card.title === "Receitas") {
      return { ...card, value: summary?.dailyRevenue ?? 0 };
    }
    if (card.title === "Despesas") {
      return { ...card, value: summary?.dailyExpenses ?? 0 };
    }
    if (card.modalId === "pos-requests") {
      return { ...card, value: requestsCount };
    }
    if (card.modalId === "opening-cashier") {
      return { ...card, value: summary?.totalSessions ?? total ?? 0 };
    }
    return card;
  });

  return (
    <div>
      <div className="space-y-8">
        <section className="space-y-6" data-tour="pos-management-summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {dynamicSummaryCards.map((card, idx) => {
              // Custom card for "Pedidos" with radar animation
              if (card.modalId === "pos-requests") {
                return (
                  <div
                    key={idx}
                    className="group relative cursor-pointer"
                    onClick={() => openModal("pos-requests")}
                    title={
                      hasPendingRequests
                        ? `${requestsCount} pedido(s) pendente(s) — clique para ver`
                        : "Sem pedidos pendentes"
                    }
                  >
                    {/* Radar rings — only when there are pending requests */}
                    {hasPendingRequests && (
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                        <span
                          className="absolute inset-0 rounded-xl border-2 border-amber-400/60 animate-ping"
                          style={{ animationDuration: "1.5s" }}
                        />
                        <span
                          className="absolute inset-0 rounded-xl border border-amber-400/30 animate-ping"
                          style={{
                            animationDuration: "2s",
                            animationDelay: "0.4s",
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-orange-400/4 to-transparent rounded-xl" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "relative rounded-xl border shadow-none py-2 overflow-hidden transition-all",
                        hasPendingRequests
                          ? "border-amber-400/40 bg-gradient-to-t from-amber-400/5 to-card hover:border-amber-400/70 hover:from-amber-400/10"
                          : "border-border bg-gradient-to-t from-primary/2 to-card hover:border-primary/30",
                      )}
                    >
                      <div className="p-3 md:p-4 flex justify-between items-start">
                        <div className="flex flex-col h-full flex-1">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h2
                                className={cn(
                                  "text-xl md:text-2xl font-bold tracking-tight",
                                  hasPendingRequests
                                    ? "text-amber-500"
                                    : "text-primary",
                                )}
                              >
                                {requestsCount}
                              </h2>
                              <div
                                className={cn(
                                  "p-2 rounded-md shrink-0 relative",
                                  hasPendingRequests
                                    ? "bg-amber-400/15 text-amber-500"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Icon name="Bell" className="w-4 h-4" />
                                {hasPendingRequests && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-background animate-pulse" />
                                )}
                              </div>
                            </div>
                            <p
                              className={cn(
                                "text-base md:text-lg font-medium",
                                hasPendingRequests
                                  ? "text-amber-500"
                                  : "text-primary",
                              )}
                            >
                              Pedidos
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground w-full font-medium mt-2">
                            {hasPendingRequests
                              ? `${requestsCount} pedido(s) aguardam aprovação`
                              : "Consultar pedidos pendentes"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasPendingRequests && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-popover text-popover-foreground text-xs font-medium rounded-xl border border-border/60 shadow-xl px-3 py-2 leading-relaxed text-center">
                          {requestsCount} colaborador
                          {requestsCount !== 1 ? "es" : ""} aguarda
                          {requestsCount === 1 ? "" : "m"} autorização para
                          abrir caixa. Clique para ver e aprovar.
                        </div>
                        <div className="w-2.5 h-2.5 bg-popover border-r border-b border-border/60 rotate-45 mx-auto -mt-[5px]" />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <DynamicMetricCard
                  key={idx}
                  variant={card.type}
                  icon={card.icon}
                  title={
                    card.type === "default"
                      ? formatCurrency((card.value as number) ?? 0).split(
                          ",",
                        )[0] || "0"
                      : (card.value ?? "0")
                  }
                  subtitle={card.title}
                  description={card.description || ""}
                  onClick={() => {
                    if (card.type === "interactive" || card.type === "action") {
                      if (card.modalId === "opening-cashier") {
                        setCurrentCashier(null);
                      }
                      openModal(
                        card.modalId as string,
                        card.modalId === "opening-cashier"
                          ? { mode: "create" }
                          : undefined,
                      );
                    }
                  }}
                />
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div data-tour="pos-management-filters">
              <PosFilters />
            </div>
            <div
              className="flex items-center bg-muted/30 p-1 rounded-md border border-muted-foreground/10 gap-1 ml-auto"
              data-tour="pos-management-view-toggle"
            >
              <Button
                data-tour="pos-management-view-grid"
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                className={cn(
                  viewMode === "grid"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Icon name="LayoutGrid" size={30} />
              </Button>
              <Button
                data-tour="pos-management-view-table"
                variant={viewMode === "table" ? "secondary" : "ghost"}
                className={cn(
                  viewMode === "table"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <Icon name="TableProperties" size={30} />
              </Button>
            </div>
          </div>

          <div data-tour="pos-management-list">
            <PosCashierList
              viewMode={viewMode}
              data={sessions}
              isLoading={isLoading}
              total={total}
              totalPages={totalPages}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
              page={page}
              setPage={setPage}
            />
          </div>
        </section>
      </div>
      <PosOpeningModal />
      <PosRequestsModal />
      <PosDeleteModal />
    </div>
  );
}
