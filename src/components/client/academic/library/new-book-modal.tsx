"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { FormModal, Input } from "@/components";
import { useLibrary } from "@/hooks/school/use-library";
import { getApiErrorMessage } from "@/utils/api-error";

const EMPTY = { title: "", author: "", isbn: "", category: "", location: "", copies: 1 };

export function NewBookModal() {
  const { createBook } = useLibrary();
  const [f, setF] = useState(EMPTY);
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((p) => ({ ...p, [k]: v }));

  const isbnError = isbnProblem(f.isbn);
  const submit = () =>
    createBook
      .mutateAsync({ title: f.title.trim(), author: f.author.trim(), isbn: f.isbn.trim() || undefined, category: f.category.trim() || undefined, location: f.location.trim() || undefined, copies: f.copies })
      .then(() => { SucessMessage("Obra cadastrada no acervo."); setF(EMPTY); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível cadastrar a obra.")); throw err; });

  return (
    <FormModal id="library-new-book" title="Cadastrar Obra" description="Registe uma obra e o número de exemplares." submitLabel="Cadastrar" isLoading={createBook.isPending} onSubmit={submit} disabled={!f.title.trim() || !f.author.trim() || Boolean(isbnError)}>
      <Input label="Título *" startIcon="BookMarked" value={f.title} onChange={(e) => set("title", e.target.value)} />
      <Input label="Autor *" startIcon="User" value={f.author} onChange={(e) => set("author", e.target.value)} />
      <Input label="ISBN" startIcon="Hash" placeholder="Ex: 978-989-23-1234-5" value={f.isbn} error={isbnError} onChange={(e) => set("isbn", e.target.value)} />
      <Input label="Exemplares *" type="quantity" min={1} max={5000} step={1} value={f.copies} onChange={(e) => set("copies", Math.max(1, Math.min(5000, Number(e.target.value) || 1)))} />
      <Input label="Categoria" startIcon="Folder" placeholder="Ex: Manual do MED" value={f.category} onChange={(e) => set("category", e.target.value)} />
      <Input label="Localização" startIcon="MapPin" placeholder="Estante B, prateleira 3" value={f.location} onChange={(e) => set("location", e.target.value)} />
    </FormModal>
  );
}

/** ISBN opcional: com 10 ou 13 dígitos (hífenes e espaços não contam; o último dígito do ISBN-10 pode ser X). */
export function isbnProblem(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const compact = v.replace(/[\s-]/g, "").toUpperCase();
  return /^(\d{9}[\dX]|\d{13})$/.test(compact) ? undefined : "O ISBN deve ter 10 ou 13 dígitos (ex: 978-989-23-1234-5).";
}
