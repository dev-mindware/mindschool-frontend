"use client";

import React, { useState, useMemo } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/common/icon";
import { useTuition } from "@/hooks/school/use-tuition";
import { useTuitionBilling } from "@/hooks/school/use-tuition-billing";
import { StudentTuitionFee } from "@/types/tuition";
import { formatCurrency } from "@/utils/format-currency";
import { toast } from "sonner";

export function TuitionCollectionsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { allFees } = useTuition("", "ALL", "ALL");
  const { sendWhatsAppReminder } = useTuitionBilling();

  const overdueFees = useMemo(() => {
    return allFees.filter(
      (f) =>
        (f.status === "OVERDUE" || f.status === "PENDING") &&
        (!searchQuery ||
          f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allFees, searchQuery]);

  const totalOverdueAmount = useMemo(() => {
    return overdueFees.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [overdueFees]);

  function handleBatchReminder() {
    toast.success(`Disparo em lote iniciado para ${overdueFees.length} encarregados de educação via WhatsApp!`);
  }

  const columns: Column<StudentTuitionFee>[] = [
    {
      key: "studentNumber",
      header: "N.º Processo",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {item.studentNumber}
        </span>
      ),
    },
    {
      key: "studentName",
      header: "Estudante",
      render: (_, item) => (
        <div>
          <p className="font-semibold text-foreground text-xs">{item.studentName}</p>
          <p className="text-[11px] text-muted-foreground">{item.classSection}</p>
        </div>
      ),
    },
    {
      key: "guardianName",
      header: "Encarregado",
      render: (_, item) => (
        <div>
          <p className="font-medium text-foreground text-xs">{item.guardianName}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{item.guardianPhone || "Sem contacto"}</p>
        </div>
      ),
    },
    {
      key: "monthLabel",
      header: "Mês",
      render: (_, item) => (
        <span className="text-xs font-medium text-foreground">
          {item.monthLabel} / {item.year}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "Montante em Falta",
      render: (_, item) => (
        <span className="font-bold text-foreground text-xs">{formatCurrency(item.totalAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        if (item.status === "OVERDUE") {
          return (
            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive font-medium text-[10px]">
              Vencida
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 font-medium text-[10px]">
            Pendente
          </Badge>
        );
      },
    },
    {
      key: "action",
      header: "Acção",
      className: "text-right",
      render: (_, item) => (
        <Button
          size="sm"
          onClick={() => sendWhatsAppReminder(item)}
          className="h-8 px-3 text-xs gap-1.5"
        >
          <Icon name="MessageSquare" className="w-3.5 h-3.5" />
          Enviar WhatsApp
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Régua de Cobrança WhatsApp"
          suTitle="Envio automatizado de lembretes de propinas para encarregados de educação"
        />
        <Button
          onClick={handleBatchReminder}
          disabled={overdueFees.length === 0}
          className="h-10 px-4 text-xs font-semibold gap-2"
        >
          <Icon name="Send" className="w-4 h-4" />
          Disparar Lembretes em Lote ({overdueFees.length})
        </Button>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={overdueFees.length.toString()}
          subtitle="Encarregados a Notificar"
          description="Mensalidades pendentes / vencidas"
          icon="Users"
        />
        <DynamicMetricCard
          title={formatCurrency(totalOverdueAmount)}
          subtitle="Montante sob Cobrança"
          description="Valor total a recuperar"
          icon="TrendingDown"
        />
        <DynamicMetricCard
          title="74%"
          subtitle="Taxa de Recuperação"
          description="Pagam até 48h após o aviso"
          icon="TrendingUp"
        />
        <DynamicMetricCard
          title="98.2%"
          subtitle="Taxa de Entrega WhatsApp"
          description="Mensagens entregues diretamente"
          icon="CheckCheck"
        />
      </div>

      {/* Barra de Pesquisa e Tabela */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-foreground text-sm">Fila de Notificações de Cobrança</h4>
            <p className="text-xs text-muted-foreground">Estudantes com mensalidades pendentes ou vencidas</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome ou processo..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <GenericTable<StudentTuitionFee>
          page={1}
          data={overdueFees}
          columns={columns}
          total={overdueFees.length}
          totalPages={1}
          setPage={() => {}}
          goToNextPage={() => {}}
          goToPreviousPage={() => {}}
          emptyMessage="Nenhum processo com dívida em atraso encontrado"
        />
      </div>
    </div>
  );
}
