"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  EmptyState,
} from "@/components";
import { Award, Mail, Calendar as CalendarIcon, Receipt, Users } from "lucide-react";
import { ClientAnalyticsResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

interface TopClientCardProps {
  client: ClientAnalyticsResponse["clients"][0] | undefined;
}

export function TopClientCard({ client }: TopClientCardProps) {
  if (!client) {
    return (
      <Card className="h-full border-none bg-muted/30 flex items-center justify-center p-6 min-h-[400px]">
        <EmptyState
          title="Sem Top Cliente"
          description="Ainda não existem dados suficientes para identificar o cliente com melhor desempenho."
          icon="Award"
        />
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-card to-card shadow-lg group h-full">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/20 text-primary animate-pulse">
                <Award className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/30 text-primary">
                Top Performance
              </Badge>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight pt-2">
              {client.clientName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 font-medium text-muted-foreground/80">
              <Mail className="h-3.5 w-3.5" />
              {client.clientEmail}
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-muted/30 border border-white/5 space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Receita Total</p>
            <p className="text-lg font-black text-primary truncate">
              {formatCurrency(client.totalRevenue)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-white/5 space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Frequência</p>
            <p className="text-lg font-black truncate">{client.totalInvoices} <span className="text-xs font-normal text-muted-foreground">vendas</span></p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <Receipt className="h-4 w-4" />
              <span>Valor Médio</span>
            </div>
            <span className="font-bold">{formatCurrency(client.averageOrderValue)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Última Atividade</span>
            </div>
            <span className="font-bold">{formatDate(client.lastPurchaseDate)}</span>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Índice de fidelização</p>
            <span className="text-sm font-black text-primary">
              {client.loyaltyScore}%
            </span>
          </div>
          <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${client.loyaltyScore}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
