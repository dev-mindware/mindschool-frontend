"use client";

import { Icon, ScrollArea } from "@/components";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";
import { useInvoiceTotals } from "@/hooks";
import Image from "next/image";
import { CartItem } from "@/types";

interface MobileOrderViewProps {
  cartItems: CartItem[];
  onUpdateQty: (item: CartItem, delta: number) => void;
  onRemove: (id: string) => void;
  onProcessTransaction: () => void;
  onBack?: () => void;
}

export function MobileOrderView({
  cartItems,
  onUpdateQty,
  onRemove,
  onProcessTransaction,
  onBack
}: MobileOrderViewProps) {
  const totals = useInvoiceTotals({
    items: cartItems.map((item) => ({
      unitPrice: item.price || 0,
      quantity: item.qty,
      tax: item.tax?.rate || 0,
    })),
    retention: 0,
    discount: 0,
  });

  const { subtotal, taxAmount, total } = totals;

  return (
    <div className="flex flex-col h-full bg-background pb-16" data-tour="pos-cart">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-border">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center active:bg-muted"
          data-tour="pos-back-to-menu"
        >
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center pr-10">Pedido</h1>
      </div>

      <ScrollArea className="flex-1 p-4">
        <h2 className="text-sm font-bold mb-4">Item</h2>
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Package" size={24} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1">
                   <h3 className="text-sm font-bold line-clamp-1">{item.name}</h3>
                   {/* Design shows variations, but we follow desktop functionality (no variations usually) */}
                   {/* <p className="text-[10px] text-muted-foreground">Default Variant</p> */}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-muted/50 rounded-full h-9 px-1">
                    <button 
                      onClick={() => onUpdateQty(item, -1)}
                      className="w-7 h-7 rounded-full bg-background flex items-center justify-center shadow-sm"
                    >
                      <Icon name="Minus" size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                    <button 
                      onClick={() => onUpdateQty(item, 1)}
                      className="w-7 h-7 rounded-full bg-background flex items-center justify-center shadow-sm"
                    >
                      <Icon name="Plus" size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatCurrency((item.price || 0) * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          className="mt-8 p-4 rounded-2xl bg-muted/30 space-y-3"
          data-tour="pos-payment-summary"
        >
          <h2 className="text-sm font-bold">Resumo do Pedido</h2>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Impostos</span>
            <span className="font-bold text-foreground">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="pt-3 border-t border-border/50 flex justify-between items-center">
             <span className="text-lg font-bold">Total</span>
             <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>

        <Button 
          className="w-full mt-2"
          onClick={onProcessTransaction}
          disabled={cartItems.length === 0}
          data-tour="pos-submit"
        >
          Processar transacção
        </Button>
      </ScrollArea>
    </div>
  );
}
