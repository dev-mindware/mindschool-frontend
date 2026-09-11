"use client";

import Link from "next/link";
import { useGetSupplierById } from "@/hooks/entities/use-suppliers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierStockHistory } from "./supplier-stock-history";

interface SupplierStockHistoryPageProps {
  supplierId: string;
}

export function SupplierStockHistoryPage({ supplierId }: SupplierStockHistoryPageProps) {
  const { supplier, isLoading } = useGetSupplierById(supplierId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4" data-tour="supplier-history-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Icon name="Truck" className="w-4 h-4 shrink-0" />
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="font-medium text-foreground">{supplier?.name}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Entradas de Stock</h2>
          <p className="text-sm text-muted-foreground">
            Registo cronológico de todos os abastecimentos deste fornecedor.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/suppliers/${supplierId}`}>
              <Icon name="ArrowLeft" className="w-4 h-4 mr-1.5" />
              Voltar ao Fornecedor
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/suppliers">
              <Icon name="List" className="w-4 h-4 mr-1.5" />
              Todos os Fornecedores
            </Link>
          </Button>
        </div>
      </div>

      <SupplierStockHistory supplierId={supplierId} />
    </div>
  );
}
