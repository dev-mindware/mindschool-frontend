"use client";
import { useModal, currentStockStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal, Badge } from "@/components";
import { formatDateTime, formatCurrency } from "@/utils";

export function DetailsStockModal() {
    const { closeModal, open } = useModal();
    const isOpen = open["view-stock"];
    const { currentStock } = currentStockStore();

    if (!currentStock || !isOpen) return null;

    const getStockLevelBadge = (level: string) => {
        const variants: Record<string, "success" | "secondary" | "destructive"> = {
            IN_STOCK: "success",
            LOW_STOCK: "secondary",
            OUT_OF_STOCK: "destructive",
        };

        const labels: Record<string, string> = {
            IN_STOCK: "Em stock",
            LOW_STOCK: "Stock baixo",
            OUT_OF_STOCK: "Sem stock",
        };

        return (
            <Badge variant={variants[level] || "default"}>
                {labels[level] || level}
            </Badge>
        );
    };

    return (
        <GlobalModal
            canClose
            id="view-stock"
            title={
                <>
                    <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
                        <Icon name="Package" className="w-10 h-10 text-primary" />
                    </div>

                    <div className="text-center space-y-2 mt-4">
                        <h2 className="text-2xl font-bold">{currentStock.item?.name || "N/A"}</h2>
                        <div className="flex items-center justify-center gap-2">
                            {getStockLevelBadge(currentStock.stockLevel)}
                        </div>
                    </div>
                </>
            }
            className="!max-w-md !w-[90vw] md:!w-full"
            footer={
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => closeModal("view-stock")}>
                        Fechar
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 text-sm">
                <div className="flex justify-between">
                    <section className="space-y-2">
                        <h3 className="font-semibold text-foreground">Informações do Stock</h3>
                        <DetailRow label="Quantidade Total" value={currentStock.quantity} />
                        <DetailRow label="Disponível" value={currentStock.available} />
                        <DetailRow label="Reservado" value={currentStock.reserved} />
                        <DetailRow
                            label="Tem Reserva"
                            value={currentStock.hasReservedStock ? "Sim" : "Não"}
                        />
                    </section>

                    {currentStock.item && (
                        <section className="space-y-2">
                            <h3 className="font-semibold text-foreground">Produto</h3>
                            <DetailRow label="Nome" value={currentStock.item.name} />
                            {currentStock.item.sku && (
                                <DetailRow label="SKU" value={currentStock.item.sku} />
                            )}
                            {currentStock.item.barcode && (
                                <DetailRow label="Código de Barras" value={currentStock.item.barcode} />
                            )}
                            <DetailRow label="Preço" value={formatCurrency(currentStock.item.price)} />
                            <DetailRow label="Unidade" value={currentStock.item.unit} />
                        </section>
                    )}
                </div>
                <div className="flex justify-between">
                    {currentStock.store && (
                        <section className="space-y-2">
                            <h3 className="font-semibold text-foreground">Loja</h3>
                            <DetailRow label="Nome" value={currentStock.store.name} />
                        </section>
                    )}

                    {(currentStock.createdAt || currentStock.updatedAt) && (
                        <section className="space-y-2">
                            <h3 className="font-semibold text-foreground">
                                Informações Técnicas
                            </h3>
                            <DetailRow
                                label="Criado em"
                                value={formatDateTime(currentStock.createdAt)}
                            />
                            <DetailRow
                                label="Actualizado em"
                                value={formatDateTime(currentStock.updatedAt)}
                            />
                        </section>
                    )}
                </div>
            </div>
        </GlobalModal>
    );
}
