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
          <CardTitle>Nenhum plano ativo</CardTitle>
          <CardDescription>
            Ainda não existe uma subscrição activa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/plans">
            <Button className="gap-2">
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
            <CardTitle className="text-2xl">Plano {plan.name}</CardTitle>
            <CardDescription>
              Gerir os detalhes da sua subscrição.
            </CardDescription>
          </div>
          <Badge
            variant={isTrial ? "secondary" : isPending ? "pending" : "default"}
            className="px-3 py-1"
          >
            {isTrial ? "Período de Teste" : isPending ? "Pendente" : "Ativo"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Preço Mensal</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(Number(plan.priceMonthly))}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {isTrial ? "Expira em" : "Próxima facturação"}
              </p>
              <p className="text-lg font-semibold">
                {endDate
                  ? format(new Date(endDate), "dd 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Intervalo</p>
              <p className="text-lg font-semibold capitalize">
                {subscription.billingInterval || "Mensal"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link href="/plans" className={`${isPending && "pointer-events-none"}`}>
              <Button className="gap-2" disabled={isPending}>
                <Icon name="ArrowUpToLine" size={16} />
                Actualizar plano
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
