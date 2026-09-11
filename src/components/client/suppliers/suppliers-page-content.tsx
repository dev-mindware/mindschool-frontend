"use client"
import { TitleList } from "@/components/common";
import { SupplierModal, SuppliersList } from "@/components";
import { ButtonAddSupplier } from "./button-add-supplier";

export function SuppliersPageContent() {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center" data-tour="suppliers-header">
        <TitleList
          title="Fornecedores"
          suTitle="Adicione e gira os seus fornecedores"
        />
        <div data-tour="suppliers-create">
          <ButtonAddSupplier />
        </div>
      </div>
      <div data-tour="suppliers-list">
        <SuppliersList />
      </div>
      <SupplierModal />
    </>
  );
}
