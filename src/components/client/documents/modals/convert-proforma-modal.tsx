"use client";
import { useState } from "react";
import { currentProformaStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { Button, GlobalModal } from "@/components";
import { useConvertProforma } from "@/hooks/invoice-proforma";
import { FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

type ConversionType = "invoice" | "invoice-receipt";

const OPTIONS: { type: ConversionType; label: string; description: string }[] = [
    {
        type: "invoice",
        label: "Factura",
        description: "Documento de cobrança com prazo de pagamento",
    },
    {
        type: "invoice-receipt",
        label: "Factura-recibo",
        description: "Documento com cobrança e recibo integrados",
    },
];

export function ConvertProformaModal() {
    const { closeModal, openModal, open } = useModal();
    const isOpen = open["convert-proforma"];
    const { currentProforma } = currentProformaStore();
    const [selectedType, setSelectedType] = useState<ConversionType>("invoice");
    const { mutateAsync: convert, isPending } = useConvertProforma();

    if (!isOpen) return null;

    async function handleConvert() {
        if (!currentProforma) return;
        const result = await convert({ proforma: currentProforma, type: selectedType });
        closeModal("convert-proforma");
        if (result?.id) {
            openModal("document-success", { id: result.id, type: result.type });
        }
    }

    return (
        <GlobalModal
            canClose
            id="convert-proforma"
            className="!w-max"
            title="Converter Proforma"
            description={`Proforma ${currentProforma?.number} será convertida e eliminada após a conversão.`}
        >
            <div className="space-y-3 sm:w-[24rem]">
                {OPTIONS.map(({ type, label, description }) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={cn(
                            "w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                            selectedType === type
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                        )}
                    >
                        {type === "invoice" ? (
                            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        ) : (
                            <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        )}
                        <div>
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => closeModal("convert-proforma")}
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    loading={isPending}
                    disabled={isPending}
                    onClick={handleConvert}
                    className="w-max"
                >
                    Converter
                </Button>
            </div>
        </GlobalModal>
    );
}
