"use client";

import { GenericTable, Column } from "@/components";
import type { StoreBreakdown } from "@/types";

interface StoresBreakdownTableProps {
    data: StoreBreakdown[];
}

export function StoresBreakdownTable({ data }: StoresBreakdownTableProps) {
    // Transform data to match GenericTable's T extends { id: string }
    const formattedData = data.map(item => ({
        ...item,
        id: item.storeId
    }));

    const columns: Column<typeof formattedData[0]>[] = [
        {
            key: "storeName",
            header: "Loja",
            render: (value) => <span className="font-medium">{value}</span>,
        },
        {
            key: "totalSales",
            header: "Total de Vendas",
            render: (value) => new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(value).replace("AOA", "Kz"),
        },
        {
            key: "productsSold",
            header: "Produtos",
        },
        {
            key: "servicesRendered",
            header: "Serviços",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Desempenho por Loja</h3>
                <p className="text-sm text-muted-foreground">Resumo de vendas por unidade</p>
            </div>
            <GenericTable
                columns={columns}
                data={formattedData}
                page={1}
                total={formattedData.length}
                totalPages={1}
                setPage={() => { }}
                goToNextPage={() => { }}
                goToPreviousPage={() => { }}
            />
        </div>
    );
}
