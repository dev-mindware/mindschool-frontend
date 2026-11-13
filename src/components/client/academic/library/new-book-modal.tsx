"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { FormModal, Input } from "@/components";
import { useLibrary } from "@/hooks/school/use-library";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { isValidIsbn, libraryBookSchema, type LibraryBookFormData } from "@/schemas";
import type { z } from "zod";

type LibraryBookInput = z.input<typeof libraryBookSchema>;

export function NewBookModal() {
  const { createBook } = useLibrary();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid },
  } = useForm<LibraryBookInput, unknown, LibraryBookFormData>({
    resolver: zodResolver(libraryBookSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      copies: 1,
      category: "",
      location: "",
    },
  });

  const onSubmit = (data: LibraryBookFormData) =>
    createBook
      .mutateAsync({
        title: data.title,
        author: data.author,
        isbn: data.isbn || undefined,
        category: data.category || undefined,
        location: data.location || undefined,
        copies: data.copies,
      })
      .then(() => {
        SucessMessage("Obra cadastrada no acervo.");
        reset();
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError);
        ErrorMessage(getApiErrorMessage(err, "Não foi possível cadastrar a obra."));
        throw err;
      });

  return (
    <FormModal
      id="library-new-book"
      title="Cadastrar Obra"
      description="Registe uma obra e o número de exemplares."
      submitLabel="Cadastrar"
      isLoading={createBook.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => reset()}
      disabled={!isValid || createBook.isPending}
    >
      <Input
        label="Título da obra *"
        startIcon="BookMarked"
        placeholder="Ex.: Terra Sonâmbula"
        error={errors.title?.message}
        {...register("title")}
      />
      <Input
        label="Autor principal *"
        startIcon="User"
        placeholder="Ex.: Mia Couto"
        error={errors.author?.message}
        {...register("author")}
      />
      <Input
        label="ISBN"
        startIcon="Hash"
        placeholder="Ex: 978-989-23-1234-5"
        error={errors.isbn?.message}
        {...register("isbn")}
      />
      <Input
        label="Exemplares disponíveis *"
        type="quantity"
        min={1}
        max={5000}
        step={1}
        placeholder="Ex.: 5"
        error={errors.copies?.message}
        {...register("copies", { valueAsNumber: true })}
      />
      <Input
        label="Categoria"
        startIcon="Folder"
        placeholder="Ex: Manual do MED"
        error={errors.category?.message}
        {...register("category")}
      />
      <Input
        label="Localização"
        startIcon="MapPin"
        placeholder="Estante B, prateleira 3"
        error={errors.location?.message}
        {...register("location")}
      />
    </FormModal>
  );
}

/** ISBN opcional: com 10 ou 13 dígitos e dígito de controlo válido. */
export function isbnProblem(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  return isValidIsbn(v)
    ? undefined
    : "O ISBN deve ter 10 ou 13 dígitos e dígito de controlo válido (ex: 978-0-306-40615-7).";
}
