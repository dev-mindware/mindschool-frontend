"use client";
import { useModal } from "@/stores";
import { Button } from "@/components/ui";
import { TitleList } from "@/components/common";
import { StoresList, StoreModal } from ".";

export function StoresPageContent() {
  const { openModal, open } = useModal();

  return (
    <div>
     <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
       <TitleList
        title="Lojas"
        suTitle="Crie lojas para o controlo das suas atividades"
      />

      <Button
        onClick={() => openModal("add-store")}
        variant="default"
        className="w-full sm:w-auto text-sm sm:text-base mt-4 sm:mt-0"
      >
        Nova Loja
      </Button>
     </div>

      <StoresList />

      {open["add-store"] && <StoreModal action="add" />}
    </div>
  );
}