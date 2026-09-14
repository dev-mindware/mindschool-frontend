"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon, GlobalModal, FeatureGate } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTuition } from "@/hooks/school/use-tuition";
import { TuitionPlan } from "@/types/tuition";
import { formatCurrency } from "@/utils/format-currency";
import { toast } from "sonner";

export function TuitionPlansContent() {
  const { plans, addPlan, updatePlan, deletePlan } = useTuition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TuitionPlan | null>(null);

  // Formulário
  const [name, setName] = useState("");
  const [educationCycle, setEducationCycle] = useState<TuitionPlan["educationCycle"]>("PRIMARY");
  const [classLevel, setClassLevel] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState<number>(35000);
  const [registrationFee, setRegistrationFee] = useState<number>(20000);
  const [reEnrollmentFee, setReEnrollmentFee] = useState<number>(15000);
  const [siblingsDiscountPercent, setSiblingsDiscountPercent] = useState<number>(10);
  const [latePenaltyPercent, setLatePenaltyPercent] = useState<number>(10);
  const [penaltyGracePeriodDays, setPenaltyGracePeriodDays] = useState<number>(5);

  function handleOpenCreate() {
    setEditingPlan(null);
    setName("");
    setEducationCycle("PRIMARY");
    setClassLevel("");
    setMonthlyAmount(35000);
    setRegistrationFee(20000);
    setReEnrollmentFee(15000);
    setSiblingsDiscountPercent(10);
    setLatePenaltyPercent(10);
    setPenaltyGracePeriodDays(5);
    setIsModalOpen(true);
  }

  function handleOpenEdit(plan: TuitionPlan) {
    setEditingPlan(plan);
    setName(plan.name);
    setEducationCycle(plan.educationCycle);
    setClassLevel(plan.classLevel);
    setMonthlyAmount(plan.monthlyAmount);
    setRegistrationFee(plan.registrationFee);
    setReEnrollmentFee(plan.reEnrollmentFee);
    setSiblingsDiscountPercent(plan.siblingsDiscountPercent);
    setLatePenaltyPercent(plan.latePenaltyPercent);
    setPenaltyGracePeriodDays(plan.penaltyGracePeriodDays);
    setIsModalOpen(true);
  }

  function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor insira a designação da tabela de preços.");
      return;
    }

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name,
        educationCycle,
        classLevel,
        monthlyAmount,
        registrationFee,
        reEnrollmentFee,
        siblingsDiscountPercent,
        latePenaltyPercent,
        penaltyGracePeriodDays,
      });
      toast.success("Tabela de preços actualizada com sucesso!");
    } else {
      addPlan({
        name,
        educationCycle,
        classLevel: classLevel || "Geral",
        monthlyAmount,
        registrationFee,
        reEnrollmentFee,
        siblingsDiscountPercent,
        latePenaltyPercent,
        penaltyGracePeriodDays,
        academicYear: "2025/2026",
        currency: "AOA",
        isActive: true,
      });
      toast.success("Nova tabela de propinas criada com sucesso!");
    }

    setIsModalOpen(false);
  }

  function handleDeletePlan(id: string) {
    if (confirm("Tem certeza que deseja eliminar esta tabela de preços?")) {
      deletePlan(id);
      toast.success("Tabela de preços eliminada.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Tabelas de Preço & Taxas Escolares"
          suTitle="Configuração de propinas, taxas de matrícula e regras de mora por ciclo de ensino"
        />
        <FeatureGate
          roles={["FINANCIAL", "DIRECTOR_GENERAL", "OWNER", "ADMIN"]}
          fallback="disabled"
          tooltipMessage="Apenas a direção ou finanças podem criar novas tabelas de preços."
        >
          <Button onClick={handleOpenCreate} className="h-10 px-4 text-xs font-semibold gap-2">
            <Icon name="Plus" className="w-4 h-4" />
            Nova Tabela de Preços
          </Button>
        </FeatureGate>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={plans.length.toString()}
          subtitle="Tabelas Activas"
          description="Por nível e ciclo de ensino"
          icon="Layers"
        />
        <DynamicMetricCard
          title="10% a 25%"
          subtitle="Desconto de Irmãos"
          description="Aplicado automaticamente"
          icon="Percent"
        />
        <DynamicMetricCard
          title="5 dias"
          subtitle="Tolerância de Vencimento"
          description="Prazo sem multa de mora"
          icon="Calendar"
        />
        <DynamicMetricCard
          title="10%"
          subtitle="Multa por Atraso"
          description="Aplicada após dia de tolerância"
          icon="CircleAlert"
        />
      </div>

      {/* Grid de Tabelas de Preço com Cards do shadcn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col justify-between shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    {plan.academicYear}
                  </Badge>
                  <CardTitle className="text-sm font-semibold text-foreground mt-1.5">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.classLevel}</CardDescription>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Activo" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Propina Mensal:</span>
                  <span className="font-bold text-primary text-sm">{formatCurrency(plan.monthlyAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Taxa de Matrícula:</span>
                  <span className="font-medium text-foreground">{formatCurrency(plan.registrationFee)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Confirmação:</span>
                  <span className="font-medium text-foreground">{formatCurrency(plan.reEnrollmentFee)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/30 border">
                  <span className="text-muted-foreground block text-[10px]">Desconto Irmão</span>
                  <span className="font-semibold text-foreground">{plan.siblingsDiscountPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border">
                  <span className="text-muted-foreground block text-[10px]">Mora / Tolerância</span>
                  <span className="font-semibold text-foreground">{plan.latePenaltyPercent}% ({plan.penaltyGracePeriodDays}d)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <FeatureGate
                  roles={["FINANCIAL", "DIRECTOR_GENERAL", "OWNER", "ADMIN"]}
                  fallback="disabled"
                  tooltipMessage="Sem autorização para alterar preçários."
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(plan)}
                    className="h-8 px-3 text-xs"
                  >
                    <Icon name="Pencil" className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                </FeatureGate>
                <FeatureGate
                  roles={["DIRECTOR_GENERAL", "OWNER", "ADMIN"]}
                  fallback="disabled"
                  tooltipMessage="Apenas o Diretor Geral pode eliminar tabelas de preços."
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    <Icon name="Trash2" className="w-3.5 h-3.5" />
                  </Button>
                </FeatureGate>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Criar / Editar Tabela */}
      <GlobalModal
        id="tuition-plan-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        canClose
        title={editingPlan ? "Editar Tabela de Preços" : "Nova Tabela de Preços"}
        description="Defina os valores de propinas, taxas de confirmação e multas regulamentares."
        className="max-w-lg"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">Designação da Tabela</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Propina Ensino Secundário Geral"
              className="h-10 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Ciclo de Ensino</Label>
              <Select
                value={educationCycle}
                onValueChange={(val) => setEducationCycle(val as any)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRE_SCHOOL">Pré-Escolar (Creche/Jardim)</SelectItem>
                  <SelectItem value="PRIMARY">Ensino Primário (1.ª à 6.ª)</SelectItem>
                  <SelectItem value="LOWER_SECONDARY">I Ciclo Secundário (7.ª à 9.ª)</SelectItem>
                  <SelectItem value="UPPER_SECONDARY">II Ciclo Geral (10.ª à 12.ª)</SelectItem>
                  <SelectItem value="TECHNICAL">Ensino Técnico-Profissional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Classes Abrangidas</Label>
              <Input
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                placeholder="Ex: 7.ª, 8.ª e 9.ª Classe"
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Propina Mensal (Kz)</Label>
              <Input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="h-10 text-xs font-semibold"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Taxa Matrícula (Kz)</Label>
              <Input
                type="number"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Confirmação (Kz)</Label>
              <Input
                type="number"
                value={reEnrollmentFee}
                onChange={(e) => setReEnrollmentFee(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Desconto Irmãos (%)</Label>
              <Input
                type="number"
                value={siblingsDiscountPercent}
                onChange={(e) => setSiblingsDiscountPercent(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Multa Mora (%)</Label>
              <Input
                type="number"
                value={latePenaltyPercent}
                onChange={(e) => setLatePenaltyPercent(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Tolerância (Dias)</Label>
              <Input
                type="number"
                value={penaltyGracePeriodDays}
                onChange={(e) => setPenaltyGracePeriodDays(Number(e.target.value))}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-10 text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" className="h-10 px-5 text-xs font-semibold">
              Gravar Tabela
            </Button>
          </div>
        </form>
      </GlobalModal>
    </div>
  );
}
