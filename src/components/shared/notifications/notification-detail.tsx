"use client";
import { format } from "date-fns";
import { Button, EmptyState, GlobalModal } from "@/components";
import { NotificationType } from "@/types";
import { useCurrentNotificationStore, useModal } from "@/stores";

export function NotificationDetail() {
  const { closeModal, open } = useModal();
  const { setCurrentNotification, currentNotification } =
    useCurrentNotificationStore();
  const isOpen = open["notify-detail"];

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      className="w-full max-w-lg"
      id="notify-detail"
      title={currentNotification?.title || "Detalhes da Notificação"}
    >
      <div className="space-y-4">
        {currentNotification ? (
          <>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {currentNotification.message}
            </p>

            <div className="text-sm text-foreground">
              Recebida em{" "}
              {format(
                currentNotification.createdAt || new Date(),
                "dd/MM/yyyy HH:mm"
              )}
            </div>
          </>
        ) : (
          <EmptyState
            icon="BellOff"
            title="Detalhes não encontrados"
            description="Não foi possível carregar os detalhes desta notificação."
          />
        )}

        <div className="pt-4 flex justify-end">
          <Button
            onClick={() => {
              setCurrentNotification(null);
              closeModal("notify-detail");
            }}
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            Fechar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
