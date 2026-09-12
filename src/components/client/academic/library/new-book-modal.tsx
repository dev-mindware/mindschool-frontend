"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useLibraryStore } from "@/stores/school/library-store";
import { BookCategory } from "@/types";
import { toast } from "sonner";

interface NewBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewBookModal({ open, onOpenChange }: NewBookModalProps) {
  const { addBook } = useLibraryStore();

  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [publisher, setPublisher] = useState<string>("");
  const [isbn, setIsbn] = useState<string>("");
  const [category, setCategory] = useState<BookCategory>("MED_TEXTBOOK");
  const [targetGrade, setTargetGrade] = useState<string>("9ª Classe");
  const [shelfLocation, setShelfLocation] = useState<string>("Estante A, Prateleira 1");
  const [totalCopies, setTotalCopies] = useState<number>(30);
  const [editionYear, setEditionYear] = useState<number>(2024);

  const getCategoryLabel = (c: BookCategory) => {
    switch (c) {
      case "MED_TEXTBOOK":
        return "Manual Escolar do MED";
      case "ANGOLAN_LITERATURE":
        return "Literatura Angolana & Africana";
      case "WORLD_LITERATURE":
        return "Literatura Universal & Clássicos";
      case "SCIENCE_TECH":
        return "Ciências Exatas & Tecnologias";
      case "REFERENCE":
      default:
        return "Dicionários & Enciclopédias";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      toast.error("Preencha o título e autor da obra.");
      return;
    }

    const generatedCode = code || `MED-OBRA-${Math.floor(100 + Math.random() * 900)}`;

    addBook({
      code: generatedCode,
      title,
      author,
      publisher: publisher || undefined,
      isbn: isbn || undefined,
      category,
      categoryLabel: getCategoryLabel(category),
      targetGrade: targetGrade || "Geral",
      shelfLocation: shelfLocation || "Estante Central",
      totalCopies,
      availableCopies: totalCopies,
      isMedTextbook: category === "MED_TEXTBOOK",
      editionYear,
    });

    toast.success(`Obra "${title}" catalogada no acervo!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name={"BookMarked" as any} className="size-4 text-primary" />
            Catalogação de Obra / Manual no Acervo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Título da Obra:
            </label>
            <Input
              placeholder="Ex: Manual de Geografia - 9ª Classe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Author and Publisher */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Autor(es):
              </label>
              <Input
                placeholder="Ex: INIDE / MED"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Editora:
              </label>
              <Input
                placeholder="Ex: Editora Moderna"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </div>
          </div>

          {/* Category & Target Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Categoria:
              </label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MED_TEXTBOOK">Manual Escolar do MED</SelectItem>
                  <SelectItem value="ANGOLAN_LITERATURE">Literatura Angolana & Africana</SelectItem>
                  <SelectItem value="WORLD_LITERATURE">Literatura Universal</SelectItem>
                  <SelectItem value="SCIENCE_TECH">Ciências & Tecnologias</SelectItem>
                  <SelectItem value="REFERENCE">Dicionários & Enciclopédias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Classe Recomendada:
              </label>
              <Input
                placeholder="Ex: 9ª Classe, 10ª Classe, Geral"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
              />
            </div>
          </div>

          {/* Code, Location & Copies */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Código / Tombamento:
              </label>
              <Input
                placeholder="Ex: MED-GEO-09"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Localização:
              </label>
              <Input
                placeholder="Ex: Estante B, Prat. 2"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Qtd. Exemplares:
              </label>
              <Input
                type="number"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>

          {/* ISBN and Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                ISBN (Opcional):
              </label>
              <Input
                placeholder="978-..."
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Ano de Edição:
              </label>
              <Input
                type="number"
                value={editionYear}
                onChange={(e) => setEditionYear(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Salvar no Acervo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
