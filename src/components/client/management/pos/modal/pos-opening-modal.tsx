"use client";
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GlobalModal,
  Input,
  Button,
  Icon,
  RequestError,
  InputCurrency,
  Textarea,
} from "@/components";
import { useModal } from "@/stores";
import { useGetStoresPaginated } from "@/hooks/entities";
import { useGetCashiersPaginated } from "@/hooks/collaborators/cashier";
import { PosOpeningFormData, posOpeningSchema } from "@/schemas/pos-opening";
import { useCurrentCashierStore } from "@/stores/pos/current-cashier-store";
import { useOpenCashSession, useUpdateCashSession } from "@/hooks/entities";
import { PaginatedSelect } from "@/components/shared/filters/paginated-select";
import { MultiSelect } from "@/components/common/input-fetch/async-multi-select";
import { useAuth } from "@/hooks/auth";
import { ErrorMessage } from "@/utils";
import TimeInput from "@/components/custom/time-input";
import { parseTime } from "@internationalized/date";

interface PosOpeningModalProps {
  selfSessionMode?: boolean;
  onSuccess?: () => void;
}

export function PosOpeningModal({ selfSessionMode = false, onSuccess }: PosOpeningModalProps) {
  const { closeModal, open, modalData } = useModal();
  const { currentCashier, setCurrentCashier } = useCurrentCashierStore();
  const [storePage, setStorePage] = useState(1);

  const isFromRequest = !!(currentCashier as any)?._fromRequest;
  const modalId = open["opening-cashier-from-request"] ? "opening-cashier-from-request" : "opening-cashier";

  const {
    data: storesData,
    isLoading: isLoadingStores,
    isError: storesError,
    totalPages: storeTotalPages,
    refetch: refetchStores,
  } = useGetStoresPaginated(storePage, 10, "OWNER");

  const { mutateAsync: openSession, isPending: isOpening } = useOpenCashSession();
  const { mutateAsync: updateSession, isPending: isUpdating } = useUpdateCashSession();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PosOpeningFormData>({
    resolver: zodResolver(posOpeningSchema),
    defaultValues: {
      initialCapital: "",
      workTime: "06:00",
      storeId: "",
      cashierIds: [],
      fundType: "Cash",
      reason: "",
    },
  });

  const selectedStoreId = watch("storeId");

  const {
    data: allCashiers,
    isLoading: isLoadingCashiers,
  } = useGetCashiersPaginated(1, 100, "", selectedStoreId);

  const { user } = useAuth();

  const cashierOptions = useMemo(() => {
    const cashiersList = allCashiers || [];
    const opts = cashiersList.map((c) => ({
      label: `${c.name} (${c.email})`,
      value: c.id,
    }));

    if (user && (user.role === "OWNER" || user.role === "MANAGER")) {
      if (!opts.some((opt) => opt.value === user.id)) {
        opts.unshift({
          label: `${user.name} (${user.email} - Tu/Gestor)`,
          value: user.id,
        });
      }
    }
    return opts;
  }, [allCashiers, user]);

  const isEdit =
    modalData[modalId]?.mode === "edit" &&
    !!currentCashier &&
    !isFromRequest;

  // No selfSessionMode, injeta o id do utilizador logado nos cashierIds ao montar
  useEffect(() => {
    if (selfSessionMode && user?.id) {
      setValue("cashierIds", [user.id]);
    }
  }, [selfSessionMode, user, setValue]);

  useEffect(() => {
    if (isFromRequest && currentCashier) {
      // Pre-fill from request: user + store already known
      reset({
        initialCapital: "",
        workTime: "06:00",
        storeId: (currentCashier as any).storeId || "",
        cashierIds: (currentCashier as any).userId ? [(currentCashier as any).userId] : [],
        fundType: "Cash",
        reason: "",
      });
    } else if (isEdit && currentCashier) {
      reset({
        initialCapital: (currentCashier.openingCash || 0).toString(),
        workTime: currentCashier.workTime || "06:00",
        storeId: currentCashier.storeId || "",
        cashierIds: currentCashier.userId ? [currentCashier.userId] : [],
        fundType: "Cash",
        reason: "",
      });
    } else if (!selfSessionMode) {
      reset({
        initialCapital: "",
        workTime: "06:00",
        storeId: "",
        cashierIds: [],
        fundType: "Cash",
        reason: "",
      });
    }
  }, [isEdit, isFromRequest, currentCashier, reset, selfSessionMode]);

  const selectedCashierIds = watch("cashierIds") || [];

  const handleClose = () => {
    reset();
    setCurrentCashier(null);
    closeModal("opening-cashier");
    closeModal("opening-cashier-from-request");
  };

  const onSubmit = async (data: PosOpeningFormData) => {
    try {
      if (isEdit && currentCashier) {
        const payload = {
          initialCapital: data.initialCapital,
          reason: data.reason || "",
          workTime: data.workTime,
          fundType: data.fundType?.toUpperCase(),
          storeId: data.storeId,
          cashierIds: data.cashierIds,
        };
        await updateSession({ id: currentCashier.id.toString(), data: payload });
      } else {
        const { reason, ...restData } = data;
        const payload = {
          ...restData,
          fundType: data.fundType?.toUpperCase(),
          ...(isFromRequest && (currentCashier as any)?._requestId
            ? { requestId: (currentCashier as any)._requestId }
            : {}),
        };
        await openSession(payload);
      }
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      // Errors are handled by the mutation's onError
    }
  };

  if (isLoadingStores) {
    return (
      <GlobalModal id={modalId} title="Abertura de Caixa" canClose>
        <div className="p-8 text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            A carregar lojas...
          </p>
        </div>
      </GlobalModal>
    );
  }

  if (storesError) {
    return (
      <GlobalModal id={modalId} title="Abertura de Caixa" canClose className="!w-max">
        <div className="p-4">
          <RequestError
            refetch={refetchStores}
            message="Ocorreu um erro ao carregar as lojas"
          />
        </div>
      </GlobalModal>
    );
  }

  return (
    <GlobalModal
      id={modalId}
      title={isFromRequest ? "Aprovar pedido de abertura" : isEdit ? "Editar configuração de caixa" : "Abertura de caixa"}
      description={
        isFromRequest
          ? "Defina o capital inicial e a loja para autorizar este pedido."
          : isEdit
            ? "Edite as configurações da sessão deste caixa"
            : "Abra o caixa e acompanhe o fluxo de vendas dos seus colaboradores."
      }
      canClose
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:w-[35rem] sm:grid-cols-2">
          <div className="col-span-1 space-y-2">
            <Controller
              name="initialCapital"
              control={control}
              render={({ field }) => (
                <InputCurrency
                  ref={field.ref}
                  value={field.value}
                  decimalScale={2}
                  fixedDecimalScale
                  placeholder="0,00 Kz"
                  allowNegative={false}
                  label="Capital Inicial"
                  startIcon="CircleDollarSign"
                  error={errors.initialCapital?.message}
                  onValueChange={(value) => {
                    field.onChange(value ? String(value) : "");
                  }}
                />
              )}
            />
          </div>
          <div className="space-y-2 col-span-1">
            <Controller
              name="workTime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="space-y-2">
                  <label className="block mb-1 text-sm font-medium text-foreground">
                    Tempo de expediente
                  </label>
                  <TimeInput
                    id="work-time-input"
                    className="w-full"
                    hourCycle={24}
                    isDisabled={isEdit}
                    value={value ? parseTime(value) : undefined}
                    onChange={(time: any) =>
                      onChange(time ? time.toString().slice(0, 5) : "")
                    }
                  />
                  {errors.workTime && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">
                      {errors.workTime.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>


          <div className="col-span-1 space-y-2">
            <Controller
              name="storeId"
              control={control}
              render={({ field }) => (
                <PaginatedSelect
                  label="Loja"
                  placeholder="Seleccione a loja"
                  options={storesData.map((s) => ({ label: s.name, value: s.id }))}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={isLoadingStores}
                  disabled={isEdit}
                  pagination={{ page: storePage, totalPages: storeTotalPages }}
                  onPageChange={setStorePage}
                  fullWidth
                />
              )}
            />
            {errors.storeId && (
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">
                {errors.storeId.message}
              </p>
            )}
          </div>

          {/* No selfSessionMode ou fromRequest o select de caixas é ocultado */}
          {!selfSessionMode && !isFromRequest && (
            <div className="col-span-1 md:col-span-2">
              <Controller
                name="cashierIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label="Caixas Disponíveis para Abertura"
                    placeholder="Escolha os caixas"
                    options={cashierOptions}
                    isDisabled={isEdit}
                    value={cashierOptions.filter((opt) => field.value?.includes(opt.value))}
                    onChange={(options) =>
                      field.onChange(options.map((opt) => opt.value))
                    }
                    isLoading={isLoadingCashiers}
                    error={errors.cashierIds?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Razão da Edição (mostrado apenas ao editar) */}
          {isEdit && (
            <div className="col-span-1 md:col-span-2">
              <Textarea
                label="Razão da Edição"
                placeholder="Insira o motivo desta alteração..."
                {...register("reason")}
                error={errors.reason?.message}
              />
            </div>
          )}

          {/* Banner: pedido aprovado — mostra o colaborador solicitante */}
          {isFromRequest && currentCashier && (
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-400/8 border border-amber-400/25">
                <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center font-bold text-amber-600 shrink-0">
                  {(currentCashier as any).user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Colaborador solicitante</p>
                  <p className="text-sm font-bold">{(currentCashier as any).user?.name}</p>
                  <p className="text-xs text-muted-foreground">{(currentCashier as any).user?.email}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400/15 text-amber-600">
                  Aguarda aprovação
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isOpening || isUpdating}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isEdit ? "Guardar alterações" : "Abrir caixa"}
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
