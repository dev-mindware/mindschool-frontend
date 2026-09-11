"use client";

import React from "react";
import { Icon, Avatar, AvatarFallback, AvatarImage } from "@/components";
import { Product } from "@/types";
import { CartCheckoutForm } from "./checkout-form";
import { formatCurrency } from "@/utils";

interface CartItem extends Product {
    qty: number;
}

interface CartSectionProps {
    cartItems: CartItem[];
    onUpdateQty: (item: CartItem, delta: number) => void;
    onRemove: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onClearCart: () => void;
    type?: "invoice" | "proforma";
    cashSessionId: string;
}

const CartItemRow = React.memo<{
    item: CartItem;
    onDelete: (id: string) => void;
}>(({ item, onDelete }) => (
    <div key={item.id} className="flex gap-3 mb-2 group items-center" data-tour="pos-cart-item">
        <Avatar className="h-10 w-10 rounded-lg shrink-0 border border-border">
            <AvatarImage src={item.image} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">{item.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
            <h4 className="font-semibold text-sm line-clamp-1 leading-tight" title={item.name}>{item.name}</h4>
            <p className="text-xs text-muted-foreground truncate">
                {item.qty}x
            </p>
        </div>
        <div className="flex flex-col items-end justify-center gap-1 shrink-0">
            <span className="font-bold text-sm text-nowrap">{formatCurrency((item.price || 0) * item.qty)}</span>
            <button
                onClick={() => onDelete(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors hidden group-hover:block"
                title="Remover item"
                data-tour="pos-cart-remove"
            >
                <Icon name="Trash" size={14} />
            </button>
        </div>
    </div>
));

CartItemRow.displayName = "CartItemRow";

export const CartList = React.memo<CartSectionProps>(
    ({
        cartItems,
        onUpdateQty,
        onRemove,
        onDelete,
        onClearCart,
        type = "invoice",
        cashSessionId,
    }) => {
        return (
            <div
                className="flex flex-col bg-sidebar rounded-md shadow-sm p-4 m-4 mt-2 border border-border/50 h-auto"
                data-tour="pos-cart"
            >
                <h2 className="text-xl font-bold mb-4">
                    {type === "invoice" ? "Facturação" : "Proforma"}
                </h2>

                {/* Cart Items List */}
                <div className="flex-1 min-h-0 relative">
                    <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex flex-col gap-4 pr-3">
                            {cartItems.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
                                    onDelete={onDelete}
                                />
                            ))}
                            {cartItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                                    <Icon name="ShoppingBasket" size={32} className="opacity-20" />
                                    <span className="text-sm">Carrinho vazio</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-components for checkout summary and payment methods */}
                <CartCheckoutForm
                    cartItems={cartItems}
                    type={type}
                    cashSessionId={cashSessionId}
                    onSuccess={onClearCart}
                />
            </div>
        );
    }
);

CartList.displayName = "CartList";
