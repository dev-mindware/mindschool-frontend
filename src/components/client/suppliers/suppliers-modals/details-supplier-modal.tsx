"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import { Icon, Button, DetailRow, GlobalModal, Badge } from "@/components";
import { formatDateTime } from "@/utils";
import { currentSupplierStore } from "@/stores/entities/current-supplier-store";

export function DetailsSupplierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-supplier"];
  const { currentSupplier } = currentSupplierStore();

  if (!currentSupplier || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-supplier"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="User" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentSupplier.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">
                NIF: {currentSupplier.taxNumber}
              </span>
              <Badge
                variant={currentSupplier.isActive ? "success" : "destructive"}
              >
                {currentSupplier.isActive === true ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </>
      }
      className="!max-w-md !w-[90vw] md:!w-full"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeModal("view-supplier")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Informações Pessoais
          </h3>
          <DetailRow label="Nome" value={currentSupplier.name} />
          <DetailRow label="Email" value={currentSupplier.email} />
          <DetailRow label="Telefone" value={currentSupplier.phone} />
          <DetailRow label="Endereço" value={currentSupplier.address} />
        </section>

        {(currentSupplier.companyId || currentSupplier.taxNumber) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Identificação e Empresa
            </h3>
            <DetailRow label="NIF" value={currentSupplier.taxNumber} />
            <DetailRow label="Empresa" value={currentSupplier.companyId} />
          </section>
        )}

        {(currentSupplier.createdAt || currentSupplier.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentSupplier.createdAt)}
            />
            <DetailRow
              label="Actualizado em"
              value={formatDateTime(currentSupplier.updatedAt)}
            />
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
