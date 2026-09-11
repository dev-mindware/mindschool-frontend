import { Plan } from "@/types";
import {
  formatCurrency,
  getPlanFeatures,
} from "@/utils";
import type { ComponentType, ReactNode } from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Shield, Check } from "lucide-react";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-foreground">{label}</span>
      {children}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="font-semibold flex items-center text-foreground">
        <Icon className="h-5 w-5 text-primary-500 mr-2" />
        {title}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center">
      <Check className="h-4 w-4 text-green-500 mr-2" />
      <span className="text-foreground">{children}</span>
    </li>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <div className="bg-primary-50 dark:bg-primary-300/10  p-2 rounded text-xs font-mono text-foreground">
      {children}
    </div>
  );
}

interface SubscriptionSummaryProps {
  selectedPlan: Plan | null;
  months: number;
  frequency: "MONTHLY" | "ANNUAL";
}

export function SubscriptionSummary({
  selectedPlan,
  months,
  frequency,
}: SubscriptionSummaryProps) {
  
  if (!selectedPlan) return null;

  const price = parseFloat(selectedPlan.priceMonthly);
  const isAnnual = frequency === "ANNUAL";
  const actualMonths = isAnnual ? 12 : months;

  const subtotal = price * actualMonths;
  const discount = isAnnual ? subtotal * 0.05 : 0;
  const totalToPay = subtotal - discount;

  const featuresList = getPlanFeatures(selectedPlan);

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Resumo da Subscrição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="Plano seleccionado:">
            <Badge className="bg-primary-500 text-white">
              {selectedPlan.name}
            </Badge>
          </InfoRow>

          <InfoRow label="Tipo de Subscrição:">
            <span className="font-medium text-foreground">
              {isAnnual ? "Anual (5% desconto)" : "Mensal"}
            </span>
          </InfoRow>

          <InfoRow label="Preço mensal:">
            <span className="font-bold text-primary-600">
              {formatCurrency(price)}
            </span>
          </InfoRow>

          {isAnnual && (
            <InfoRow label="Desconto anual:">
              <span className="font-medium text-green-600">
                - {formatCurrency(discount)}
              </span>
            </InfoRow>
          )}

          <InfoRow label="Total a pagar:">
            <div className="text-right">
              {isAnnual && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(subtotal)}
                </p>
              )}
              <p className="font-bold text-primary-600 text-lg">
                {formatCurrency(totalToPay)}
              </p>
            </div>
          </InfoRow>
        </CardContent>
      </Card>

      <SectionCard icon={Shield} title="Recursos inclusos">
        <ul className="space-y-2 text-sm">
          {featuresList.map((feature, idx) => (
            <CheckItem key={idx}>{feature}</CheckItem>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
