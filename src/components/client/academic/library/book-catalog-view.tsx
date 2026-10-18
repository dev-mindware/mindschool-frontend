"use client";

import { useMemo } from "react";
import { Badge, ButtonOnlyAction, DataList, type Column } from "@/components";
import { useLibrary } from "@/hooks/school/use-library";
import type { ApiBook } from "@/services/library-service";
import { useModal } from "@/stores/modal/use-modal-store";

const availability = (b: ApiBook) => (!b.is_active ? "retirado" : b.copies_available > 0 ? "disponivel" : "esgotado");

export function BookCatalogView() {
  const { allBooks, isLoading } = useLibrary();
  const { openModal } = useModal();

  const categories = useMemo(() => [...new Set(allBooks.map((b) => b.category).filter((c): c is string => Boolean(c)))].sort(), [allBooks]);
  const locations = useMemo(() => [...new Set(allBooks.map((b) => b.location).filter((c): c is string => Boolean(c)))].sort(), [allBooks]);

  const columns: Column<ApiBook>[] = [
    { key: "isbn", header: "ISBN", render: (_, b) => <span className="font-mono text-xs text-muted-foreground">{b.isbn ?? "—"}</span> },
    { key: "title", header: "Obra", render: (_, b) => (<div className="flex flex-col"><span className="font-medium">{b.title}</span><span className="text-xs text-muted-foreground">{b.author}</span></div>) },
    { key: "category", header: "Categoria", render: (_, b) => (b.category ? <Badge variant="outline">{b.category}</Badge> : "—") },
    { key: "location", header: "Localização", render: (_, b) => b.location ?? "—" },
    { key: "copies_available", header: "Exemplares", render: (_, b) => <span className="font-mono text-xs">{b.copies_available} / {b.copies_total}</span> },
    {
      key: "is_active", header: "Estado",
      render: (_, b) => {
        const a = availability(b);
        return a === "disponivel" ? <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Disponível</Badge>
          : a === "esgotado" ? <Badge variant="destructive">Esgotado</Badge> : <Badge variant="secondary">Retirado</Badge>;
      },
    },
    {
      key: "action", header: "Acção",
      render: (_, b) => (
        <ButtonOnlyAction data={b} actions={[{ permission: "library:write", label: availability(b) === "disponivel" ? "Emprestar" : "Emprestar (indisponível: sem exemplares)", icon: "BookOpen", onClick: (x) => openModal("library-new-loan", { bookId: x.id }), className: availability(b) === "disponivel" ? "" : "pointer-events-none opacity-40" }]} />
      ),
    },
  ];

  return (
    <DataList<ApiBook>
      prefix="acervo"
      rows={allBooks}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Pesquisar por título, autor ou ISBN"
      searchText={(b) => `${b.title} ${b.author} ${b.isbn ?? ""} ${b.category ?? ""}`}
      filters={[
        { key: "estado", label: "Estado", icon: "Tag", options: [{ value: "disponivel", label: "Disponível" }, { value: "esgotado", label: "Esgotado" }, { value: "retirado", label: "Retirado" }], match: (b, v) => availability(b) === v },
        { key: "categoria", label: "Categoria", icon: "Folder", options: categories.map((c) => ({ value: c, label: c })), match: (b, v) => b.category === v },
        { key: "local", label: "Localização", icon: "MapPin", options: locations.map((c) => ({ value: c, label: c })), match: (b, v) => b.location === v },
      ]}
      sorts={[
        { value: "title", label: "Título", compare: (a, b) => a.title.localeCompare(b.title) },
        { value: "author", label: "Autor", compare: (a, b) => a.author.localeCompare(b.author) },
        { value: "copies", label: "Exemplares disponíveis", compare: (a, b) => a.copies_available - b.copies_available },
      ]}
      emptyTitle="Sem obras"
      emptyDescription="Cadastre obras para constituir o acervo."
      emptyIcon="BookMarked"
    />
  );
}
