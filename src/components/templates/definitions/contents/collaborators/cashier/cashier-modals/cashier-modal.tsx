"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import {
  Button,
  Input,
  GlobalModal,
  ButtonSubmit,
  RequestError,
  PaginatedSelect,
} from "@/components";
import { useGetStoresPaginated } from "@/hooks/entities";
import {
  CashierFormData,
  cashierSchema,
} from "@/schemas/add-cashier";
import { currentCashierStore } from "@/stores/collaborators";
import {
  useAddCashier,
  useUpdateCashier,
} from "@/hooks/collaborators/cashier/use-cashier";


type CashierModalProps = {
  action: "add" | "edit";
};

export function CashierModal({ action }: CashierModalProps) {
  const { closeModal, open } = useModal();
  const isOpen = open["add-cashier"] || open["edit-cashier"];
  const { currentCashier } = currentCashierStore();
  const { mutateAsync: addCashier, isPending: isAdding } =
    useAddCashier();
  const { mutateAsync: editCashier, isPending: isEditing } =
    useUpdateCashier();

  const {
    data: storesData,
    isLoading: isLoadingStores,
    isError,
    refetch,
    page: storesPage,
    setPage: setStoresPage,
    totalPages: storesTotalPages,
  } = useGetStoresPaginated();

  const stores = storesData?.map((store) => ({
    label: store.name,
    value: store.id,
  })) || [];

  const {
    reset,
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CashierFormData>({
    resolver: zodResolver(cashierSchema),
    mode: "onChange",
    defaultValues: {
      role: "CASHIER",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (action === "edit" && currentCashier) {
      reset({
        name: currentCashier.name,
        phone: currentCashier.phone || "",
        role: currentCashier.role as "CASHIER",
        storeId: currentCashier.storeId,
      });
    } else {
      reset({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "CASHIER",
        storeId: "",
      });
    }
  }, [action, currentCashier, isOpen, reset]);

  async function onSubmit(data: CashierFormData) {
    try {
      const { password, ...finalData } = data;

      if (action === "add") {
        await addCashier({
          ...finalData,
          password,
          storeId: data.storeId,
        });
      } else if (action === "edit" && currentCashier) {
        await editCashier({
          id: currentCashier.id,
          data: {
            name: finalData.name,
            phone: finalData.phone,
            role: finalData.role,
            storeId: data.storeId,
          },
        });
      }

      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Não foi possível guardar o operador de caixa."
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal(action === "add" ? "add-cashier" : "edit-cashier");
  };

  if ((action === "edit" && !currentCashier) || !isOpen) return null;
  if (isLoadingStores && !storesData) return <p>A carregar lojas...</p>;
  if (isError)
    return (
      <RequestError
        refetch={refetch}
        message="Ocorreu um erro ao carregar as lojas"
      />
    );

  return (
    <GlobalModal
      canClose
      id={action === "add" ? "add-cashier" : "edit-cashier"}
      title={action === "add" ? "Adicionar Caixa" : "Editar Caixa"}
      className="!max-h-[85vh] !w-max"
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



          <div className="w-full col-span-2">
            <Controller
              name="storeId"
              control={control}
              render={({ field }) => (
                <PaginatedSelect
                  label="Lojas"
                  className="w-full"
                  options={stores}
                  value={field.value}
                  isLoading={isLoadingStores}
                  pagination={{
                    page: storesPage,
                    totalPages: storesTotalPages,
                  }}
                  onPageChange={setStoresPage}
                  onChange={field.onChange}
                  error={errors.storeId?.message}
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
