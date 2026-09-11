import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { Icon, GlobalModal } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatCurrency } from "@/utils";
import { Product } from "@/types";
import Image from "next/image";

import { Label } from "@/components/ui/label";

interface BarcodeScannerModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  scannedProduct: Product | null;
  onConfirm: (quantity: number) => void;
  onCancel?: () => void;
}

export const MODAL_BARCODE_PRODUCT_ID = "barcode-product-modal";

export function BarcodeProductScanner({
  scannedProduct,
  onConfirm,
}: BarcodeScannerModalProps) {
  const { open: modalsOpen, closeModal } = useModal();
  // Ensure we are using the correct state check, though GlobalModal handles visibility typically via ID
  // But since we want to conditionally render null if !scannedProduct, we check state here too.
  const isOpen = modalsOpen[MODAL_BARCODE_PRODUCT_ID] || false;

  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, scannedProduct]);

  const handleConfirm = () => {
    onConfirm(quantity);
    closeModal(MODAL_BARCODE_PRODUCT_ID);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  if (!scannedProduct) return null;

  return (
    <GlobalModal
      id={MODAL_BARCODE_PRODUCT_ID}
      title="Produto Identificado"
      description="Confirme a quantidade para adicionar ao carrinho."
      className="sm:max-w-[425px]"
    >
      <div className="grid gap-4 py-4">
        <div className="flex flex-col items-center gap-4">
          {scannedProduct.image ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
              <Image
                src={scannedProduct.image}
                alt={scannedProduct.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border">
              <Icon name="Package" size={48} className="text-muted-foreground" />
            </div>
          )}

          <div className="text-center space-y-1">
            <h3 className="font-bold text-lg">{scannedProduct.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(scannedProduct.price || 0)}
            </p>
            {scannedProduct.barcode && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full w-fit mx-auto mt-2">
                <Icon name="ScanBarcode" size={12} />
                <span>{scannedProduct.barcode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4 mt-2">
          <Label htmlFor="qty" className="text-right col-span-1">
            Quantidade
          </Label>
          <div className="col-span-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Icon name="Minus" size={14} />
            </Button>
            <Input
              id="qty"
              ref={inputRef}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              className="h-8 text-center"
              min={1}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => closeModal(MODAL_BARCODE_PRODUCT_ID)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Confirmar</Button>
      </div>
    </GlobalModal>
  );
}
