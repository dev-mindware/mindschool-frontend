"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { currentCategoryStore, useModal } from "@/stores";
import { CategoryFormData, categorySchema } from "@/schemas";
import { useAddCategory, useUpdateCategory } from "@/hooks/category";
import {
  Input,
  Button,
  Textarea,
  ButtonSubmit,
  GlobalModal,
} from "@/components";

type CategoryModalProps = {
  action: "add" | "edit";
};

export function CategoryModal({ action }: CategoryModalProps) {
  const { closeModal, open } = useModal();
  const isOpen = open["add-category"] || open["edit-category"];
  const { currentCategory } = currentCategoryStore();

  const { mutateAsync: addCategory, isPending: isAdding } = useAddCategory();
  const { mutateAsync: editCategory, isPending: isEditing } =
    useUpdateCategory();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (action === "edit" && currentCategory) {
      reset({
        name: currentCategory.name,
        description: currentCategory.description || "",
      });
    }
  }, [action, currentCategory, reset]);

  async function onSubmit(data: CategoryFormData) {
    try {
      if (action === "add") {
        await addCategory(data);
        reset();
      } else if (action === "edit" && currentCategory) {
        await editCategory({ id: currentCategory.id, data });
      }
      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
        "Não foi possível guardar a categoria."
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal(action === "add" ? "add-category" : "edit-category");
  };

  if (action === "edit" && !currentCategory || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id={action === "add" ? "add-category" : "edit-category"}
      title={action === "add" ? "Adicionar Categoria" : "Editar Categoria"}
      className="!max-w-md !w-[90vw] md:!w-full"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[80vh]"
      >
        <Input
          label="Nome"
          startIcon="Tag"
          placeholder="Ex: Plásticos, Cosméticos..."
          {...register("name")}
          error={errors.name?.message}
        />

        <Textarea
          label="Descrição"
          id="description"
          {...register("description")}
          placeholder="Escreva aqui..."
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            className="w-max"
            onClick={handleCancel}
          >
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
