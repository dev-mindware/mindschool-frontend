"use client"
import { useModal } from "@/stores";
import { Button } from "@/components";

export function ButtonAddCategory() {
  const { openModal } = useModal();

  return (
    <Button onClick={() => openModal("add-category")}>Nova Categoria</Button>
  );
}
