"use client"
import { TitleList } from "@/components/common";
import { ButtonAddClient, ClientModal, ClientsList } from "@/components";

export function ClientsPageContent() {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center" data-tour="clients-header">
        <TitleList title="Clientes" suTitle="Adicione e gira os seus clientes" />
        <div data-tour="clients-create">
          <ButtonAddClient />
        </div>
      </div>
      <div data-tour="clients-list">
        <ClientsList />
      </div>
      <ClientModal action="add" />
    </> 
  );
}
