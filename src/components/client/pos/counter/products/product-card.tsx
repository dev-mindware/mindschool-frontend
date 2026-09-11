"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Popover,
  PopoverContent,
  PopoverAnchor,
  Input,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Badge,
} from "@/components";
import { cn } from "@/lib/utils";
import { ErrorMessage, formatCurrency } from "@/utils";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductCard = React.memo<ProductCardProps>(
  ({ product, quantity, onAdd, onRemove, onUpdateQuantity }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editQty, setEditQty] = useState("");

    const handleDoubleClick = () => {
      setEditQty(quantity.toString());
      setIsEditing(true);
    };

    if (!product) return null;

    const handleConfirmQty = () => {
      const qty = parseInt(editQty, 10);
      if (!isNaN(qty) && qty > 0) {
        if (qty <= product.quantity) {
          onUpdateQuantity(product.id, qty);
          setIsEditing(false);
        } else {
          ErrorMessage(`Apenas ${product.quantity} unidades disponíveis.`);
          setEditQty(product.quantity.toString());
        }
      } else {
        ErrorMessage("Quantidade inválida.");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleConfirmQty();
      }
    };

    return (
      <Card
        className="overflow-hidden flex flex-col py-0 relative group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm"
        data-tour="pos-product-card"
      >
        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
          {/* Top Content: Image & Title */}
          <div className="flex gap-3 sm:gap-3.5">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl shrink-0 border border-border/50 shadow-inner">
              <AvatarImage src={product.image} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-lg">
                {product.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col justify-between py-0.5 sm:py-1 flex-1 overflow-hidden cursor-help">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
                    {product.description || "Sem descrição"}
                  </p>
                  <div className="pt-1.5 flex flex-wrap gap-1">
                    {product.quantity > 0 ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] items-center gap-1.5 px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 transition-colors font-medium shadow-sm"
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        {product?.quantity} unid.
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="text-[10px] items-center gap-1.5 px-2 py-0.5 border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/15 transition-colors cursor-not-allowed font-medium shadow-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Indisponível
                      </Badge>
                    )}

                    {/* Tax Rate Badge */}
                    {product.tax?.rate != null ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 border border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 transition-colors font-medium shadow-sm"
                      >
                        IVA {product.tax.rate}%
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 border border-gray-500/30 bg-gray-500/10 text-gray-600 hover:bg-gray-500/15 transition-colors font-medium shadow-sm"
                      >
                        Sem IVA
                      </Badge>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="start"
                className="max-w-[220px] p-3 flex flex-col gap-1.5 shadow-xl border-border/50 z-[100]"
              >
                <h4 className="font-bold text-sm leading-tight text-white">
                  {product.name}
                </h4>
                <p className="text-xs text-white/80 leading-relaxed italic border-t border-white/10 pt-1.5 mt-0.5">
                  {product.description ||
                    "Nenhuma descrição disponível para este produto."}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bottom Content: Price & Actions */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider scale-75 origin-left">
                Preço
              </span>
              <span className="text-sm sm:text-base font-extrabold tabular-nums text-primary -mt-1">
                {formatCurrency(product.price || 0)}
              </span>
            </div>

            <Popover open={isEditing} onOpenChange={setIsEditing}>
              <PopoverAnchor asChild>
                <div className="flex items-center gap-1.5">
                  {quantity === 0 ? (
                    <Button
                      size="icon"
                      disabled={product.quantity <= 0}
                      className={cn(
                        "rounded-full h-9 w-9 sm:h-10 sm:w-10 transition-all duration-300 shadow-sm",
                        product.quantity <= 0
                          ? "bg-destructive/10 text-destructive cursor-not-allowed border-destructive/20 hover:bg-destructive/20"
                          : "bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-primary/20",
                      )}
                      onClick={() => {
                        if (product.quantity > 0) {
                          onAdd(product);
                        } else {
                          ErrorMessage("Produto sem stock disponível.");
                        }
                      }}
                      onDoubleClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        if (product.quantity > 0) {
                          handleDoubleClick();
                        }
                      }}
                      data-tour="pos-product-add"
                    >
                      {product.quantity <= 0 ? (
                        <Icon name="X" className="h-5 w-5" />
                      ) : (
                        <Icon name="Plus" className="h-5 w-5" />
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5 sm:p-1 border border-border/60 shadow-sm" data-tour="pos-product-quantity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        onClick={() => onRemove(product.id)}
                        data-tour="pos-product-decrease"
                      >
                        <Icon
                          name="Minus"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        />
                      </Button>

                      <span
                        className="text-xs sm:text-sm font-bold min-w-[1.25rem] sm:min-w-[1.5rem] text-center cursor-pointer select-none tabular-nums hover:text-primary transition-colors px-0.5 sm:px-1"
                        onDoubleClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          handleDoubleClick();
                        }}
                        title="Duplo clique para editar"
                      >
                        {quantity}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={product.quantity <= quantity}
                        className={cn(
                          "h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-colors",
                          product.quantity <= quantity
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "text-primary hover:bg-primary/10",
                        )}
                        onClick={() => onAdd(product)}
                        onDoubleClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          handleDoubleClick();
                        }}
                        data-tour="pos-product-add"
                      >
                        <Icon name="Plus" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverAnchor>
              <PopoverContent
                className="w-auto p-3 shadow-2xl border-primary/20 backdrop-blur-md z-[110]"
                align="end"
                side="top"
                onInteractOutside={(e: any) => {
                  const target = e.target as HTMLElement;
                  if (target?.closest("#virtual-keyboard")) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quantidade
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editQty}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditQty(e.target.value)}
                      className="h-8 w-16 text-center text-sm font-bold focus-visible:ring-primary/30"
                      type="number"
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90"
                      onClick={handleConfirmQty}
                    >
                      <Icon name="Check" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";
