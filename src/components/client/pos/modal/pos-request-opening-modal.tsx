"use client";

import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GlobalModal, Input, Button, Textarea } from "@/components";
import { useModal, currentStoreStore } from "@/stores";
import { cashSessionsService } from "@/services/cash-sessions-service";
import { ErrorMessage, SucessMessage, WarningMessage } from "@/utils/messages";
import { isDuplicateOpeningRequestError } from "@/utils/cash-session";

export const MODAL_POS_REQUEST_OPENING_ID = "pos-request-opening-modal";

const requestSchema = z.object({
  message: z.string().min(1, "A mensagem é obrigatória"),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function PosRequestOpeningModal() {
  const { closeModal } = useModal();
  const { currentStore } = currentStoreStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    if (!currentStore?.id) {
      ErrorMessage("Loja não identificada. Contacte o suporte.");
      return;
    }

    try {
      await cashSessionsService.requestOpening({
        storeId: currentStore.id,
        message: data.message,
      });
      SucessMessage("Pedido de abertura de sessão enviado com sucesso.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["opening-requests"] }),
        queryClient.invalidateQueries({
          queryKey: ["reports", "dashboard", "pos-management"],
        }),
      ]);
      closeModal(MODAL_POS_REQUEST_OPENING_ID);
      reset();
    } catch (err: any) {
      const apiMessage = String(err?.response?.data?.message || "");

      if (isDuplicateOpeningRequestError(err)) {
        WarningMessage(
          "Já solicitou a abertura de caixa. Aguarde a aprovação do pedido pendente.",
        );
        return;
      }

      ErrorMessage(apiMessage || "Não foi possível enviar o pedido.");
    }
  };

  return (
    <GlobalModal
      id={MODAL_POS_REQUEST_OPENING_ID}
      title="Solicitar Abertura de Caixa"
      description="Envie uma mensagem ao gerente solicitando a abertura."
      className="!w-max"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          label="Mensagem"
          placeholder="Ex: Preciso abrir o caixa para o turno da tarde."
          error={errors.message?.message}
          {...register("message")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => closeModal(MODAL_POS_REQUEST_OPENING_ID)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Enviar pedido
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
