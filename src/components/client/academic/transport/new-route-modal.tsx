"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, FormModal, Icon, Input } from "@/components";
import { useTransport } from "@/hooks/school/use-transport";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { formatPhone } from "@/utils/format-phone";
import { transportRouteSchema, type TransportRouteFormData } from "@/schemas";
import type { z } from "zod";

type TransportRouteInput = z.input<typeof transportRouteSchema>;

const DEFAULT_VALUES: TransportRouteInput = {
  name: "",
  plate: "",
  driver: "",
  phone: "",
  capacity: 30,
  stops: [
    { name: "", time: "" },
    { name: "", time: "" },
  ],
};

export function NewRouteModal() {
  const { createRoute } = useTransport();
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid },
  } = useForm<TransportRouteInput, unknown, TransportRouteFormData>({
    resolver: zodResolver(transportRouteSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "stops" });

  const onSubmit = (data: TransportRouteFormData) =>
    createRoute
      .mutateAsync({
        name: data.name,
        vehiclePlate: data.plate || undefined,
        driverName: data.driver || undefined,
        driverPhone: data.phone || undefined,
        capacity: data.capacity,
        stops: data.stops
          .filter((s) => Boolean(s.name && s.name.trim().length >= 2))
          .map((s) => ({ name: s.name!.trim(), pickupTime: s.time || undefined })),
      })
      .then(() => {
        SucessMessage("Rota criada.");
        reset(DEFAULT_VALUES);
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError, {
          vehicle_plate: "plate",
          driver_name: "driver",
          driver_phone: "phone",
        });
        ErrorMessage(getApiErrorMessage(err, "Não foi possível criar a rota."));
        throw err;
      });

  return (
    <FormModal
      id="transport-new-route"
      title="Nova rota"
      description="Defina a viatura, o motorista e as paragens por ordem."
      size="lg"
      submitLabel="Criar rota"
      isLoading={createRoute.isPending}
      disabled={!isValid || createRoute.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => reset(DEFAULT_VALUES)}
    >
      <div className="sm:col-span-2">
        <Input
          label="Nome da rota *"
          startIcon="Route"
          placeholder="Ex: Rota Norte (Cacuaco)"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>
      <Input
        label="Matrícula da viatura"
        startIcon="Bus"
        placeholder="LD-12-34-AB"
        error={errors.plate?.message}
        {...register("plate", {
          onChange: (e) => {
            e.target.value = e.target.value.toUpperCase();
          },
        })}
      />
      <Controller
        control={control}
        name="capacity"
        render={({ field }) => (
          <Input
            label="Lotação *"
            type="quantity"
            min={1}
            max={120}
            step={1}
            placeholder="Ex.: 30"
            error={errors.capacity?.message}
            value={field.value as number}
            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={field.onBlur}
          />
        )}
      />
      <Input
        label="Motorista"
        startIcon="User"
        placeholder="Ex.: Manuel António Domingos"
        error={errors.driver?.message}
        {...register("driver")}
      />
      <Input
        label="Telefone"
        startIcon="Phone"
        type="tel"
        placeholder="Ex: 923 000 000"
        error={errors.phone?.message}
        {...register("phone", {
          onChange: (e) => {
            e.target.value = formatPhone(e.target.value);
          },
        })}
      />
      <div className="sm:col-span-2 space-y-2">
        <p className="text-sm font-medium">Paragens (por ordem)</p>
        {fields.map((fieldItem, i) => (
          <div key={fieldItem.id} className="grid grid-cols-[1fr_130px_auto] items-start gap-2">
            <Input
              placeholder={`Paragem ${i + 1}`}
              error={errors.stops?.[i]?.name?.message}
              {...register(`stops.${i}.name`)}
            />
            <Input
              type="time"
              error={errors.stops?.[i]?.time?.message}
              {...register(`stops.${i}.time`)}
            />
            {fields.length > 1 && (
              <Button type="button" size="icon" variant="ghost" aria-label={`Remover paragem ${i + 1}`} onClick={() => remove(i)}>
                <Icon name="Trash2" className="size-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" size="sm" variant="ghost" className="gap-1" onClick={() => append({ name: "", time: "" })}>
          <Icon name="Plus" className="size-3.5" />
          Mais uma paragem
        </Button>
      </div>
    </FormModal>
  );
}
