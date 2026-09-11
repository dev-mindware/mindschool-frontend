"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import { Icon, Button, DetailRow, GlobalModal, Badge, FeatureGate } from "@/components";
import { formatDateTime } from "@/utils";
import { currentManagerStore } from "@/stores";

export function DetailsManagerModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-manager"];
  const { currentManager } = currentManagerStore();

  if (!currentManager || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-manager"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="User" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentManager.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">
                Cargo: {currentManager.role}
              </span>
              <Badge
                variant={
                  currentManager.status === "ACTIVE" ? "success" : "destructive"
                }
              >
                {currentManager.status === "ACTIVE" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </>
      }
      className="!max-w-md !w-[90vw] md:!w-full"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeModal("view-manager")}>
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
          <DetailRow label="Nome" value={currentManager.name} />
          <DetailRow label="Email" value={currentManager.email} />
          <DetailRow label="Telefone" value={currentManager.phone} />
        </section>

        {/* Empresa e Identificação */}
        {currentManager.companyId && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Identificação e Empresa
            </h3>
            <DetailRow label="Empresa" value={currentManager.companyId} />
            <FeatureGate minPlan="Smart" fallback="hidden">
              <DetailRow label="Código de Barras" value={currentManager.barcode} />
            </FeatureGate>
            <DetailRow
              label="Lojas"
              value={
                currentManager.stores?.length
                  ? currentManager.stores.map((store) => store.name).join(", ")
                  : "Nenhuma loja associada"
              }
            />
          </section>
        )}

        {(currentManager.createdAt || currentManager.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentManager.createdAt)}
            />
            <DetailRow
              label="Actualizado em"
              value={formatDateTime(currentManager.updatedAt)}
            />
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
