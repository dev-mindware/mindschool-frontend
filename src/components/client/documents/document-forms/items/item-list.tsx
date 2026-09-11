import { memo } from "react";
import { ItemRow } from "./item-row";

interface ItemListProps {
  items: any[];
  onRemove: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onPriceChange: (index: number, price: number) => void;
}

export const ItemList = memo<ItemListProps>(
  ({ items, onRemove, onQuantityChange, onPriceChange }) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">
            Lista de itens
          </h4>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
          <table className="w-full">
            <thead className="border-border bg-card">
              <tr className="text-foreground">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  Qtd.
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  Preço unit.
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  Subtotal
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                  IVA (%)
                </th>
                <th className="w-[60px] px-4 py-3" aria-label="Acções" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {items.map((item, index) => (
                <ItemRow
                  key={item.id || index}
                  item={item}
                  index={index}
                  onRemove={onRemove}
                  onQuantityChange={onQuantityChange}
                  onPriceChange={onPriceChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);


ItemList.displayName = "ItemList";
