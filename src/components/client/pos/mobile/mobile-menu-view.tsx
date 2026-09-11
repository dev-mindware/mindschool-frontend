"use client";

import { useState } from "react";
import { Product } from "@/types";
import { Icon, ScrollArea } from "@/components";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { currentStoreStore } from "@/stores";
import { useLogout } from "@/hooks/auth";
import { OnboardingTourButton } from "@/components/common/onboarding-tour-button";
import { NotificationDropdown } from "@/components/shared/notifications/notification-dropdown";

interface MobileMenuViewProps {
  products: Product[];
  categories: any[];
  onAddToCart: (product: Product) => void;
  onUpdateQty: (item: any, delta: number) => void;
  onRemove: (id: string) => void;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  isLoading?: boolean;
  onViewOrder?: () => void;
  cartItems?: any[];
}

export function MobileMenuView({
  products,
  categories,
  onAddToCart,
  onUpdateQty,
  onRemove,
  activeCategory,
  onCategoryChange,
  isLoading,
  onViewOrder,
  cartItems,
}: MobileMenuViewProps) {
  const { handleLogout } = useLogout();
  const [search, setSearch] = useState("");

  const { currentStore } = currentStoreStore();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-background pb-16">
      {/* Header — Normal flow (Not sticky) */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Store" size={18} className="text-primary" />
            </div>
            <h1
              className="text-lg font-bold truncate max-w-[140px]"
              title={currentStore?.name}
            >
              {currentStore?.name || "Empresa"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <OnboardingTourButton
              tourId="pos-invoice"
              className="h-10 w-10 rounded-full px-0 sm:w-auto sm:px-3"
            />
            <NotificationDropdown />
            <button
              onClick={onViewOrder}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative"
              data-tour="pos-cart"
            >
              <Icon name="ShoppingBag" size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
              title="Sair"
            >
              <Icon name="LogOut" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── STICKY SEARCH & CATEGORIES ─── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm px-4 py-3 space-y-3 border-b border-border/30 shadow-sm">
        {/* Search */}
        <div className="relative" data-tour="pos-product-search">
          <Icon
            name="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Pesquisar menu..."
            className="pl-10 h-11 bg-muted/50 border-none rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputMode="none"
          />
        </div>

        {/* Categories */}
        <div
          className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide"
          data-tour="pos-categories"
        >
          <div className="flex w-max gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground",
                )}
              >
                <Icon
                  name={cat.name.includes("Bebida") ? "Coffee" : "Pizza"}
                  size={14}
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-base font-bold">Menu</h2>
      </div>

      {/* ─── SCROLLABLE PRODUCT GRID ─── */}
      <ScrollArea className="flex-1 px-4">
        <div className="grid grid-cols-2 gap-4 py-4" data-tour="pos-products">
          {isLoading ? (
            // Skeleton cards while loading
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Icon name="PackageSearch" size={40} />
              <p className="text-sm font-medium">Nenhum produto encontrado</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const cartItem = cartItems?.find((item) => item.id === product.id);
              const isInCart = !!cartItem;

              return (
                <div
                  key={product.id}
                  className={cn(
                    "bg-card rounded-2xl border overflow-hidden active:scale-95 transition-all relative",
                    isInCart
                      ? "border-primary border-2 shadow-md shadow-primary/10"
                      : "border-border",
                  )}
                  onClick={() => onAddToCart(product)}
                  data-tour="pos-product-add"
                >
                  <div className="relative aspect-square bg-muted">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border-b">
                        <Icon
                          name="Package"
                          size={32}
                          className="text-muted-foreground"
                        />
                      </div>
                    )}

                    {/* Botão de remover — canto superior esquerdo */}
                    {isInCart && (
                      <button
                        className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-destructive/90 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (cartItem.qty <= 1) {
                            onRemove(product.id);
                          } else {
                            onUpdateQty(cartItem, -1);
                          }
                        }}
                        title="Remover do carrinho"
                      >
                        <Icon name="Minus" size={13} />
                      </button>
                    )}

                    {/* Badge de quantidade — canto superior direito */}
                    {isInCart && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-background animate-in zoom-in duration-200 z-10">
                        {cartItem.qty}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-sm font-bold line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(product.price || 0)}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate ml-1">
                        {product.quantity > 0
                          ? `Stock: ${product.quantity}`
                          : "Esgotado"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
