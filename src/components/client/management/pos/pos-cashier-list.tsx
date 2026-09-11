"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent, Badge, Icon } from "@/components";
import { formatCurrency, formatDateTime } from "@/utils";
import { GenericTable, Column } from "@/components/common/generic-table";
import { ButtonOnlyAction } from "@/components/common/button-actions/button-only-action";
import { PosCardSkeleton } from "./pos-skeletons";
import { CashSession } from "@/types/cash-session";
import { EmptyState } from "@/components/common/empty-state";
import { useModal } from "@/stores";
import { useCurrentCashierStore } from "@/stores/pos/current-cashier-store";

interface PosCashierListProps {
  viewMode: "grid" | "table";
  data: CashSession[];
  isLoading: boolean;
  total: number;
  totalPages: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  page: number;
  setPage: (page: number) => void;
}

export function PosCashierList({
  viewMode,
  data,
  isLoading,
  total,
  totalPages,
  goToNextPage,
  goToPreviousPage,
  page,
  setPage,
}: PosCashierListProps) {

  const { openModal } = useModal();
  const { setCurrentCashier } = useCurrentCashierStore();

  const sessionActions = (item: CashSession) => {
    const actions = [];
    if (item.isOpen) {
      actions.push({
        label: "Editar",
        icon: "Pencil" as const,
        variant: "default" as const,
        onClick: () => {
          setCurrentCashier(item);
          openModal("opening-cashier", { mode: "edit" });
        }
      });
      actions.push({
        type: "separator" as const
      });
    }
    actions.push({
      label: "Apagar",
      icon: "Trash2" as const,
      variant: "destructive" as const,
      onClick: () => {
        setCurrentCashier(item);
        openModal("delete-cashier");
      }
    });
    return actions;
  };

  const columns: Column<CashSession>[] = [
    {
      key: "user",
      header: "Operador",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/30 border border-muted-foreground/5 shrink-0">
            <Image
              src="/pos-computer-icon.png"
              alt="POS"
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <p className="font-bold">{item.cashierName || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{item.userId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "isOpen",
      header: "Status",
      render: (value) => (
        <Badge variant={value ? "success" : "secondary"}>
          <span className={cn("w-1.5 h-1.5 rounded-full mr-2", value ? "bg-green-500" : "bg-muted-foreground")} />
          {value ? "Aberto" : "Fechado"}
        </Badge>
      ),
    },
    {
      key: "openedAt",
      header: "Abertura",
      render: (value) => <span className="text-xs font-medium">{formatDateTime(value)}</span>,
    },
    {
      key: "openingCash",
      header: "Cap. Inicial",
      render: (value) => <span className="font-bold font-mono">{formatCurrency(value)}</span>,
    },
    {
      key: "totalSales",
      header: "Vendas",
      render: (value) => <span className="font-bold text-primary font-mono">{formatCurrency(value)}</span>,
    },
    {
      key: "cashDifference",
      header: "Diferença",
      render: (value) => (
        <span className={cn("font-bold font-mono", value < 0 ? "text-destructive" : value > 0 ? "text-green-500" : "")}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px] text-right",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={sessionActions(item)}
        />
      ),
    },
  ];

  if (isLoading) return <PosCardSkeleton />;

  if (data.length === 0) {
    return (
      <EmptyState
        icon="LayoutGrid"
        title="Nenhuma sessão encontrada"
        description="Não existem sessões de caixa registadas para os filtros seleccionados."
      />
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((session) => (
          <Card
            key={session.id}
            className="group hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl border-muted-foreground/10 bg-gradient-to-br from-background to-muted/20 overflow-hidden relative"
          >
            {/* Background Decorative Element */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

            <CardContent className="p-0">
              {/* Header Section */}
              <div className="p-5 flex items-start justify-between border-b border-muted-foreground/5 bg-muted/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:scale-110 transition-transform duration-500 border border-primary/20 shadow-inner">
                      {session.cashierName?.charAt(0) || "O"}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm",
                      session.isOpen ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                    )} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm tracking-tight text-foreground/90 leading-tight">
                      {session.cashierName || "Operador Desconhecido"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Icon name="Calendar" size={12} className="opacity-50" />
                      {formatDateTime(session.openedAt).split(" ")[0]}
                      <span className="opacity-40">•</span>
                      {formatDateTime(session.openedAt).split(" ")[1]}
                    </p>
                  </div>
                </div>
                <ButtonOnlyAction
                  data={session}
                  actions={sessionActions(session)}
                />
              </div>

              {/* Main Metric Focus */}
              <div className="px-5 py-6 flex flex-col items-center justify-center text-center space-y-1 bg-background">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-[0.15em]">
                  Total em Vendas
                </p>
                <h3 className="text-3xl font-black tracking-tight text-primary drop-shadow-sm">
                  {formatCurrency(session.totalSales)}
                </h3>
              </div>

              {/* Data Grid */}
              <div className="px-5 pb-5 grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-1 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 group-hover:bg-muted/50 transition-colors duration-300">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="CircleDollarSign" size={13} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Cap. Inicial</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-foreground/80">
                    {formatCurrency(session.openingCash)}
                  </p>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 group-hover:bg-muted/50 transition-colors duration-300">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Scale" size={13} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Capital de Fecho</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-foreground/80">
                    {formatCurrency(session.expectedClosingCash)}
                  </p>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 group-hover:bg-muted/50 transition-colors duration-300">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Scale" size={13} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Diferença</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-foreground/80">
                    {formatCurrency(session.cashDifference)}
                  </p>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 group-hover:bg-muted/50 transition-colors duration-300">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Clock" size={13} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Duração</span>
                  </div>
                  <p className="text-xs font-bold text-foreground/80">
                    {session.duration || "--:--"}
                  </p>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 group-hover:bg-muted/50 transition-colors duration-300">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Wallet" size={13} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Fundo</span>
                  </div>
                  <p className="text-xs font-bold text-foreground/80 capitalize">
                    {session.fundType?.toLowerCase() === "coin" ? "Moeda" : "Nota"}
                  </p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="px-5 py-3 border-t border-muted-foreground/5 bg-muted/5 flex items-center justify-between">
                <Badge
                  variant={session.isOpen ? "success" : "secondary"}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    session.isOpen ? "bg-green-500/10 text-green-600 border-green-500/20 shadow-none" : "bg-muted/50 text-muted-foreground border-muted-foreground/10"
                  )}
                >
                  {session.isOpen ? "Sessão activa" : "Sessão encerrada"}
                </Badge>

                {!session.isOpen && session.closedAt && (
                  <p className="text-[10px] text-muted-foreground font-medium italic">
                    Fim: {formatDateTime(session.closedAt).split(" ")[1]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <GenericTable
      data={data}
      columns={columns}
      page={page}
      total={total}
      totalPages={totalPages}
      setPage={setPage}
      goToNextPage={goToNextPage}
      goToPreviousPage={goToPreviousPage}
    />
  );
}
