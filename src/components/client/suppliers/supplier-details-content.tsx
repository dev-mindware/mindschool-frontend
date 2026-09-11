"use client";

import Link from "next/link";
import { useGetSupplierById } from "@/hooks/entities/use-suppliers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SupplierDetailsSkeleton,
  RequestError,
  Button,
  RestockSupplierModal,
} from "@/components";
import { Badge } from "@/components/ui/badge";
import { SuppliersProductList } from "./suppliers-product-list";
import { useSupplierActions } from "@/hooks/entities/use-supplier-actions";

export function SupplierDetailsContent({ supplierId }: { supplierId: string }) {
  const { supplier, isLoading, error, refetch } =
    useGetSupplierById(supplierId);
  const { handlerRestockSupplier } = useSupplierActions();

  if (isLoading) return <SupplierDetailsSkeleton />;

  if (error || !supplier) {
    return (
      <RequestError
        message="Erro ao carregar detalhes do fornecedor"
        refetch={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-tour="supplier-details-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{supplier.name}</h2>
          <p className="text-muted-foreground">
            Detalhes da conta e gestão de itens do fornecedor.
          </p>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <TabsList data-tour="supplier-details-tabs">
            <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="items">Produtos</TabsTrigger>
          </TabsList>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0" data-tour="supplier-details-actions">
            <Button
              variant="default"
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={() => handlerRestockSupplier(supplier)}
            >
              Nova Entrada de Stock
            </Button>
            <Link
              className="flex w-full"
              href={`/suppliers/${supplierId}/history`}
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Ver Histórico de Stock
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="info" className="space-y-4" data-tour="supplier-details-content">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PillItem keyV="Nome do Fornecedor" value={supplier.name} />
                <PillItem keyV="Email de contacto" value={supplier.email} />
                <PillItem keyV="Telefone" value={supplier.phone} />
                <PillItem keyV="NIF" value={supplier.taxNumber} />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado
                  </p>
                  <div className="mt-1">
                    <Badge
                      variant={supplier.isActive ? "default" : "destructive"}
                    >
                      {supplier.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Endereço Completo
                  </p>
                  <p className="text-base">{supplier.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4" data-tour="supplier-details-content">
          <SuppliersProductList supplierId={supplierId} />
        </TabsContent>
      </Tabs>

      <RestockSupplierModal />
    </div>
  );
}

export function PillItem({ keyV, value }: { keyV: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{keyV}</p>
      <p className="text-base">{value}</p>
    </div>
  );
}
