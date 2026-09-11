"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { StoreFormData, storeSchema } from "@/schemas";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ButtonSubmit,
  GlobalModal,
  Icon,
  Input,
} from "@/components";
import { currentStoreStore } from "@/stores/entities/current-store-store";
import { useAddStore, useUpdateStore } from "@/hooks/entities";

type StoreModalProps = {
  action: "add" | "edit";
};

export function StoreModal({ action }: StoreModalProps) {
  const { closeModal, open } = useModal();
  const isOpen = open["add-store"] || open["edit-store"];
  const { currentStore } = currentStoreStore();

  const { mutateAsync: addStore, isPending: isAdding } = useAddStore();
  const { mutateAsync: editStore, isPending: isEditing } = useUpdateStore();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "SEDE",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (action === "edit" && currentStore) {
      reset({
        name: currentStore.name || "",
        code: currentStore.code || "SEDE",
        email: currentStore.email || "",
        phone: currentStore.phone || "",
        address: currentStore.address || "",
      });
      return;
    }

    if (action === "add" && isOpen) {
      reset({
        name: "",
        code: "SEDE",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [action, currentStore, isOpen, reset]);

  async function onSubmit(data: StoreFormData) {
    try {
      if (action === "add") {
        await addStore(data);
      } else if (action === "edit" && currentStore) {
        await editStore({ id: currentStore.id, data });
      }

      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Não foi possível guardar a loja.",
      );
    }
  }

  const handleCancel = () => {
    reset({
      name: "",
      code: "SEDE",
      email: "",
      phone: "",
      address: "",
    });
    closeModal(action === "add" ? "add-store" : "edit-store");
  };

  if ((action === "edit" && !currentStore) || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id={action === "add" ? "add-store" : "edit-store"}
      title={action === "add" ? "Adicionar Loja" : "Editar Loja"}
      className="!max-h-[85vh] sm:!w-[600px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {action === "add" && (
          <Alert className="border-primary/20 bg-primary/5">
            <Icon name="Info" className="text-primary" />
            <AlertTitle>Código fiscal do estabelecimento</AlertTitle>
            <AlertDescription>
              O código padrão é SEDE. Para utilizar outro código, registe
              primeiro o estabelecimento na AGT e introduza exactamente o
              código atribuído.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            startIcon="User"
            placeholder="Ex: Loja Central"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Código do Estabelecimento"
            startIcon="Code"
            placeholder="Ex: SEDE ou 001"
            maxLength={20}
            {...register("code", {
              onChange: (event) => {
                event.target.value = event.target.value.toUpperCase();
              },
            })}
            error={errors.code?.message}
          />

          <Input
            label="Telefone"
            startIcon="Phone"
            maxLength={9}
            placeholder="9xxxxxxxx"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Input
            type="email"
            label="Email"
            startIcon="Mail"
            placeholder="Ex: loja@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Endereço"
            placeholder="Ex: Rua da Independência, 123"
            startIcon="MapPin"
            {...register("address")}
            error={errors.address?.message}
          />
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
