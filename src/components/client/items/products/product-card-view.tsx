"use client";
import { useProductActions } from "@/hooks";
import { ItemResponse } from "@/types";
import { formatCurrency } from "@/utils";
import { ProductDetails } from "./product-details";
import { ProductStockInfo } from "./product-stock-info";
import { Card, CardContent, CardHeader, ButtonOnlyAction } from "@/components";
import { ItemIcon, ItemStatusBadge, ProductTitle } from "../common";

interface ProductCardProps {
  product: ItemResponse;
}

export function ProductCardView({ product }: ProductCardProps) {
  const {
    handlerDeleteProduct,
    handlerDetailsProduct,
    handlerEditProduct,
    toggleStatusProduct,
  } = useProductActions();

  return (
    <Card className="relative overflow-hidden transition-shadow duration-200 border border-border bg-card hover:shadow-lg hover:border-primary/25">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ItemIcon type="PRODUCT" />
            <div className="flex-1 min-w-0">
              <ProductTitle name={product.name} />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {product.category}
                </span>
                <ItemStatusBadge status={product.status!} />
              </div>
            </div>
          </div>
          <ButtonOnlyAction
            data={product}
            actions={[
              { label: "Ver detalhes", onClick: handlerDetailsProduct },
              { label: "Editar", onClick: handlerEditProduct },
              { label: "Apagar", onClick: handlerDeleteProduct },
              {
                label: `${product.status === "ACTIVE" ? "Desactivar" : "Activar"}`,
                onClick: toggleStatusProduct,
              },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ProductDetails product={product} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Preço do produto
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(product.price!)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Imposto</p>
            <p className="text-sm font-semibold text-foreground">
              {product.tax?.rate ? `${product.tax.rate}%` : "Isento"}
            </p>
          </div>
        </div>

        <ProductStockInfo product={product} />
      </CardContent>
    </Card>
  );
}
