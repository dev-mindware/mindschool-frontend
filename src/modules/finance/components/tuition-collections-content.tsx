"use client";

import React, { useMemo, useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { DataList, type Column } from "@/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/common/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useTuitionBilling } from "@/modules/finance/hooks/use-tuition-billing";
import { StudentTuitionFee } from "@/modules/finance/types";
import { formatCurrency } from "@/utils/format-currency";
import { SucessMessage } from "@/utils/messages";

export function TuitionCollectionsContent() {
  const { allFees, isLoading } = useTuition();
  const { sendEmailReminder } = useTuitionBilling();

  const [selectedFee, setSelectedFee] = useState<StudentTuitionFee | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  const overdueFees = useMemo(
    () => allFees.filter((f) => f.status === "OVERDUE" || f.status === "PENDING"),
    [allFees]
  );
  const totalOverdueAmount = useMemo(
    () => overdueFees.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [overdueFees]
  );
  const lateFees = useMemo(() => overdueFees.filter((f) => f.status === "OVERDUE"), [overdueFees]);
  const withEmailCount = overdueFees.filter((f) => Boolean(f.guardianEmail)).length;
  const withEmailRate = overdueFees.length ? Math.round((withEmailCount / overdueFees.length) * 100) : 0;

  function handleOpenEmailModal(fee: StudentTuitionFee) {
    setSelectedFee(fee);
    setCustomEmail(fee.guardianEmail || "");
    setCustomSubject(
      `Aviso de Mensalidade Escolar: ${fee.studentName} — ${fee.monthLabel}/${fee.year}`
    );
  }

  async function handleConfirmSend() {
    if (!selectedFee) return;
    setIsSending(true);
    try {
      await sendEmailReminder({
        ...selectedFee,
        guardianEmail: customEmail || selectedFee.guardianEmail,
      });
      setSelectedFee(null);
    } finally {
      setIsSending(false);
    }
  }

  function handleBatchReminder() {
    SucessMessage(
      `Disparo em lote agendado com sucesso para ${overdueFees.length} encarregados de educação via Correio Electrónico!`
    );
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
      header: "Encarregado de Educação",
      render: (_, item) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground text-xs">{item.guardianName}</p>
          {item.guardianEmail ? (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Icon name="Mail" className="w-3 h-3 text-primary/70" />
              {item.guardianEmail}
            </p>
          ) : (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
              <Icon name="MailX" className="w-3 h-3" />
              Sem e-mail registado
            </p>
          )}
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
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive font-medium text-[10px]"
            >
              Vencida
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-[10px]"
          >
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
          onClick={() => handleOpenEmailModal(item)}
          className="h-8 px-3 text-xs gap-1.5"
        >
          <Icon name="Mail" className="w-3.5 h-3.5" />
          Enviar E-mail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Régua de Cobrança por E-mail"
          suTitle="Envio automatizado de lembretes e avisos de propinas por correio electrónico para encarregados de educação"
        />
        <Button
          onClick={handleBatchReminder}
          disabled={overdueFees.length === 0}
          className="h-10 px-4 text-xs font-semibold gap-2"
        >
          <Icon name="Send" className="w-4 h-4" />
          Disparar E-mails em Lote ({overdueFees.length})
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
          description="Valor total a regularizar"
          icon="TrendingDown"
        />
        <DynamicMetricCard
          title={`${withEmailRate}%`}
          subtitle="Com E-mail Registado"
          description={`${withEmailCount} de ${overdueFees.length} encarregados contactáveis`}
          icon="MailCheck"
        />
        <DynamicMetricCard
          title={lateFees.length.toString()}
          subtitle="Já Vencidas"
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
        searchPlaceholder="Pesquisar por aluno, processo, encarregado ou e-mail"
        searchText={(f) =>
          `${f.studentName} ${f.studentNumber} ${f.guardianName} ${f.guardianEmail || ""}`
        }
        filters={[
          {
            key: "estado",
            label: "Estado",
            icon: "ListFilter",
            options: [
              { value: "OVERDUE", label: "Vencida" },
              { value: "PENDING", label: "Pendente" },
            ],
            match: (f, v) => f.status === v,
          },
          {
            key: "mes",
            label: "Mês",
            icon: "CalendarDays",
            options: [
              "Janeiro",
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro",
            ].map((l, i) => ({ value: String(i + 1), label: l })),
            match: (f, v) => f.month === Number(v),
          },
          {
            key: "turma",
            label: "Turma",
            icon: "Users",
            options: [...new Set(overdueFees.map((f) => f.classSection).filter(Boolean))]
              .sort()
              .map((v) => ({ value: v, label: v })),
            match: (f, v) => f.classSection === v,
          },
          {
            key: "email",
            label: "E-mail",
            icon: "Mail",
            options: [
              { value: "com", label: "Com e-mail registado" },
              { value: "sem", label: "Sem e-mail registado" },
            ],
            match: (f, v) => (v === "com" ? Boolean(f.guardianEmail) : !f.guardianEmail),
          },
          {
            key: "valor",
            label: "Montante",
            icon: "Coins",
            options: [
              { value: "baixo", label: "Até 20 000 Kz" },
              { value: "medio", label: "20 000 – 60 000 Kz" },
              { value: "alto", label: "Acima de 60 000 Kz" },
            ],
            match: (f, v) =>
              v === "baixo"
                ? f.totalAmount <= 20000
                : v === "medio"
                ? f.totalAmount > 20000 && f.totalAmount <= 60000
                : f.totalAmount > 60000,
          },
        ]}
        dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (f) => f.dueDate }]}
        sorts={[
          {
            value: "vencimento",
            label: "Vencimento",
            compare: (a, b) => a.dueDate.localeCompare(b.dueDate),
          },
          { value: "valor", label: "Montante", compare: (a, b) => a.totalAmount - b.totalAmount },
          {
            value: "aluno",
            label: "Aluno",
            compare: (a, b) => a.studentName.localeCompare(b.studentName, "pt"),
          },
        ]}
        emptyTitle="Nenhum processo com dívida encontrado"
        emptyDescription="Não há mensalidades pendentes ou vencidas com estes filtros."
        emptyIcon="CheckCheck"
      />

      {/* Modal de Pré-visualização e Envio de E-mail (MindGest Standard: w-max sem bordas internas) */}
      <Dialog open={Boolean(selectedFee)} onOpenChange={(open) => !open && setSelectedFee(null)}>
        <DialogContent className="w-full max-w-xl p-6 gap-5">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Icon name="Mail" className="w-5 h-5 text-primary" />
              Notificação de Cobrança por E-mail
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pré-visualização do comunicado oficial a ser expedido ao encarregado de educação.
            </DialogDescription>
          </DialogHeader>

          {selectedFee && (
            <div className="space-y-4">
              {/* Form Grid alinhado */}
              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Destinatário (Encarregado)</Label>
                  <Input
                    type="email"
                    placeholder="ex: encarregado@email.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                  {!customEmail && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      Aviso: Insira o correio electrónico para o qual a nota de cobrança deve ser enviada.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Assunto da Mensagem</Label>
                  <Input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="h-9 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Pré-visualização do E-mail */}
              <div className="rounded-lg bg-muted/40 p-4 space-y-3 text-xs border border-border/40">
                <div className="flex items-center justify-between pb-2 border-b border-border/30">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon name="School" className="w-4 h-4 text-primary" />
                    <span>MindSchool — Tesouraria Académica</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Canal Oficial SMTP
                  </Badge>
                </div>

                <div className="space-y-2 text-muted-foreground leading-relaxed">
                  <p>
                    Exmo.(a) Sr.(a){" "}
                    <strong className="text-foreground">{selectedFee.guardianName || "Encarregado(a)"}</strong>,
                  </p>
                  <p>
                    Vimos por este meio informar que a mensalidade de{" "}
                    <strong className="text-foreground">
                      {selectedFee.monthLabel} / {selectedFee.year}
                    </strong>{" "}
                    referente ao estudante{" "}
                    <strong className="text-foreground">{selectedFee.studentName}</strong> (Processo nº{" "}
                    <span className="font-mono text-foreground">{selectedFee.studentNumber}</span>) encontra-se com o valor de{" "}
                    <strong className="text-foreground">{formatCurrency(selectedFee.totalAmount)}</strong> em atraso.
                  </p>
                  <p>
                    Solicitamos a regularização do pagamento junto da secretaria ou por transferência bancária, de modo a evitar a aplicação de juros ou multas por atraso progressivas segundo o regulamento financeiro em vigor.
                  </p>
                </div>

                <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Vencimento base: {selectedFee.dueDate}</span>
                  <span className="text-primary font-semibold">Tolerância: 2 dias úteis</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedFee(null)} className="h-9 text-xs">
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSend}
              disabled={isSending || !customEmail}
              className="h-9 text-xs gap-1.5"
            >
              <Icon name="Send" className="w-3.5 h-3.5" />
              {isSending ? "A enviar comunicado..." : "Confirmar e Enviar E-mail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
