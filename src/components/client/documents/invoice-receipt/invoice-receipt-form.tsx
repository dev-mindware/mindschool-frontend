"use client";
import { ErrorMessage } from "@/utils/messages";
import { useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Icon,
  RHFSelect,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  NifVerificationField,
} from "@/components";
import { InvoiceReceiptFormData, InvoiceReceiptSchema } from "@/schemas";
import { useCreateInvoiceReceipt, useInvoiceTotals, useNifFormVerification } from "@/hooks";
import { AsyncCreatableSelectField } from "@/components/common/input-fetch/async-select";
import { useClientSelection } from "@/hooks/invoice";
import { currentStoreStore, useAuthStore, useModal } from "@/stores";
import { paymentMethods } from "@/constants";
import { InvoiceItems } from "../document-forms/items";
import { isSelectableClient } from "@/utils";

export function InvoiceReceiptForm() {
  const { user } = useAuthStore();
  const { mutateAsync: createInvoiceReceipt, isPending } =
    useCreateInvoiceReceipt();

  const form = useForm<InvoiceReceiptFormData>({
    resolver: zodResolver(InvoiceReceiptSchema),
    mode: "onChange",
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [],
      client: {
        name: "",
        taxNumber: "",
        address: "",
        phone: "",
      },
      clientId: "",
      globalRetention: 0,
      globalDiscount: 0,
      notes: "",
      currencyCode: "AOA" as const,
      paymentMethod: "CASH",
      storeId: "",
    },
  });

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError,
    clearErrors,
  } = form;

  const { handleClientChange, selectedClient, setSelectedClient } =
    useClientSelection(setValue);
  const { openModal } = useModal();
  const { currentStore } = currentStoreStore();
  const clientTaxNumber = watch("client.taxNumber") || "";
  const { handleStatusChange, handleVerified } = useNifFormVerification({
    setValue,
    setError,
    clearErrors,
    taxNumberField: "client.taxNumber",
    nameField: "client.name",
  });

  const fieldArray = useFieldArray<InvoiceReceiptFormData, "items">({
    control,
    name: "items",
  });

  const watchedValues = watch([
    "items",
    "globalRetention",
    "globalDiscount",
    "client.name",
    "clientId",
  ]);

  const [
    items,
    globalRetention,
    globalDiscount,
    clientName,
    clientId,
  ] = watchedValues;

  const totals = useInvoiceTotals({
    items: items ?? [],
    retention: globalRetention ?? 0,
    discount: globalDiscount ?? 0,
  });

  const setGlobalRetention = useCallback(
    (v: number) =>
      setValue("globalRetention", v, {
        shouldValidate: true,
        shouldDirty: true,
      }),
    [setValue]
  );

  const setGlobalDiscount = useCallback(
    (v: number) =>
      setValue("globalDiscount", v, {
        shouldValidate: true,
        shouldDirty: true,
      }),
    [setValue]
  );

  const clientState = useMemo(() => {
    const hasClient = Boolean(clientName);
    const isNewClient = hasClient && !clientId;
    return { hasClient, isNewClient };
  }, [clientName, clientId]);

  const onSubmit = useCallback(
    async (data: InvoiceReceiptFormData) => {
      try {
        if (!data.items || data.items.length === 0) {
          ErrorMessage("Adicione pelo menos um item à factura-recibo.");
          return;
        }

        const isManagerOrOwner = user?.role === "OWNER" || user?.role === "MANAGER";

        const clientPayload = data.clientId
          ? { id: data.clientId }
          : (isManagerOrOwner && (!data.client.name)
            ? {
              name: "Consumidor Final",
              taxNumber: "999999999",
              address: currentStore?.address || "Loja",
            }
            : {
              name: data.client.name as string,
              phone: data.client.phone || undefined,
              address: data.client.address || undefined,
              taxNumber: data.client.taxNumber || undefined,
            });

        const itemsPayload = data.items.map((item) => {
          if (item.isFromAPI && item.apiId) {
            return {
              id: item.apiId,
              quantity: item.quantity,
              price: item.unitPrice,
            };
          }
          return {
            name: item.description,
            price: item.unitPrice,
            quantity: item.quantity,
            type: item.type,
            taxId: item.taxId,
          };
        });


        const finalPayload = {
          issueDate: data.issueDate,
          client: clientPayload,
          items: itemsPayload,
          total: totals.total,
          taxAmount: totals.taxAmount,
          retentionAmount: totals.retentionAmount,
          discountAmount: totals.discountAmount,
          subtotal: totals.subtotal,
          currencyCode: data.currencyCode,
          notes: data.notes || undefined,
          paymentMethod: data.paymentMethod, // This remains but selector was removed by user, default is 'CASH'
          ...(isManagerOrOwner &&
            currentStore?.id && { storeId: currentStore?.id }),
        };

        const response = await createInvoiceReceipt(finalPayload);
        const invoiceId = response?.data?.id;

        if (invoiceId) {
          openModal("document-success", {
            id: invoiceId,
            type: "invoice-receipt",
          });
        }

        reset();
        setSelectedClient(null);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível criar a factura-recibo. Tente novamente.";

        ErrorMessage(errorMessage);
      }
    },
    [createInvoiceReceipt, reset, setSelectedClient, totals, user?.role]
  );

  const handleClearForm = useCallback(() => {
    reset();
    setSelectedClient(null);
  }, [reset, setSelectedClient]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => console.log("Erro de validação na factura-recibo:", errors))}
      className="p-8 mt-4 space-y-8 border rounded-lg"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          type="date"
          label="Data de Emissão"
          {...register("issueDate")}
          error={errors.issueDate?.message}
          disabled
        />
        <RHFSelect
          label="Moeda"
          name="currencyCode"
          control={control}
          placeholder="Seleccione a moeda"
          options={[
            { value: "AOA", label: "AOA" },
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
          ]}
        />

        <AsyncCreatableSelectField
          endpoint="/clients"
          optionFilter={isSelectableClient}
          label={
            <span className="inline-flex items-center gap-1.5">
              Cliente (opcional)
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Informação sobre o cliente da factura-recibo"
                    className="inline-flex text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon name="CircleHelp" className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  Se não seleccionar um cliente, a factura-recibo será emitida
                  para Consumidor Final.
                </TooltipContent>
              </Tooltip>
            </span>
          }
          placeholder="Digite o nome do cliente..."
          value={selectedClient}
          onChange={handleClientChange}
          displayFields={["name", "email"]}
          minChars={2}
          formatCreateLabel={(inputValue: string) => `➕ Criar "${inputValue}"`}
          error={errors.client?.name?.message}
        />
        <input type="hidden" {...register("clientId")} />
        <input type="hidden" {...register("client.name")} />
      </div>

      {clientState.hasClient && (
        <div className="grid gap-6 md:grid-cols-3">
          <NifVerificationField
            label="NIF"
            value={clientTaxNumber}
            onChange={(value) =>
              setValue("client.taxNumber", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            onVerified={handleVerified}
            onStatusChange={handleStatusChange}
            verificationEnabled={clientState.isNewClient}
            error={errors.client?.taxNumber?.message}
            disabled={!clientState.isNewClient}
            placeholder="000000000"
          />
          <Input
            label="Telefone"
            {...register("client.phone")}
            error={errors.client?.phone?.message}
            disabled={!clientState.isNewClient}
            placeholder="9xxxxxxxx"
          />
          <Input
            label="Endereço"
            {...register("client.address")}
            error={errors.client?.address?.message}
            disabled={!clientState.isNewClient}
            placeholder="Luanda, Angola"
          />
        </div>
      )}

      <InvoiceItems
        totals={totals}
        fieldArray={fieldArray as any}
        globalRetention={globalRetention ?? 0}
        setGlobalRetention={setGlobalRetention}
        globalDiscount={globalDiscount ?? 0}
        setGlobalDiscount={setGlobalDiscount}
      />

      <Textarea
        {...register("notes")}
        placeholder="Adicione observações sobre esta factura-recibo (opcional)"
        label="Observações"
        error={errors.notes?.message}
        rows={4}
      />

      <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleClearForm}
          disabled={isSubmitting || isPending}
        >
          Limpar Formulário
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isPending}
          className="min-w-[150px]"
        >
          {isPending || isSubmitting ? "A processar..." : "Criar factura-recibo"}
        </Button>
      </div>
    </form>
  );
}
