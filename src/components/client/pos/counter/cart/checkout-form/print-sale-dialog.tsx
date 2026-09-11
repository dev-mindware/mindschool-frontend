"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, Icon } from "@/components";
import type { DocumentType } from "@/types";

type PrintSaleDialogProps = {
  document: { id: string; type: DocumentType } | null;
  isPrinting: boolean;
  onPrint: () => void;
  onDismiss: () => void;
};

export function PrintSaleDialog({
  document,
  isPrinting,
  onPrint,
  onDismiss,
}: PrintSaleDialogProps) {
  const documentLabel = document?.type === "proforma" ? "proforma" : "factura-recibo";

  return (
    <AlertDialog
      open={!!document}
      onOpenChange={(open) => {
        if (!open && !isPrinting) onDismiss();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name="Printer" size={20} />
          </div>
          <AlertDialogTitle>Deseja imprimir o documento?</AlertDialogTitle>
          <AlertDialogDescription>
            A {documentLabel} foi emitida com sucesso. Pode imprimi-la agora ou continuar sem imprimir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onDismiss} disabled={isPrinting}>
            Agora não
          </Button>
          <Button onClick={onPrint} disabled={isPrinting} className="gap-2">
            <Icon name="Printer" size={16} />
            {isPrinting ? "A preparar..." : "Imprimir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
