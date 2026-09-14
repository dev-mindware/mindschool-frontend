"use client";
import { currentProformaStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { Button, GlobalModal } from "@/components";
import { useConvertProforma } from "@/hooks/invoice-proforma";
import { Receipt } from "lucide-react";

export function ConvertProformaModal() {
  const { closeModal, openModal, open } = useModal();
  const isOpen = open["convert-proforma"];
  const { currentProforma } = currentProformaStore();
  const { mutateAsync: convert, isPending } = useConvertProforma();

  if (!isOpen) return null;

  async function handleConvert() {
    if (!currentProforma) return;
    const result = await convert({ proforma: currentProforma, type: "invoice-receipt" });
    closeModal("convert-proforma");
    if (result?.id) {
      openModal("document-success", { id: result.id, type: "invoice-receipt" });
    }
  }

  return (
    <GlobalModal
      canClose
      id="convert-proforma"
      className="!w-max"
      title="Converter Proforma em Factura-Recibo"
      description={`A Proforma ${currentProforma?.number} será convertida em Factura-Recibo.`}
    >
      <div className="space-y-4 sm:w-[24rem]">
        <div className="flex items-start gap-3 rounded-lg border border-primary bg-primary/5 p-4">
          <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-sm">Factura-recibo</p>
            <p className="text-xs text-muted-foreground">
              Documento com cobrança e recibo integrados no acto de pagamento.
            </p>
          </div>
        </div>
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
