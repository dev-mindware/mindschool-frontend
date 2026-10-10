"use client";

import React, { useMemo } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { DataList, type Column } from "@/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/common/icon";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useTuitionBilling } from "@/modules/finance/hooks/use-tuition-billing";
import { StudentTuitionFee } from "@/modules/finance/types";
import { formatCurrency } from "@/utils/format-currency";
import { SucessMessage } from "@/utils/messages";

export function TuitionCollectionsContent() {
  const { allFees, isLoading } = useTuition();
  const { sendWhatsAppReminder } = useTuitionBilling();

  const overdueFees = useMemo(() => allFees.filter((f) => f.status === "OVERDUE" || f.status === "PENDING"), [allFees]);
  const totalOverdueAmount = useMemo(() => overdueFees.reduce((acc, curr) => acc + curr.totalAmount, 0), [overdueFees]);
  const lateFees = useMemo(() => overdueFees.filter((f) => f.status === "OVERDUE"), [overdueFees]);
  const contactable = overdueFees.filter((f) => Boolean(f.guardianPhone)).length;
  const contactableRate = overdueFees.length ? Math.round((contactable / overdueFees.length) * 100) : 0;

  function handleBatchReminder() {
    SucessMessage(`Disparo em lote iniciado para ${overdueFees.length} encarregados de educação via WhatsApp!`);
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
          title={`${contactableRate}%`}
          subtitle="Encarregados contactáveis"
          description={`${contactable} de ${overdueFees.length} com telefone registado`}
          icon="TrendingUp"
        />
        <DynamicMetricCard
          title={lateFees.length.toString()}
          subtitle="Já vencidas"
          description={`${formatCurrency(lateFees.reduce((a, f) => a + f.totalAmount, 0))} em atraso`}
          icon="CircleAlert"
        />
      </div>

      <DataList<StudentTuitionFee>
        prefix="cobrancas"
        rows={overdueFees}
        columns={columns}
        isLoading={isLoading}
        pageSize={12}
        searchPlaceholder="Pesquisar por aluno, processo, encarregado ou telefone"
        searchText={(f) => `${f.studentName} ${f.studentNumber} ${f.guardianName} ${f.guardianPhone}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "OVERDUE", label: "Vencida" }, { value: "PENDING", label: "Pendente" }], match: (f, v) => f.status === v },
          { key: "mes", label: "Mês", icon: "CalendarDays", options: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((l, i) => ({ value: String(i + 1), label: l })), match: (f, v) => f.month === Number(v) },
          { key: "turma", label: "Turma", icon: "Users", options: [...new Set(overdueFees.map((f) => f.classSection).filter(Boolean))].sort().map((v) => ({ value: v, label: v })), match: (f, v) => f.classSection === v },
          { key: "contacto", label: "Contacto", icon: "Phone", options: [{ value: "com", label: "Com telefone" }, { value: "sem", label: "Sem telefone" }], match: (f, v) => (v === "com" ? Boolean(f.guardianPhone) : !f.guardianPhone) },
          { key: "valor", label: "Montante", icon: "Coins", options: [{ value: "baixo", label: "Até 20 000 Kz" }, { value: "medio", label: "20 000 – 60 000 Kz" }, { value: "alto", label: "Acima de 60 000 Kz" }], match: (f, v) => (v === "baixo" ? f.totalAmount <= 20000 : v === "medio" ? f.totalAmount > 20000 && f.totalAmount <= 60000 : f.totalAmount > 60000) },
        ]}
        dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (f) => f.dueDate }]}
        sorts={[
          { value: "vencimento", label: "Vencimento", compare: (a, b) => a.dueDate.localeCompare(b.dueDate) },
          { value: "valor", label: "Montante", compare: (a, b) => a.totalAmount - b.totalAmount },
          { value: "aluno", label: "Aluno", compare: (a, b) => a.studentName.localeCompare(b.studentName, "pt") },
        ]}
        emptyTitle="Nenhum processo com dívida encontrado"
        emptyDescription="Não há mensalidades pendentes ou vencidas com estes filtros."
        emptyIcon="CheckCheck"
      />
    </div>
  );
}
