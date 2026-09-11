import { useMemo } from "react";
import {  ItemResponse as Product } from "@/types";
import { FeatureGate } from "@/components/common";

export const ProductStockInfo = ({ product }: { product: Product }) => {
  const formattedExpiryDate = useMemo(() => {
    return product.expiryDate?.toString().slice(0, 10);
  }, [product.expiryDate]);

  return (
    <FeatureGate minPlan="Smart">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{product.quantity} no Stock</span>
        <span>Expira em: ({formattedExpiryDate})</span>
      </div>
    </FeatureGate>
  );
};
