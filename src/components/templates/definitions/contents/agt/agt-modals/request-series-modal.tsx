"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  ButtonSubmit,
  GlobalModal,
  Input,
  SelectField,
} from "@/components";
import { useRequestAgtSeries } from "@/hooks/agt";
import {
  requestAgtSeriesSchema,
  type RequestAgtSeriesFormData,
} from "@/schemas/agt-schema";
import { storesService } from "@/services";
import { useModal } from "@/stores";
import type { StoreResponse } from "@/types";
import { ErrorMessage, getApiErrorMessage } from "@/utils";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "FT", label: "Factura (FT)" },
  { value: "FR", label: "Factura-recibo (FR)" },
  { value: "RC", label: "Recibo (RC)" },
  { value: "NC", label: "Nota de crédito (NC)" },
];

export function RequestSeriesModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["request-agt-series"];
  const { mutateAsync: requestSeries, isPending } = useRequestAgtSeries();

  const { data: stores = [], isLoading: isStoresLoading } = useQuery({
    queryKey: ["stores", "agt-series-modal"],
    queryFn: async () => {
      const response = await storesService.getStores();
      return (response.data?.data || []) as StoreResponse[];
    },
    enabled: Boolean(isOpen),
  });

  const {
    reset,
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RequestAgtSeriesFormData>({
    resolver: zodResolver(requestAgtSeriesSchema),
    mode: "onChange",
    defaultValues: {
      documentType: "FT",
      seriesYear: new Date().getFullYear().toString(),
      storeId: "",
      establishmentNumber: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        documentType: "FT",
        seriesYear: new Date().getFullYear().toString(),
        storeId: "",
        establishmentNumber: "",
      });
    }
  }, [isOpen, reset]);

  const storeOptions = stores.map((store) => ({
    value: store.id,
    label: `${store.code || "SEDE"} - ${store.name}`,
  }));

  async function onSubmit(data: RequestAgtSeriesFormData) {
    try {
      await requestSeries(data);
      handleCancel();
    } catch (error) {
      ErrorMessage(
        getApiErrorMessage(error, "Erro ao solicitar nova série."),
      );
    }
  }

  function handleCancel() {
    reset();
    closeModal("request-agt-series");
  }

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="request-agt-series"
      title="Nova série AGT"
      className="!max-w-md !w-[90vw] md:!w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh]">
        <p className="text-sm text-muted-foreground -mt-2">
          Solicite uma numeração oficial para documentos fiscais.
        </p>

        <Controller
          name="documentType"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Tipo de documento"
              value={field.value}
              onValueChange={field.onChange}
              options={DOCUMENT_TYPE_OPTIONS}
              placeholder="Seleccione o tipo"
            />
          )}
        />
        {errors.documentType && (
          <p className="text-xs text-red-500 -mt-4">
            {errors.documentType.message}
          </p>
        )}

        <Input
          label="Ano fiscal"
          {...register("seriesYear")}
          disabled
          error={errors.seriesYear?.message}
        />

        <Controller
          name="storeId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Loja"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                const selectedStore = stores.find((store) => store.id === value);
                setValue(
                  "establishmentNumber",
                  selectedStore?.code || "SEDE",
                  { shouldValidate: true },
                );
              }}
              options={storeOptions}
              placeholder={
                isStoresLoading ? "A carregar lojas..." : "Seleccionar loja"
              }
            />
          )}
        />
        {errors.storeId && (
          <p className="text-xs text-red-500 -mt-4">{errors.storeId.message}</p>
        )}

        <Input
          label="Código do estabelecimento"
          placeholder="Ex: SEDE"
          maxLength={20}
          {...register("establishmentNumber")}
          onChange={(event) =>
            setValue(
              "establishmentNumber",
              event.target.value.toUpperCase(),
              { shouldValidate: true },
            )
          }
          value={watch("establishmentNumber") || ""}
          error={errors.establishmentNumber?.message}
        />
        <p className="text-xs text-muted-foreground -mt-4">
          Use o código configurado na loja ou informe manualmente.
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            className="w-max"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            className="w-max"
            isLoading={isSubmitting || isPending || isStoresLoading}
          >
            Confirmar
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
