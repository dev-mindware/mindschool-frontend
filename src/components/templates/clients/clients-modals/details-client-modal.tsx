"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import { Icon, Button, DetailRow, GlobalModal, Badge } from "@/components";
import { formatDateTime } from "@/utils";
import { currentClientStore } from "@/stores";

export function DetailsClientModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-client"];
  const { currentClient } = currentClientStore();

  if (!currentClient || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-client"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="User" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentClient.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">
                NIF: {currentClient.taxNumber}
              </span>
              <Badge
                variant={currentClient.isActive ? "success" : "destructive"}
              >
                {currentClient.isActive === true ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </>
      }
      className="!max-w-md !w-[90vw] md:!w-full"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeModal("view-client")}>
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
          <DetailRow label="Nome" value={currentClient.name} />
          <DetailRow label="Email" value={currentClient.email} />
          <DetailRow label="Telefone" value={currentClient.phone} />
          <DetailRow label="Endereço" value={currentClient.address} />
          <DetailRow label="IBAN" value={currentClient.iban} />
        </section>

        {/* Empresa e Identificação */}
        {(currentClient.companyId || currentClient.taxNumber) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Identificação e Empresa
            </h3>
            <DetailRow label="NIF" value={currentClient.taxNumber} />
            <DetailRow label="Empresa" value={currentClient.companyId} />
          </section>
        )}

        {(currentClient.createdAt || currentClient.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentClient.createdAt)}
            />
            <DetailRow
              label="Actualizado em"
              value={formatDateTime(currentClient.updatedAt)}
            />
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
