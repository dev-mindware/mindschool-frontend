"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import {
  Icon,
  Button,
  DetailRow,
  GlobalModal,
  ItemStatusBadge,
} from "@/components";
import { currentServiceStore } from "@/stores";
import { formatDateTime, formatPrice } from "@/utils";

export function DetailsServiceModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-service"];
  const { currentService } = currentServiceStore();

  if (!currentService || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-service"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10 shadow-sm transition-transform hover:scale-105">
            <Icon name="Store" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold tracking-tight">{currentService.name}</h2>
            <div className="flex items-center justify-center gap-2">
              {currentService.sku && (
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  SKU: {currentService.sku}
                </span>
              )}
              <ItemStatusBadge status={currentService.status} />
            </div>
          </div>
        </>
      }
      className="!max-h-[85vh] w-full max-w-md border-none shadow-2xl"
      footer={
        <div className="flex justify-end pt-2">
          <Button variant="outline" className="px-8" onClick={() => closeModal("view-service")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2 scrollbar-hide overflow-y-auto pr-1 text-sm">
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-1 mb-2">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">
              Informações Gerais
            </h3>
          </div>
          <div className="grid gap-2 pl-1">
            <DetailRow label="Descrição" value={currentService.description} />
            <DetailRow
              label="Código de Barras"
              value={currentService.barcode}
            />
            <DetailRow label="Categoria" value={currentService.category} />
            <DetailRow label="Tipo" value="Serviço" />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-1 mb-2 text-primary">
            <Icon name="Coins" className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wider text-xs">Financeiro</h3>
          </div>
          <div className="grid gap-2 pl-1">
            <DetailRow
              label="Preço de Venda"
              value={
                currentService.price
                  ? formatPrice(currentService.price)
                  : undefined
              }
            />
            <DetailRow
              label="Preço de Compra"
              value={
                currentService.cost
                  ? formatPrice(currentService.cost)
                  : undefined
              }
            />
            {currentService.tax && (
              <DetailRow
                label="Imposto"
                value={`${currentService.tax.name} (${currentService.tax.rate}%)`}
              />
            )}
          </div>
        </section>

        <section className="space-y-3 opacity-80 mt-4 pt-2 border-t border-dashed">
          <div className="grid gap-1 pl-1">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Metadata</p>
            <DetailRow label="ID de Loja" value={currentService.storeId} />
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentService.createdAt)}
            />
          </div>
        </section>
      </div>
    </GlobalModal>
  );
}
