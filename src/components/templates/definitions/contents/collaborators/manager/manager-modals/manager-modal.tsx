"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { ManagerFormData, managerSchema } from "@/schemas";
import { useModal, currentManagerStore } from "@/stores";
import {
  Button,
  Input,
  GlobalModal,
  ButtonSubmit,
  MultiSelect,
  FeatureGate,
} from "@/components";
import { useAddManager, useUpdateManager } from "@/hooks/collaborators";
import { useGetStores } from "@/hooks/entities";
import { useAuth } from "@/hooks/auth";
import { hasPlanAccess } from "@/lib/features";
import { PlanType } from "@/types";
import { generateBarcode } from "@/utils";
import { Wand2 } from "lucide-react";

type ManagerModalProps = {
  action: "add" | "edit";
};

export function ManagerModal({ action }: ManagerModalProps) {
  const { stores } = useGetStores();
  const { user } = useAuth();
  const { closeModal, open } = useModal();
  const { currentManager } = currentManagerStore();
  const isOpen = open["add-manager"] || open["edit-manager"];
  const [selectedStores, setSelectedStores] = useState<
    { label: string; value: string }[]
  >([]);

  const currentPlan =
    (user?.company?.subscription?.plan?.name as PlanType) || "Base";
  const canUseBarcode = hasPlanAccess(currentPlan, "Smart");

  const { mutateAsync: addManager, isPending: isAdding } = useAddManager();
  const { mutateAsync: editManager, isPending: isEditing } = useUpdateManager();

  const {
    reset,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (action === "edit" && currentManager) {
      reset({
        name: currentManager.name,
        phone: currentManager.phone || "",
        barcode: canUseBarcode ? currentManager.barcode || "" : "",
        storeIds: currentManager.stores?.map((s) => s.id) || [],
      });
      setSelectedStores(
        currentManager.stores?.map((s) => ({
          label: s.name,
          value: s.id,
        })) || []
      );
    } else {
      setSelectedStores([]);
      reset({
        name: "",
        phone: "",
        email: "",
        password: "",
        barcode: canUseBarcode ? generateBarcode() : "",
        storeIds: [],
      });
    }
  }, [action, currentManager, isOpen, reset, canUseBarcode]);

  async function onSubmit(data: ManagerFormData) {
    try {
      const { password, ...finalData } = data;
      const barcode = canUseBarcode ? finalData.barcode : undefined;

      if (action === "add") {
        await addManager({ ...data, barcode });
      } else if (action === "edit" && currentManager) {
        await editManager({
          id: currentManager.id,
          data: {
            name: finalData.name,
            phone: finalData.phone,
            ...(canUseBarcode ? { barcode: finalData.barcode } : {}),
            storeIds: finalData.storeIds,
          },
        });
      }

      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Não foi possível guardar o gerente."
      );
    }
  }

  const handleCancel = () => {
    reset();
    setSelectedStores([]);
    closeModal(action === "add" ? "add-manager" : "edit-manager");
  };

  const handleGenerateBarcode = () => {
    setValue("barcode", generateBarcode(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if ((action === "edit" && !currentManager) || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      className="!max-h-[85vh] !w-max"
      id={action === "add" ? "add-manager" : "edit-manager"}
      title={action === "add" ? "Adicionar Gerente" : "Editar Gerente"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            startIcon="User"
            placeholder="Ex: John Doe"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Telefone"
            startIcon="Phone"
            maxLength={9}
            placeholder="9xxxxxxxx"
            {...register("phone")}
            error={errors.phone?.message}
          />

          {action === "add" && (
            <>
              <Input
                type="email"
                label="Email"
                startIcon="Mail"
                placeholder="Ex: cea.co@gmail.com"
                {...register("email")}
                error={errors.email?.message}
              />

              <Input
                label="Palavra-passe"
                startIcon="Lock"
                placeholder="Ex: 12345678"
                {...register("password")}
                error={errors.password?.message}
              />
            </>
          )}

          <FeatureGate minPlan="Smart" fallback="hidden">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Código de barras
              </label>
              <div className="flex items-start gap-2">
                <Input
                  startIcon="Barcode"
                  placeholder="Introduza ou gere o código de barras"
                  {...register("barcode")}
                  error={errors.barcode?.message}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  title="Gerar código de barras"
                  aria-label="Gerar código de barras"
                  onClick={handleGenerateBarcode}
                >
                  <Wand2 className="size-4" />
                </Button>
              </div>
            </div>
          </FeatureGate>

          <div className="flex items-end gap-2 sm:col-span-2">
            <Controller
              name="storeIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Lojas"
                  className="w-full"
                  options={stores}
                  value={selectedStores}
                  isLoading={!stores.length}
                  onChange={(options) => {
                    setSelectedStores(options);
                    field.onChange(options.map((o) => o.value));
                  }}
                  error={errors.storeIds?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit
            className="w-max"
            isLoading={isSubmitting || isAdding || isEditing}
          >
            {action === "add" ? "Adicionar" : "Guardar alterações"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
