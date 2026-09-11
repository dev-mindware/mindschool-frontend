"use client";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { PaymentTerms } from "./payment-terms";
import { SubscriptionFormData } from "@/schemas";
import {
  Card,
  Icon,
  Button,
  FileUpload,
  RadioGroup,
  RadioGroupItem,
  SubscriptionSucessModal,
  SubscriptionSummary,
} from "@/components";
import { ErrorMessage } from "@/utils/messages";
import { PaymentInstruction } from "./payment-insctrutions";
import { PaymentMethodInformation } from "./payment-method-information";
import { paymentMethods } from "./payment-method";
import { useCurrentPlanStore } from "@/stores";

interface PaymentFormProps {
  form: UseFormReturn<SubscriptionFormData>;
  onSubmit: (data: SubscriptionFormData) => Promise<void>;
  isPending: boolean;
}

export function PaymentForm({ form, onSubmit, isPending }: PaymentFormProps) {
  const { control, handleSubmit, watch } = form;
  const subscriptionData = watch();
  const { currentPlanSelected } = useCurrentPlanStore();
  const [paymentMethod, setPaymentMethod] = useState<"Express" | "Kwik">(
    "Express",
  );
  const frequency = subscriptionData.frequency || "MONTHLY";
  const currentMethod = paymentMethods[paymentMethod];

  async function handleFormSubmit(data: SubscriptionFormData) {
    await onSubmit(data);
  }


  return (
    <div className="container mx-auto py-8">
      <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Concluir pagamento
              </h1>
              <p className="text-muted-foreground">
                Escolha a forma de pagamento para prosseguir
              </p>
            </div>
          </div>

          <Card className="p-6 border-border shadow-none ">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                1. Ciclo de facturação
              </h3>

              <div className="space-y-3">
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value || "MONTHLY"}
                      value={field.value || "MONTHLY"}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MONTHLY" id="MONTHLY" />
                        <label htmlFor="MONTHLY" className="cursor-pointer">
                          Mensal
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ANNUAL" id="ANNUAL" />
                        <label htmlFor="ANNUAL" className="cursor-pointer">
                          Anual
                        </label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground pb-2">
                2. Método de Pagamento
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(paymentMethods).map(([key, method]) => {
                  return (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key as any)}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${paymentMethod === key
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                        }`}
                    >
                      <div className="h-16 w-full relative flex items-center justify-center p-2 mb-2">
                        <img
                          src={`/${method.icon}`}
                          alt={method.name}
                          className="h-full w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Taxa: 0
                      </div>
                    </button>
                  );
                })}
              </div>

              <PaymentMethodInformation currentMethod={currentMethod} />
              {/* <PaymentInstruction currentMethod={currentMethod} /> */}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground pb-2">
                3. Comprovativo
              </h3>
              <form
                onSubmit={handleSubmit(handleFormSubmit, (errors) => {
                  console.log("Validation Errors:", errors);
                })}
                className="space-y-6"
              >
                <FileUpload
                  control={control}
                  name="proofPayment"
                  accept={[".pdf", ".jpg", ".jpeg", ".png"]}
                  label="Anexe o comprovativo da transferência"
                />

                <Button
                  size="lg"
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Icon name="LoaderCircle" className="animate-spin mr-2" />
                  ) : null}
                  {isPending ? "A processar..." : "Concluir"}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start">
          <SubscriptionSummary
            frequency={frequency}
            months={frequency === "ANNUAL" ? 12 : 1}
            selectedPlan={currentPlanSelected}
          />
          <PaymentTerms />{" "}
        </div>
      </div>
      <SubscriptionSucessModal />
    </div>
  );
}
