"use client";

import React, { useState } from "react";
import {
  GlobalModal,
  Button,
  Icon,
  RequestError,
  PosRequestsSkeleton,
} from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatDateTime } from "@/utils";
import {
  useGetOpeningRequests,
  useRejectOpeningRequest,
} from "@/hooks/cash-session/use-cash-sessions";
import { CashSessionRequest } from "@/types/cash-session";
import { useCurrentCashierStore } from "@/stores/pos/current-cashier-store";

export function PosRequestsModal() {
  const { closeModal, openModal, open } = useModal();
  const isOpen = open["pos-requests"];
  const { setCurrentCashier } = useCurrentCashierStore();

  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const {
    data: openingRequests,
    isLoading,
    isError,
    refetch,
  } = useGetOpeningRequests({ status: "PENDING" });

  const { mutateAsync: rejectOpening } = useRejectOpeningRequest();

  const handleApprove = (request: CashSessionRequest) => {
    // Close this modal and open opening-cashier with user pre-selected
    closeModal("pos-requests");
    // Inject only the minimal data needed — the modal will handle the rest
    setCurrentCashier({
      // Pre-select the requesting user (manager just sets capital + store)
      userId: request.userId,
      storeId: request.storeId,
      user: { name: request.userName, email: "" },
      // Signal to the modal that this is a "request approval" open (not an edit)
      _fromRequest: true,
      _requestId: request.id,
    } as any);
    openModal("opening-cashier-from-request");
  };

  const handleReject = async (request: CashSessionRequest) => {
    setRejectingId(request.id);
    try {
      await rejectOpening(request.id);
    } finally {
      setRejectingId(null);
    }
  };

  const handleClose = () => {
    closeModal("pos-requests");
  };

  if (!isOpen) return null;

  return (
    <GlobalModal
      id="pos-requests"
      title="Pedidos de abertura"
      description="Gerir os pedidos de abertura de caixa dos colaboradores."
      canClose
      className="sm:max-w-[500px]"
    >
      <div className="pt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <PosRequestsSkeleton />
          </div>
        ) : isError ? (
          <RequestError refetch={refetch} message="Erro ao carregar os pedidos" />
        ) : (
          <>
            <div className="space-y-3">
              {openingRequests?.map((request: CashSessionRequest) => {
                const isRejecting = rejectingId === request.id;

                return (
                  <div
                    key={request.id}
                    className="p-4 flex items-start gap-4 hover:bg-muted/10 transition-colors cursor-pointer rounded-xl border border-muted-foreground/10"
                  >
                    <div className="flex items-center justify-center shrink-0 w-10 h-10 border rounded-full bg-primary/10 border-primary/10 font-bold text-primary text-sm">
                      {request.userName?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">
                            {request.userName}
                          </h4>
                          <p className="text-[12px] font-medium leading-tight text-muted-foreground line-clamp-2">
                            {request.message || "Pedido de abertura de caixa"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap pt-0.5">
                          {formatDateTime(request.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="text-xs gap-1.5"
                          onClick={() => handleApprove(request)}
                        >
                          <Icon name="CircleCheck" className="w-3 h-3" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isRejecting}
                          onClick={() => handleReject(request)}
                        >
                          {isRejecting ? (
                            <Icon name="LoaderCircle" className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Icon name="CircleX" className="w-3 h-3 mr-1" />
                              Recusar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!openingRequests || openingRequests.length === 0) && (
              <div className="py-12 space-y-3 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-muted opacity-20">
                  <Icon name="Inbox" className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Não existem pedidos pendentes.
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}