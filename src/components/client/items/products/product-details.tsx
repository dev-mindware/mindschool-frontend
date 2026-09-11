import { FeatureGate } from "@/components/common";
import { ItemResponse as Product } from "@/types";

export const ProductDetails = ({ product }: { product: Product }) => (
  <FeatureGate minPlan="Smart">
    <div className="flex items-center gap-2 text-muted-foreground">
      <ProductInfoChip>{product.name}</ProductInfoChip>
      <ProductInfoChip>{product.cost}</ProductInfoChip>
      <ProductInfoChip>{product.daysToExpiry} dias de garantia</ProductInfoChip>
    </div>
  </FeatureGate>
);

interface ProductInfoChipProps {
  children: React.ReactNode;
}

const ProductInfoChip = ({ children }: ProductInfoChipProps) => (
  <span className="px-2 py-1 rounded-md bg-muted text-xs">
    {children}
  </span>
);