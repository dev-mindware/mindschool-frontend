"use client";

import { Icon } from "@/components";
import { currentStoreStore, useModal } from "@/stores";
import { cn } from "@/lib/utils";
import {
  PosCloseSessionModal,
  PosOpeningCashierModal,
  PosRegisterExpenseModal,
  PosRequestOpeningModal,
} from "../../modal";
import { PosOpeningModal } from "@/components/client/management/pos/modal/pos-opening-modal";
import { useAuth } from "@/hooks/auth/use-auth";
import {
  formatCurrency,
  formatDateTime,
  getExpectedCashSessionEnd,
} from "@/utils";
import { CashSession } from "@/types/cash-session";
import { useQueryClient } from "@tanstack/react-query";

interface PosGeneralSettingsProps {
  currentSession?: CashSession;
}

export function PosGeneralSettings({ currentSession }: PosGeneralSettingsProps) {
  const { openModal } = useModal();
  const { user } = useAuth();
  const { currentStore } = currentStoreStore();
  const queryClient = useQueryClient();
  const isOpen = !!currentSession?.isOpen;
  const isManagement =
    user?.role === "ADMIN" ||
    user?.role === "OWNER" ||
    user?.role === "MANAGER";
  const currentPlan = user?.company?.subscription?.plan?.name;
  const isSmartPlan = currentPlan === "Smart";
  const expectedEnd = currentSession
    ? getExpectedCashSessionEnd(currentSession)
    : null;
  const expectedSessionEnd = expectedEnd
    ? formatDateTime(expectedEnd.toISOString())
    : "-";

  // Razão pela qual "Solicitar" está desabilitado (null = habilitado)
  const requestDisabledReason: string | null = isManagement
    ? "Gestores e proprietários não precisam de solicitar abertura. Use a opção \"Abrir\" diretamente."
    : isSmartPlan
      ? "A solicitação remota não está disponível no plano Smart. Faça upgrade para Pro ou superior."
      : null;

  const actionCards = [
    {
      title: "Solicitar",
      subtitle: "Abertura de caixa",
      description: "Pedir autorização para iniciar",
      icon: "ClipboardList",
      tourKey: "pos-settings-request-opening",
      variant: "action" as const,
      onClick: requestDisabledReason ? undefined : () => openModal("pos-request-opening-modal"),
      disabled: !!requestDisabledReason,
      disabledReason: requestDisabledReason,
    },
    {
      title: isOpen ? "Sessão" : "Abrir",
      subtitle: isOpen ? "Caixa aberto" : "Iniciar caixa",
      description: isOpen ? "Turno em andamento" : "Abrir uma nova sessão",
      icon: isOpen ? "Check" : "Play",
      tourKey: "pos-settings-open-session",
      variant: isOpen ? ("default" as const) : ("action" as const),
      onClick: !isOpen
        ? () =>
            openModal(
              isManagement ? "opening-cashier" : "opening-cashier-session",
              isManagement ? { mode: "create" } : undefined,
            )
        : undefined,
    },
    {
      title: "Fechar",
      subtitle: "Encerrar sessão",
      description: "Encerrar o turno do caixa",
      icon: "Power",
      tourKey: "pos-settings-close-session",
      variant: isOpen ? ("action" as const) : ("default" as const),
      colors: "destructive" as const,
      onClick: isOpen ? () => openModal("pos-close-session-modal") : undefined,
      disabled: !isOpen,
    },
    {
      title: "Registar",
      subtitle: "Nova despesa",
      description: "Registar saída manual",
      icon: "Minus",
      tourKey: "pos-settings-register-expense",
      variant: isOpen ? ("action" as const) : ("default" as const),
      colors: "destructive" as const,
      onClick: isOpen ? () => openModal("pos-register-expense-modal") : undefined,
      disabled: !isOpen,
    },
  ];

  return (
    <div className="space-y-8 pb-12" data-tour="pos-settings-general">
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        data-tour="pos-settings-actions"
      >
        {actionCards.map((card) => {
          const isDisabled = (card as any).disabled;
          const disabledReason = (card as any).disabledReason as string | undefined;

          const buttonContent = (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl transition-all text-center gap-2 border shadow-sm w-full h-full",
                isDisabled
                  ? "opacity-40 grayscale cursor-not-allowed bg-muted/20 border-border/50"
                  : card.colors === "destructive"
                    ? "bg-destructive/5 hover:bg-destructive/10 border-destructive/10 text-destructive active:scale-95"
                    : "bg-background hover:bg-muted/30 border-border/50 text-foreground active:scale-95",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  card.colors === "destructive"
                    ? "bg-destructive/10"
                    : "bg-primary/10",
                )}
              >
                <Icon
                  name={card.icon as any}
                  size={20}
                  className={
                    card.colors === "destructive"
                      ? "text-destructive"
                      : "text-primary"
                  }
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold leading-tight uppercase tracking-wide opacity-70">
                  {card.title}
                </p>
                <p className="text-sm font-bold truncate max-w-[130px]">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );

          // Quando desabilitado por razão específica, usa wrapper com tooltip nativo
          if (disabledReason) {
            return (
              <div
                key={card.tourKey}
                data-tour={card.tourKey}
                title={disabledReason}
                className="relative group cursor-not-allowed"
              >
                {buttonContent}
                {/* Tooltip personalizado */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-popover text-popover-foreground text-xs font-medium rounded-xl border border-border/60 shadow-xl px-3 py-2 leading-relaxed text-center">
                    {disabledReason}
                  </div>
                  <div className="w-2.5 h-2.5 bg-popover border-r border-b border-border/60 rotate-45 mx-auto -mt-[5px]" />
                </div>
              </div>
            );
          }

          return (
            <button
              key={card.tourKey}
              type="button"
              data-tour={card.tourKey}
              onClick={card.onClick}
              disabled={isDisabled}
              className={cn(
                "rounded-2xl transition-all",
                isDisabled && "pointer-events-none",
              )}
            >
              {buttonContent}
            </button>
          );
        })}
      </div>

      {currentSession && (
        <div className="space-y-4" data-tour="pos-settings-session-details">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] px-1">
            Detalhes da sessão
          </p>

          <div
            className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4"
            data-tour="pos-settings-session-metrics"
          >
            {[
              {
                label: "Total em vendas",
                value: formatCurrency(currentSession.totalSales || 0),
                icon: "TrendingUp",
                color: "text-primary-500",
                bg: "bg-primary-500/10",
                valueClass: "text-primary-600",
              },
              {
                label: "Término previsto",
                value: expectedSessionEnd,
                icon: "Clock",
                color: "text-primary-500",
                bg: "bg-primary-500/10",
              },
              {
                label: "Fundo de maneio",
                value: formatCurrency(currentSession.openingCash),
                icon: "Wallet",
                color: "text-primary-500",
                bg: "bg-primary-500/10",
              },
              {
                label: "Responsável",
                value:
                  currentSession.authorizedByName ||
                  "-",
                icon: "User",
                color: "text-primary-500",
                bg: "bg-primary-500/10",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm space-y-3"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    metric.bg,
                  )}
                >
                  <Icon name={metric.icon as any} size={20} className={metric.color} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-black font-outfit truncate",
                      metric.valueClass,
                    )}
                  >
                    {metric.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="md:hidden bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30 shadow-sm"
            data-tour="pos-settings-session-metrics"
          >
            <div className="flex items-center justify-between p-4 bg-muted/5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isOpen ? "bg-green-500/10" : "bg-red-500/10",
                  )}
                >
                  <Icon
                    name={isOpen ? "CircleDot" : "Circle"}
                    size={16}
                    className={isOpen ? "text-green-600" : "text-red-500"}
                  />
                </div>
                <p className="text-sm font-medium">Estado do caixa</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isOpen ? "bg-green-500 animate-pulse" : "bg-red-500",
                  )}
                />
                <span className="text-sm font-bold">
                  {isOpen ? "Em operação" : "Finalizada"}
                </span>
              </div>
            </div>

            {[
              {
                label: "Término previsto",
                value: expectedSessionEnd,
                icon: "Clock",
                iconColor: "text-primary-500",
                iconBg: "bg-primary-500/10",
              },
              {
                label: "Total em vendas",
                value: formatCurrency(currentSession.totalSales || 0),
                icon: "TrendingUp",
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-500/10",
                valueClass: "text-emerald-600",
              },
              {
                label: "Fundo de maneio",
                value: formatCurrency(currentSession.openingCash),
                icon: "Wallet",
                iconColor: "text-orange-500",
                iconBg: "bg-orange-500/10",
              },
              {
                label: "Abertura",
                value: formatDateTime(currentSession.openedAt),
                icon: "Calendar",
                iconColor: "text-indigo-500",
                iconBg: "bg-indigo-500/10",
              },
              {
                label: "Responsável",
                value:
                  currentSession.authorizedByName ||
                  "-",
                icon: "User",
                iconColor: "text-gray-500",
                iconBg: "bg-gray-500/10",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between p-4 active:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      metric.iconBg,
                    )}
                  >
                    <Icon
                      name={metric.icon as any}
                      size={16}
                      className={metric.iconColor}
                    />
                  </div>
                  <p className="text-sm font-medium">{metric.label}</p>
                </div>
                <span className={cn("text-sm font-bold", metric.valueClass)}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>

          {currentSession.notes && (
            <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-border flex gap-3">
              <Icon
                name="MessageSquare"
                size={16}
                className="text-muted-foreground mt-0.5"
              />
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Observações
                </p>
                <p className="text-xs italic text-muted-foreground leading-relaxed">
                  {currentSession.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <PosOpeningModal
        selfSessionMode
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["current-cash-session", currentStore?.id],
          });
        }}
      />
      <PosOpeningCashierModal
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["current-cash-session", currentStore?.id],
          });
        }}
      />
      <PosRequestOpeningModal />
      <PosRegisterExpenseModal currentSession={currentSession} />
      <PosCloseSessionModal currentSession={currentSession} />
    </div>
  );
}
