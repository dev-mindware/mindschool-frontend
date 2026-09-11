"use client";

import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/common/empty-state";
import { useModal } from "@/stores";
import { currentProductStore } from "@/stores";

interface ProductSectionProps {
    products: Product[];
    cartItems: Record<string, { qty: number }>; // Relaxed type to match structure
    onAddToCart: (product: Product) => void;
    onRemoveFromCart: (productId: string) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function ProductList({
    products,
    cartItems,
    onAddToCart,
    onRemoveFromCart,
    onUpdateQuantity,
}: ProductSectionProps) {
    const { open } = useModal();
    const { currentProduct } = currentProductStore();

    if (products.length === 0) {
        return (
            <EmptyState
                icon="PackageOpen"
                title="Nenhum produto encontrado"
                description="Tente buscar outro termo ou adicione novos produtos."
            />
        );
    }

    return (
        <>
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                data-tour="pos-products"
            >
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        quantity={cartItems[product.id]?.qty || 0}
                        onAdd={onAddToCart}
                        onRemove={onRemoveFromCart}
                        onUpdateQuantity={onUpdateQuantity}
                    />
                ))}
            </div>
        </>
    );
}
