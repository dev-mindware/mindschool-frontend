"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components";
import { useAuth } from "@/hooks/auth";
import { formatCurrency } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export function SubscriptionInfo() {
  const { user } = useAuth();
  const subscription = user?.company?.subscription;
  const plan = subscription?.plan;

  if (!subscription || !plan) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>Nenhum plano activo</CardTitle>
          <CardDescription>
            A sua instituição ainda não possui uma subscrição activa do MindSchool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/plans">
            <Button className="gap-2 text-xs font-semibold">
              <Icon name="Zap" size={16} />
              Ver Planos Disponíveis
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isTrial = subscription.status === "TRIALING";
  const isPending = subscription.status === "PENDING";
  const endDate = isTrial
    ? subscription.trialEndsAt
    : subscription.periodEndsAt;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Plano {plan.name}</CardTitle>
            <CardDescription className="text-xs">
              Detalhes da subscrição institucional da sua instituição de ensino.
            </CardDescription>
          </div>
          <Badge
            variant={isTrial ? "secondary" : isPending ? "outline" : "default"}
            className="px-3 py-1 text-xs"
          >
            {isTrial ? "Período de Teste" : isPending ? "Pendente" : "Activo"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Preço Mensal</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(Number(plan.priceMonthly))}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                {isTrial ? "Expira em" : "Próxima Facturação"}
              </p>
              <p className="text-sm font-semibold">
                {endDate
                  ? format(new Date(endDate), "dd 'de' MMMM, yyyy", {
                      locale: ptBR,
                    })
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Ciclo de Facturação</p>
              <p className="text-sm font-semibold capitalize">
                {subscription.billingInterval || "Mensal"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/plans">
              <Button className="gap-2 text-xs font-semibold" disabled={isPending}>
                <Icon name="ArrowUpToLine" size={16} />
                Actualizar Plano
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
