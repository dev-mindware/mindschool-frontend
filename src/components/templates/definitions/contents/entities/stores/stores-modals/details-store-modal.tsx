"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import { Icon, Button, DetailRow, GlobalModal, Badge } from "@/components";
import { formatDateTime } from "@/utils";
import { currentStoreStore } from "@/stores/entities/current-store-store";

export function DetailsStoreModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-store"];
  const { currentStore } = currentStoreStore();

  if (!currentStore || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-store"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Store" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentStore.name}</h2>
            <Badge variant={currentStore.isActive ? "success" : "destructive"}>
              {currentStore.isActive === true ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </>
      }
      className="!max-w-md !w-[90vw] md:!w-full"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeModal("view-store")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-2">
          <h3 className="font-semibold text-foreground">Informações da Loja</h3>
          <DetailRow label="Nome" value={currentStore.name || "-"} />
          <DetailRow
            label="Código do Estabelecimento"
            value={currentStore.code || "SEDE"}
          />
          {currentStore.email && <DetailRow label="Email" value={currentStore.email} />}
          {currentStore.phone && <DetailRow label="Telefone" value={currentStore.phone} />}
          {currentStore.address && <DetailRow label="Endereço" value={currentStore.address} />}
        </section>

        {/* {currentStore?. && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Empresa</h3>
            <DetailRow label="Empresa" value={currentStore.companyId} />
          </section>
        )} */}

        {(currentStore.createdAt || currentStore.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentStore.createdAt)}
            />
            <DetailRow
              label="Actualizado em"
              value={formatDateTime(currentStore.updatedAt)}
            />
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
