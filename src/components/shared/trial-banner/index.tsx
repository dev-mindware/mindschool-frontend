"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { AlertCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useSubscription } from "@/hooks/school/use-subscription";

/** Quem gere a subscrição (o menu «Planos» só existe para estes papéis). */
const BILLING_ROLES = ["DIRECTOR_GENERAL", "OWNER", "ADMIN"];
const HIDDEN_ON = ["/plans", "/subscription", "/billing"];

type Level = "neutral" | "warning" | "critical" | "blocked";
const STYLE: Record<Level, string> = {
  neutral: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  blocked: "bg-destructive text-destructive-foreground border-destructive",
};

/**
 * Estado comercial da escola (dados reais da API): teste, atraso e modo de consulta. Com a subscrição expirada, suspensa
 * ou cancelada só se consulta; as escritas ficam bloqueadas excepto perfil, notificações e a própria subscrição.
 */
export function TrialBanner() {
  const { user } = useAuthStore();
  // O hook (e os pedidos à API) só existe para quem gere a subscrição: os outros papéis não têm permissão (403).
  return user && BILLING_ROLES.includes(user.role) ? <SubscriptionBanner /> : null;
}

function SubscriptionBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [now] = useState(() => Date.now());
  const { current } = useSubscription();
  const sub = current?.subscription;

  if (!sub || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  let level: Level | null = null;
  let text = "";
  let cta = "Ver planos";
  if (sub.status === "trial") {
    const days = Math.max(0, differenceInCalendarDays(new Date(sub.trial_ends_at ?? now), new Date(now)));
    level = days <= 2 ? "critical" : days <= 6 ? "warning" : "neutral";
    text = `Período de teste do plano Essencial: ${days} ${days === 1 ? "dia restante" : "dias restantes"}. Subscreva para não perder o acesso.`;
    cta = "Subscrever";
  } else if (sub.status === "past_due" || sub.status === "grace") {
    level = "warning";
    text = "Pagamento em atraso. Renove a subscrição para evitar limitações.";
    cta = "Renovar";
  } else if (["expired", "suspended", "cancelled"].includes(sub.status)) {
    level = "blocked";
    text = `${sub.status === "expired" ? "A subscrição expirou" : sub.status === "suspended" ? "A subscrição está suspensa" : "A subscrição foi cancelada"}: apenas consulta. Os dados estão preservados; edições ficam bloqueadas até regularizar.`;
    cta = "Regularizar";
  }
  if (!level || (dismissed && level === "neutral")) return null;

  const Icon = level === "neutral" || level === "warning" ? Clock : AlertCircle;
  return (
    <div className={cn("relative z-50 flex w-full items-center justify-between gap-4 border-b px-4 py-2 text-sm font-medium", STYLE[level])}>
      <div className="flex flex-1 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{text}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant={level === "blocked" ? "secondary" : "default"} className="h-7 px-3 text-xs">
          <Link href="/plans">{cta}</Link>
        </Button>
        {level === "neutral" && (
          <button onClick={() => setDismissed(true)} className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100" aria-label="Fechar banner"><X className="h-4 w-4" /></button>
        )}
      </div>
    </div>
  );
}
