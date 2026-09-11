"use client";
import { ErrorMessage } from "@/utils/messages";
import { useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, NifVerificationField, RHFSelect, Textarea } from "@/components";
import { InvoiceFormData, InvoiceSchema } from "@/schemas";
import {
  useClientSelection,
  useCreateInvoice,
  useInvoiceTotals,
  useNifFormVerification,
} from "@/hooks";
import { AsyncCreatableSelectField } from "@/components/common/input-fetch/async-select";
import { currentStoreStore, useAuthStore, useModal } from "@/stores";
import { InvoiceItems } from "../document-forms/items";
import { isSelectableClient } from "@/utils";

const THIRTY_DAYS = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export function InvoiceForm() {
  const { user } = useAuthStore();
  const { mutateAsync: createInvoiceNormal, isPending } = useCreateInvoice();
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(InvoiceSchema),
    mode: "onChange",
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: THIRTY_DAYS,
      items: [],
      globalRetention: 0,
      globalDiscount: 0,
      client: {
        name: "",
        phone: "",
        address: "",
        taxNumber: "",
      },
      clientId: "",
      notes: "",
      currencyCode: "AOA" as const,
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

  const fieldArray = useFieldArray<InvoiceFormData, "items">({
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
    (v: number) => setValue("globalRetention", v, { shouldValidate: true }),
    [setValue]
  );

  const setGlobalDiscount = useCallback(
    (v: number) => setValue("globalDiscount", v, { shouldValidate: true }),
    [setValue]
  );

  const clientState = useMemo(() => {
    const hasClient = Boolean(clientName);
    const isNewClient = hasClient && !clientId;
    return { hasClient, isNewClient };
  }, [clientName, clientId]);

  // Stable reference — prevents AsyncCreatableSelectField from re-fetching
  // every time the parent form re-renders (e.g. on typing in another input).
  const clientDisplayFields = useMemo(() => ["name", "email"], []);

  const onSubmit = useCallback(
    async (data: InvoiceFormData) => {
      try {
        if (!data.items || data.items.length === 0) {
          ErrorMessage("Adicione pelo menos um item à factura.");
          return;
        }

        const clientPayload = data.clientId
          ? { id: data.clientId }
          : {
            name: data.client.name,
            phone: data.client.phone || undefined,
            address: data.client.address || undefined,
            taxNumber: data.client.taxNumber || undefined,
          };

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
          dueDate: data.dueDate,
          client: clientPayload,
          items: itemsPayload,
          total: totals.total,
          taxAmount: totals.taxAmount,
          retentionAmount: totals.retentionAmount,
          discountAmount: totals.discountAmount,
          subtotal: totals.subtotal,
          currencyCode: data.currencyCode,
          notes: data.notes || undefined,
          ...(user?.role === "OWNER" &&
            currentStore?.id && { storeId: currentStore?.id }),
        };

        const response = await createInvoiceNormal(finalPayload);
        const invoiceId = response?.data?.id;

        if (invoiceId) {
          openModal("document-success", { id: invoiceId, type: "invoice" });
        }

        reset();
        setSelectedClient(null);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível criar a factura. Tente novamente.";

        ErrorMessage(errorMessage);
      }
    },
    [createInvoiceNormal, reset, setSelectedClient, totals, user?.role]
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => console.log("Erro de validação na factura:", errors))}
      className="p-8 mt-4 space-y-8 border rounded-lg"
      data-tour="normal-invoice-form"
    >
      <div
        className="grid gap-6 md:grid-cols-3"
        data-tour="normal-invoice-main-fields"
      >
        <Input
          type="date"
          label="Data de Emissão"
          {...register("issueDate")}
          error={errors.issueDate?.message}
          disabled
        />
        <Input
          type="date"
          label="Data de Vencimento"
          {...register("dueDate")}
          error={errors.dueDate?.message}
          required
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

        <div data-tour="normal-invoice-client">
          <AsyncCreatableSelectField
            minChars={2}
            endpoint="/clients"
            optionFilter={isSelectableClient}
            label="Cliente"
            placeholder="Digite o nome do cliente..."
            value={selectedClient}
            onChange={handleClientChange}
            displayFields={clientDisplayFields}
            formatCreateLabel={(inputValue: string) => `➕ Criar "${inputValue}"`}
            error={errors.client?.name?.message}
          />
        </div>
        <input type="hidden" {...register("clientId")} />
        <input type="hidden" {...register("client.name")} />
      </div>

      {clientState.hasClient && (
        <div
          className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-300"
          data-tour="normal-invoice-client-details"
        >
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


      <div data-tour="normal-invoice-notes">
        <Textarea
          {...register("notes")}
          placeholder="Adicione observações sobre esta factura (opcional)"
          label="Observações"
          error={errors.notes?.message}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setSelectedClient(null);
          }}
          disabled={isSubmitting || isPending}
        >
          Limpar Formulário
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isPending}
          className="min-w-[150px]"
          data-tour="normal-invoice-submit"
        >
          {isPending || isSubmitting ? "A processar..." : "Criar factura"}
        </Button>
      </div>
    </form>
  );
}
