"use client";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal, currentStockStore } from "@/stores";
import {
  StockReserveFormData,
  stockReserveSchema,
} from "@/schemas/stock-schema";
import { useReserveStock, useUpdateReservation } from "@/hooks";
import {
  Button,
  Input,
  GlobalModal,
  ButtonSubmit,
  Textarea,
  PaginatedSelect,
  DatePicker,
} from "@/components";
import TimeInput from "@/components/custom/time-input";
import { useGetClients } from "@/hooks/entities";
import { parseTime, Time } from "@internationalized/date";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export function ReserveStockModal() {
  const router = useRouter();
  const { closeModal, open } = useModal();
  const isOpen = open["reserve-stock"];
  const { currentStock, currentReservation, setCurrentReservation } =
    currentStockStore();
  const { mutateAsync: reserveStock, isPending: isReserving } =
    useReserveStock();
  const { mutateAsync: updateReservation, isPending: isUpdating } =
    useUpdateReservation();
  const {
    clientOptions,
    clients,
    pagination: clientPagination,
    setPage: setClientPage,
  } = useGetClients();

  const filteredClientOptions = useMemo(() => {
    return (clientOptions || []).filter((opt) => {
      const client = clients?.find((c) => c.id === opt.value);
      return (
        client?.name?.toLowerCase() !== "consumidor final" &&
        !opt.label.toLowerCase().startsWith("consumidor final")
      );
    });
  }, [clientOptions, clients]);

  const isEditing = !!currentReservation;

  const {
    control,
    reset,
    register,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockReserveFormData & { startTime: string; endTime: string }>({
    resolver: zodResolver(stockReserveSchema),
    mode: "onChange",
    defaultValues: {
      startTime: "09:00",
      endTime: "18:00",
    },
  });

  useEffect(() => {
    if (currentReservation) {
      const startStr = currentReservation.startDate;
      const endStr = currentReservation.endDate;

      const startDate = parseISO(startStr);
      const endDate = parseISO(endStr);

      setValue("itemsId", currentReservation.itemsId);
      setValue("clientId", currentReservation.clientId);
      setValue("quantity", currentReservation.quantity);
      setValue("description", currentReservation.description);
      setValue("startDate", format(startDate, "yyyy-MM-dd"));
      setValue("endDate", format(endDate, "yyyy-MM-dd"));
      setValue("startTime", format(startDate, "HH:mm"));
      setValue("endTime", format(endDate, "HH:mm"));
    } else if (currentStock?.itemsId) {
      setValue("itemsId", currentStock.itemsId);
      setValue("startDate", format(new Date(), "yyyy-MM-dd"));
      setValue("endDate", format(new Date(), "yyyy-MM-dd"));
    }
  }, [currentReservation, currentStock, setValue]);

  async function onSubmit(data: any) {
    const item = currentReservation?.item || currentStock;
    if (!item) return;

    // Combine date and time as local ISO string (no Z = local time, avoids UTC shift)
    const startDateTime = `${data.startDate}T${data.startTime}:00`;
    const endDateTime = `${data.endDate}T${data.endTime}:00`;

    const { startTime, endTime, ...rest } = data;

    const payload = {
      ...rest,
      startDate: startDateTime,
      endDate: endDateTime,
    };

    try {
      if (isEditing) {
        await updateReservation({ id: currentReservation.id, data: payload });
      } else {
        if (data.quantity > (currentStock?.available || 0)) {
          ErrorMessage(
            `A quantidade não pode ser maior que ${currentStock?.available} (disponível)`,
          );
          return;
        }
        await reserveStock({ ...payload, itemsId: currentStock!.itemsId });
      }
      router.push("/management/reservation");
      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Ocorreu um erro ao processar a reserva.",
      );
    }
  }

  const handleCancel = () => {
    reset();
    setCurrentReservation(null);
    closeModal("reserve-stock");
  };

  if (!isOpen) return null;

  const displayItem = currentReservation?.item || currentStock?.item;
  const available = currentStock?.available ?? (currentReservation ? "N/A" : 0);

  return (
    <GlobalModal
      canClose
      id="reserve-stock"
      title={isEditing ? "Editar Reserva" : "Reservar Stock"}
      className="!max-w-3xl"
    >
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Produto:</span>{" "}
          {displayItem?.name || "N/A"}
        </p>
        {!isEditing && (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Disponível:</span>{" "}
              <span className="text-green-600 font-semibold">{available}</span>
            </p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <div>
                  <Input
                    type="quantity"
                    label="Quantidade"
                    placeholder="Ex: 5"
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={errors.quantity?.message}
                  />
                  {!isEditing && currentStock && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Máximo: {currentStock.available}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="clientId"
              render={({ field: { onChange, value } }) => (
                <PaginatedSelect
                  label="Cliente"
                  value={value}
                  options={filteredClientOptions}
                  onChange={onChange}
                  pagination={clientPagination}
                  onPageChange={setClientPage}
                  placeholder="Seleccione um cliente"
                  className="w-full"
                  error={errors.clientId?.message}
                  disabled={isEditing}
                  fullWidth
                />
              )}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Início</label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    className="flex-1"
                    value={value ? new Date(value) : undefined}
                    onChange={(_, formatted) => onChange(formatted)}
                  />
                )}
              />
              <Controller
                control={control}
                name="startTime"
                render={({ field: { onChange, value } }) => (
                  <TimeInput
                    className="w-[120px]"
                    hourCycle={24}
                    value={value ? parseTime(value) : undefined}
                    onChange={(time: Time) =>
                      onChange(time.toString().slice(0, 5))
                    }
                  />
                )}
              />
            </div>
            {errors.startDate && (
              <p className="text-xs text-red-500">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fim</label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    className="flex-1"
                    value={value ? new Date(value) : undefined}
                    onChange={(_, formatted) => onChange(formatted)}
                  />
                )}
              />
              <Controller
                control={control}
                name="endTime"
                render={({ field: { onChange, value } }) => (
                  <TimeInput
                    className="w-[120px]"
                    hourCycle={24}
                    value={value ? parseTime(value) : undefined}
                    onChange={(time: Time) =>
                      onChange(time.toString().slice(0, 5))
                    }
                  />
                )}
              />
            </div>
            {errors.endDate && (
              <p className="text-xs text-red-500">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <Textarea
          label="Descrição"
          placeholder="Ex: Reserva de stock para cliente"
          {...register("description")}
          error={errors.description?.message}
        />

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit
            className="w-max"
            isLoading={isSubmitting || isReserving || isUpdating}
          >
            {isEditing ? "Guardar alterações" : "Reservar stock"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
