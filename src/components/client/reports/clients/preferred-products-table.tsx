"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ShoppingBag, Package } from "lucide-react";
import { formatCurrency } from "@/utils";
import { EmptyState } from "@/components/common";
import { cn } from "@/lib/utils";

interface PreferredItem {
    itemName: string;
    quantity: number;
    revenue: number;
}

interface PreferredProductsTableProps {
    preferredItems: PreferredItem[];
}

export function PreferredProductsTable({ preferredItems }: PreferredProductsTableProps) {
    const sortedItems = [...preferredItems].sort((a, b) => b.revenue - a.revenue);

    return (
        <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold">Produtos Preferidos</CardTitle>
                    <CardDescription>Itens com maior recorrência</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {preferredItems.length === 0 ? (
                    <EmptyState
                        icon="ShoppingBag"
                        title="Sem produtos preferidos"
                        description="Este cliente ainda não realizou compras de produtos."
                        className="py-12"
                    />
                ) : (
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-foreground">Item / Produto</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Qtd</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Receita</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedItems.map((item, index) => (
                                    <TableRow key={index} className="transition-colors hover:bg-muted/20">
                                        <TableCell className="font-bold flex items-center gap-2">
                                            <div className="p-1 rounded bg-muted animate-in zoom-in duration-300">
                                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            {item.itemName}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right font-black text-primary">
                                            {formatCurrency(item.revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
