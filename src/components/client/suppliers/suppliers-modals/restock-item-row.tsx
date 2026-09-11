import { PaginatedSelect } from "@/components/shared";
import { Button, Input, InputCurrency } from "@/components/ui";
import { Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";

type ItemRowProps = {
  index: number;
  control: any;
  errors: any;
  productOptions: { label: string; value: string }[];
  isLoadingProducts: boolean;
  paginationConfig: any;
  onPageChange: (page: number) => void;
  onRemove: () => void;
  canRemove: boolean;
};


export function RestockItemRow({
  index,
  control,
  errors,
  productOptions,
  isLoadingProducts,
  paginationConfig,
  onPageChange,
  onRemove,
  canRemove,
}: ItemRowProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-md">
      <div className="flex-1 w-full min-w-[200px]">
        <Controller
          control={control}
          name={`items.${index}.itemId`}
          render={({ field }) => (
            <PaginatedSelect
              label="Produto"
              placeholder="Seleccione um produto..."
              options={productOptions}
              value={field.value}
              onChange={field.onChange}
              isLoading={isLoadingProducts}
              pagination={paginationConfig}
              onPageChange={onPageChange}
              error={errors.items?.[index]?.itemId?.message}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <Input
            type="quantity"
            label="Quantidade"
            className="w-full sm:w-[120px]"
            value={field.value ?? 0}
            error={errors.items?.[index]?.quantity?.message}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />

      <Controller
        control={control}
        name={`items.${index}.costAtEntry`}
        render={({ field }) => (
          <InputCurrency
            ref={field.ref}
            label="Preço de compra"
            placeholder="0,00"
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            error={errors.items?.[index]?.costAtEntry?.message}
            className="w-full sm:w-[120px]"
          />
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="sm:mt-6 shrink-0 bg-red-500/10 text-destructive self-end sm:self-auto"
        onClick={onRemove}
        disabled={!canRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
