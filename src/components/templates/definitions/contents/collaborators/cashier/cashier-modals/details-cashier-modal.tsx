"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import { Icon, Button, DetailRow, GlobalModal, Badge } from "@/components";
import { formatDateTime } from "@/utils/format-date";
import { currentCashierStore } from "@/stores/collaborators/current-cashier-store";

export function DetailsCashierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-cashier"];
  const { currentCashier } = currentCashierStore();

  if (!currentCashier || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-cashier"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="User" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentCashier.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">
                Cargo: {currentCashier.role}
              </span>
              <Badge
                variant={
                  currentCashier.status === "ACTIVE"
                    ? "success"
                    : "destructive"
                }
              >
                {currentCashier.status === "ACTIVE"
                  ? "Activo"
                  : "Inactivo"}
              </Badge>
            </div>
          </div>
        </>
      }
      className="!max-w-md !w-[90vw] md:!w-full"
      footer={
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => closeModal("view-cashier")}
          >
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
          <DetailRow label="Nome" value={currentCashier.name} />
          <DetailRow label="Email" value={currentCashier.email} />
          <DetailRow label="Telefone" value={currentCashier.phone} />
        </section>

        {/* Empresa e Identificação */}
        {currentCashier.companyId && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Identificação e Empresa
            </h3>
            <DetailRow label="Empresa" value={currentCashier.companyId} />
          </section>
        )}

        {(currentCashier.createdAt || currentCashier.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentCashier.createdAt)}
            />
            <DetailRow
              label="Actualizado em"
              value={formatDateTime(currentCashier.updatedAt)}
            />
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
