"use client";

import React from "react";
import { useLibraryStore } from "@/stores/school/library-store";
import { LibraryBook, BookCategory } from "@/types";
import { Badge, Button, Icon, Input } from "@/components";

interface BookCatalogViewProps {
  onOpenNewBookModal: () => void;
  onOpenLoanModal: (book?: LibraryBook) => void;
}

export function BookCatalogView({
  onOpenNewBookModal,
  onOpenLoanModal,
}: BookCatalogViewProps) {
  const {
    books,
    searchQuery,
    categoryFilter,
    setSearchQuery,
    setCategoryFilter,
  } = useLibraryStore();

  const filteredBooks = books.filter((b) => {
    if (categoryFilter !== "ALL" && b.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.author.toLowerCase().includes(q);
      const matchCode = b.code.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchCode;
    }

    return true;
  });

  const getCategoryBadge = (cat: BookCategory) => {
    switch (cat) {
      case "MED_TEXTBOOK":
        return <Badge className="bg-primary hover:bg-primary text-white text-[10px]">Manual do MED</Badge>;
      case "ANGOLAN_LITERATURE":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">Literatura Angolana</Badge>;
      case "WORLD_LITERATURE":
        return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 text-[10px]">Literatura Universal</Badge>;
      case "SCIENCE_TECH":
        return <Badge variant="secondary" className="text-[10px]">Ciências & TI</Badge>;
      case "REFERENCE":
      default:
        return <Badge variant="outline" className="text-[10px]">Dicionários & Atlas</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Pesquisar por título, autor ou código de tombamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] h-9 text-xs"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Button
              size="sm"
              variant={categoryFilter === "ALL" ? "default" : "outline"}
              onClick={() => setCategoryFilter("ALL")}
              className="text-xs h-9"
            >
              Todas as Obras ({books.length})
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === "MED_TEXTBOOK" ? "default" : "outline"}
              onClick={() => setCategoryFilter("MED_TEXTBOOK")}
              className="text-xs h-9"
            >
              Manuais do MED ({books.filter((b) => b.category === "MED_TEXTBOOK").length})
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === "ANGOLAN_LITERATURE" ? "default" : "outline"}
              onClick={() => setCategoryFilter("ANGOLAN_LITERATURE")}
              className="text-xs h-9 text-emerald-600 border-emerald-300"
            >
              Literatura Angolana ({books.filter((b) => b.category === "ANGOLAN_LITERATURE").length})
            </Button>
          </div>
        </div>

        <Button onClick={onOpenNewBookModal} size="sm" className="gap-1.5 text-xs h-9 shrink-0">
          <Icon name={"Plus" as any} className="size-3.5" />
          Cadastrar Obra
        </Button>
      </div>

      {/* Grid of Books */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl border border-dashed border-border bg-card/40 text-muted-foreground text-sm">
            Nenhuma obra encontrada para esta pesquisa no acervo.
          </div>
        ) : (
          filteredBooks.map((book) => {
            const hasCopies = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-[11px] text-muted-foreground">
                      {book.code}
                    </span>
                    {getCategoryBadge(book.category)}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground line-clamp-1">
                      {book.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {book.author}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Icon name={"MapPin" as any} className="size-3 text-primary" />
                      {book.shelfLocation}
                    </span>
                    {book.targetGrade && (
                      <span className="px-1.5 py-0.5 rounded bg-muted/40 font-mono text-[10px]">
                        {book.targetGrade}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Exemplares:</span>
                    <strong className={hasCopies ? "text-foreground font-mono" : "text-rose-600 font-mono"}>
                      {book.availableCopies} disponíveis
                    </strong>{" "}
                    <span className="text-muted-foreground text-[10px]">de {book.totalCopies}</span>
                  </div>

                  <Button
                    size="sm"
                    disabled={!hasCopies}
                    onClick={() => onOpenLoanModal(book)}
                    className="h-7 text-xs gap-1"
                  >
                    <Icon name={"BookOpen" as any} className="size-3" />
                    Emprestar
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
