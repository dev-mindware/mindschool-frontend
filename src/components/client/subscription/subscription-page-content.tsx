"use client";
import { useEffect } from "react";
import { useModal, useCurrentPlanStore } from "@/stores";
import { useForm } from "react-hook-form";
import { PaymentForm } from "./payment-form";
import { ErrorMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscriptionFormData, subscriptionSchema } from "@/schemas";
import { useFileUpload } from "@/hooks/common/use-upload";
import { usePlans } from "@/hooks";

export function SubscriptionPageContent() {
  const { openModal } = useModal();
  const { currentPlanSelected, setCurrentPlanSelected } = useCurrentPlanStore();
  const { plans } = usePlans();
  const { mutateAsync: uploadFile, isPending } = useFileUpload(
    "/subscriptions",
    "subscriptions",
    "POST",
  );

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      status: "PENDING_PAYMENT",
      frequency: "MONTHLY",
      proofPayment: null,
      planId: currentPlanSelected?.id || "",
    },
  });

  // Selecciona o primeiro plano por predefinição quando nenhum estiver seleccionado.
  useEffect(() => {
    if (!currentPlanSelected && plans && plans.length > 0) {
      setCurrentPlanSelected(plans[0]);
    }
  }, [currentPlanSelected, plans, setCurrentPlanSelected]);

  useEffect(() => {
    if (currentPlanSelected?.id) {
      form.setValue("planId", currentPlanSelected.id);
    }
  }, [currentPlanSelected?.id, form]);

  async function handlePaymentSubmit(data: SubscriptionFormData) {
    try {
      if (!data.proofPayment || data.proofPayment === null) {
        ErrorMessage("Por favor, envie o comprovativo de pagamento");
        return;
      }

      await uploadFile({
        files: {
          proofPayment: data.proofPayment,
        },
        extraData: {
          frequency: data.frequency,
          planId: data.planId,
        },
      });

      openModal("subscription-created");
      localStorage.removeItem("MGEST-PLAN-STORE");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(error?.response?.data?.message);
      } else {
        ErrorMessage("Ocorreu um erro ao criar a assinatura. Tente novamente.");
      }
    }
  }

  return (
    <div className="bg-background">
      <PaymentForm
        form={form}
        onSubmit={handlePaymentSubmit}
        isPending={isPending}
      />
    </div>
  );
}
