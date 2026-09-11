"use client";
import { ItemResponse } from "@/types";
import { formatCurrency } from "@/utils";
import { useServiceActions } from "@/hooks";
import { Card, CardContent, CardHeader, ButtonOnlyAction } from "@/components";
import { ItemIcon, ItemStatusBadge, ProductTitle } from "../common";

interface ProductCardProps {
  service: ItemResponse;
}

export function ServiceCardView({ service }: ProductCardProps) {
  const { handlerDeleteService, handlerDetailsService, handlerEditService } =
    useServiceActions();

  return (
    <Card className="relative overflow-hidden transition-shadow duration-200 border border-border bg-card hover:shadow-lg hover:border-primary/25">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ItemIcon type="SERVICE" />
            <div className="flex-1 min-w-0">
              <ProductTitle name={service.name} />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {service.category}
                </span>
                <ItemStatusBadge status={service.status!} />
              </div>
            </div>
          </div>
          <ButtonOnlyAction
            data={service}
            actions={[
              { label: "Ver detalhes", onClick: handlerDetailsService },
              { label: "Editar", onClick: handlerEditService },
              { label: "Apagar", onClick: handlerDeleteService },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Preço do Serviço
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(service.price!)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Imposto</p>
            <p className="text-sm font-semibold text-foreground">
              {service.tax?.rate ? `${service.tax.rate}%` : "Isento"}
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
