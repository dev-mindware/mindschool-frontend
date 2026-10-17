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

  const submit = () =>
    createBook
      .mutateAsync({ title: f.title.trim(), author: f.author.trim(), isbn: f.isbn.trim() || undefined, category: f.category.trim() || undefined, location: f.location.trim() || undefined, copies: f.copies })
      .then(() => { SucessMessage("Obra cadastrada no acervo."); setF(EMPTY); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível cadastrar a obra.")); throw err; });

  return (
    <FormModal id="library-new-book" title="Cadastrar Obra" description="Registe uma obra e o número de exemplares." submitLabel="Cadastrar" isLoading={createBook.isPending} onSubmit={submit} disabled={!f.title.trim() || !f.author.trim()}>
      <Input label="Título *" startIcon="BookMarked" value={f.title} onChange={(e) => set("title", e.target.value)} />
      <Input label="Autor *" startIcon="User" value={f.author} onChange={(e) => set("author", e.target.value)} />
      <Input label="ISBN" startIcon="Hash" value={f.isbn} onChange={(e) => set("isbn", e.target.value)} />
      <Input label="Exemplares *" type="quantity" min={1} max={5000} step={1} value={f.copies} onChange={(e) => set("copies", Math.max(1, Math.min(5000, Number(e.target.value) || 1)))} />
      <Input label="Categoria" startIcon="Folder" placeholder="Ex: Manual do MED" value={f.category} onChange={(e) => set("category", e.target.value)} />
      <Input label="Localização" startIcon="MapPin" placeholder="Estante B, prateleira 3" value={f.location} onChange={(e) => set("location", e.target.value)} />
    </FormModal>
  );
}
