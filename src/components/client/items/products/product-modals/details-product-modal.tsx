"use client";
import { currentProductStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatDateTime, formatPrice } from "@/utils";
import {
  Button,
  DetailRow,
  GlobalModal,
  Icon,
  ItemStatusBadge,
  FeatureGate,
} from "@/components";

export function DetailsProductModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["view-product"];
  const { currentProduct } = currentProductStore();

  if (!currentProduct || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="view-product"
      title={
        <>
          <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-primary/10 shadow-sm transition-transform hover:scale-105">
            <Icon name="Package" className="w-10 h-10 text-primary" />
          </div>

          <div className="mt-4 space-y-1 text-center">
            <h2 className="text-2xl font-bold tracking-tight">{currentProduct.name}</h2>
            <div className="flex items-center justify-center gap-2">
              {currentProduct.sku && (
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  SKU: {currentProduct.sku}
                </span>
              )}
              <ItemStatusBadge status={currentProduct.status} />
            </div>
          </div>
        </>
      }
      className="!max-h-[85vh] w-full max-w-md border-none shadow-2xl"
      footer={
        <div className="flex justify-end pt-2">
          <Button variant="outline" className="px-8" onClick={() => closeModal("view-product")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2 scrollbar-hide overflow-y-auto pr-1">
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-1 mb-2">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">
              Informações Gerais
            </h3>
          </div>
          <div className="grid gap-2 pl-1">
            <DetailRow label="Descrição" value={currentProduct.description} />
            <DetailRow
              label="Código de Barras"
              value={currentProduct.barcode}
            />
            <DetailRow label="Categoria" value={currentProduct.category} />
            <DetailRow label="Tipo" value="Produto" />
            <DetailRow label="Unidade" value={currentProduct.unit} />
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
                currentProduct.price
                  ? formatPrice(currentProduct.price)
                  : undefined
              }
            />
            <DetailRow
              label="Preço de Compra"
              value={
                currentProduct.cost
                  ? formatPrice(currentProduct.cost)
                  : undefined
              }
            />
            {currentProduct.tax && (
              <DetailRow
                label="Imposto"
                value={`${currentProduct.tax.name} (${currentProduct.tax.rate}%)`}
              />
            )}
          </div>
        </section>

        <FeatureGate minPlan="Smart">
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-1 mb-2 text-primary">
              <Icon name="Scale" className="w-4 h-4" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Stock</h3>
            </div>
            <div className="grid gap-2 pl-1">
              <DetailRow label="Stock actual" value={currentProduct.quantity} />
              <DetailRow label="Stock mínimo" value={currentProduct.minStock} />
            </div>
          </section>
        </FeatureGate>

        <FeatureGate minPlan="Pro">
          {(currentProduct.weight || currentProduct.dimensions) && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-1 mb-2 text-primary">
                <Icon name="Maximize" className="w-4 h-4" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Logística</h3>
              </div>
              <div className="grid gap-2 pl-1">
                <DetailRow label="Peso" value={currentProduct.weight ? `${currentProduct.weight}kg` : undefined} />
                <DetailRow label="Dimensões" value={currentProduct.dimensions} />
              </div>
            </section>
          )}
        </FeatureGate>

        <FeatureGate minPlan="Pro">
          {currentProduct.hasExpiry && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-1 mb-2 text-primary">
                <Icon name="Calendar" className="w-4 h-4" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Validade</h3>
              </div>
              <div className="grid gap-2 pl-1">
                <DetailRow
                  label="Data de Expiração"
                  value={currentProduct.expiryDate}
                />
                <DetailRow
                  label="Dias até expirar"
                  value={currentProduct.daysToExpiry}
                />
              </div>
            </section>
          )}
        </FeatureGate>

        <section className="space-y-3 opacity-80 mt-4 pt-2 border-t border-dashed">
          <div className="grid gap-1 pl-1">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Metadata</p>
            <DetailRow label="ID de Loja" value={currentProduct.storeId} />
            <DetailRow
              label="Criado em"
              value={formatDateTime(currentProduct.createdAt)}
            />
          </div>
        </section>
      </div>
    </GlobalModal>
  );
}
