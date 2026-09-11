"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { Button, Icon, ScrollArea } from "@/components";
import { Input } from "@/components/ui/input";
import { useInvoiceTotals } from "@/hooks";
import { useCameraScanner } from "@/hooks/items";
import { cn } from "@/lib/utils";
import { CartItem, Product } from "@/types";
import { playScannerBeep } from "@/utils/audio";
import { formatCurrency } from "@/utils";

const SCANNER_REGION_ID = "mobile-scanner-region";

interface MobileScannerViewProps {
  onScan: (barcode: string) => void;
  onResolveScan: (barcode: string) => Promise<Product | null>;
  onAddToCart: (product: Product, quantity?: number) => void;
  onPay: () => void;
  cartItems: CartItem[];
  onOpenMenu: () => void;
}

export function MobileScannerView({
  onScan,
  onResolveScan,
  onAddToCart,
  onPay,
  cartItems,
  onOpenMenu,
}: MobileScannerViewProps) {
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [scanError, setScanError] = useState("");
  const [isResolvingScan, setIsResolvingScan] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totals = useInvoiceTotals({
    items: cartItems.map((item) => ({
      unitPrice: item.price || 0,
      quantity: item.qty,
      tax: item.tax?.rate || 0,
    })),
    retention: 0,
    discount: 0,
  });

  const { isScanning, isPaused, start, stop } =
    useCameraScanner(SCANNER_REGION_ID);

  const startScanner = useCallback(() => {
    start(async (code) => {
      playScannerBeep();
      setScanError("");
      setIsResolvingScan(true);
      await stop();

      const product = await onResolveScan(code);
      setIsResolvingScan(false);

      if (!product) {
        onScan(code);
        setScanError("Produto nao encontrado");
        window.setTimeout(() => {
          setScanError("");
          startScanner();
        }, 1400);
        return;
      }

      setPendingProduct(product);
      setPendingQuantity(1);
    });
  }, [onResolveScan, onScan, start, stop]);

  const scannerDivRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        startScanner();
      } else {
        stop();
      }
    },
    [startScanner, stop],
  );

  const handleConfirmProduct = () => {
    if (!pendingProduct) return;

    onAddToCart(pendingProduct, pendingQuantity);
    setPendingProduct(null);
    setPendingQuantity(1);
    startScanner();
  };

  const scannerStatus = pendingProduct
    ? "Definir quantidade"
    : isResolvingScan
      ? "A processar"
      : isPaused
        ? "Processado"
        : "Captura Activa";

  const scannerHint =
    scanError ||
    (pendingProduct
      ? "Confirme a quantidade"
      : isResolvingScan
        ? "A procurar produto..."
        : isPaused
          ? "Aguardando proximo..."
          : "Posicione o codigo no centro");

  return (
    <div className="relative flex h-full flex-col bg-background font-sans text-foreground">
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/60 p-4 backdrop-blur-md">
        <button
          onClick={onOpenMenu}
          className="flex items-center justify-center rounded-lg bg-secondary/50 p-2 transition-transform active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Scanner
          </span>
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              pendingProduct || isResolvingScan || isPaused
                ? "text-primary"
                : "text-foreground",
            )}
          >
            {scannerStatus}
          </span>
        </div>

        <button
          onClick={onPay}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Concluir venda</span>
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden bg-black">
        <div
          ref={scannerDivRef}
          id={SCANNER_REGION_ID}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            pendingProduct || isResolvingScan || isPaused
              ? "opacity-60"
              : "opacity-100",
          )}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "relative h-40 w-64 rounded-2xl border-2 transition-all duration-300",
              pendingProduct || isResolvingScan || isPaused
                ? "scale-105 border-primary"
                : "scale-100 border-white/30",
            )}
          >
            <div className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-primary/60" />
            <div className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-primary/60" />
            <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-primary/60" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-primary/60" />

            {!pendingProduct && !isResolvingScan && !isPaused && (
              <div className="absolute left-0 right-0 top-0 h-px animate-[scan-move_3s_ease-in-out_infinite] bg-primary/40 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            )}

            {(pendingProduct || isResolvingScan || isPaused) && (
              <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
                <div className="rounded-full bg-primary/20 p-3 backdrop-blur-sm">
                  <Icon name="Check" size={32} className="text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <p className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm transition-opacity">
            {scannerHint}
          </p>
        </div>

        {pendingProduct && (
          <div className="absolute inset-x-4 bottom-6 z-40 rounded-2xl border border-border bg-background p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex gap-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {pendingProduct.image ? (
                  <Image
                    src={pendingProduct.image}
                    alt={pendingProduct.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon
                      name="Package"
                      size={28}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Produto identificado
                </p>
                <h3 className="truncate text-sm font-black text-foreground">
                  {pendingProduct.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-primary">
                  {formatCurrency(pendingProduct.price || 0)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setPendingQuantity((qty) => Math.max(1, qty - 1))
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 active:scale-95"
              >
                <Icon name="Minus" size={18} />
              </button>
              <Input
                type="text"
                inputMode="none"
                data-layout="numeric"
                value={pendingQuantity}
                onChange={(event) => {
                  const nextQty = Number(event.target.value.replace(/\D/g, ""));
                  setPendingQuantity(
                    Number.isNaN(nextQty) || nextQty < 1 ? 1 : nextQty,
                  );
                }}
                className="text-center"
              />
              <button
                type="button"
                onClick={() => setPendingQuantity((qty) => qty + 1)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 active:scale-95"
              >
                <Icon name="Plus" size={18} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPendingProduct(null);
                  setPendingQuantity(1);
                  startScanner();
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmProduct}>
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="z-20 flex h-[40%] flex-col overflow-hidden border-t border-border bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Artigos</h3>
            <p className="text-[10px] text-muted-foreground">
              {totalItems} itens no carrinho
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-tighter text-muted-foreground">
              Total
            </p>
            <p className="text-lg font-black leading-none text-primary">
              {formatCurrency(totals.total)}
            </p>
          </div>
        </div>

        <ScrollArea className="-mx-2 flex-1 px-2">
          <div className="space-y-2">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 p-3"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-xs font-bold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground">
                      {item.sku || "Sem SKU"} - x{item.qty}
                    </p>
                  </div>
                  <div className="text-right underline decoration-primary/30 decoration-2 underline-offset-4">
                    <p className="text-xs font-bold text-foreground">
                      {formatCurrency((item.price || 0) * item.qty)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground/30">
                <Icon name="Barcode" size={24} />
                <p className="text-[10px] font-medium uppercase tracking-widest">
                  Aguardando leitura
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-center pt-4">
          <button
            onClick={isScanning ? stop : startScanner}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all active:scale-90",
              isScanning
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-border bg-secondary text-foreground hover:bg-secondary/80",
            )}
          >
            {isScanning ? (
              <Icon name="Square" size={16} />
            ) : (
              <Icon name="ScanLine" size={18} />
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan-move {
          0%,
          100% {
            top: 5%;
          }
          50% {
            top: 95%;
          }
        }
      `}</style>
    </div>
  );
}
