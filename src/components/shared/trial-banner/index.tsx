"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import { useAuthStore } from "@/stores/auth";
import { SubscriptionStatus } from "@/types";
import { Button } from "@/components/ui";
import { AlertCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function TrialBanner() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subscription = user?.company?.subscription;
  const isTrialing = subscription?.status === SubscriptionStatus.TRIALING;
  const trialEndsAt = subscription?.trialEndsAt;

  const { daysRemaining, urgency } = useMemo(() => {
    if (!trialEndsAt) return { daysRemaining: 0, urgency: "neutral" };
    
    const diff = differenceInDays(new Date(trialEndsAt), new Date());
    
    let level = "neutral";
    if (diff <= 0) level = "expired";
    else if (diff <= 2) level = "critical";
    else if (diff <= 6) level = "warning";
    
    return { daysRemaining: Math.max(0, diff), urgency: level };
  }, [trialEndsAt]);

  if (!mounted || !isTrialing || !isVisible || pathname === "/billing") {
    return null;
  }

  const urgencyStyles = {
    neutral: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    expired: "bg-destructive text-destructive-foreground border-destructive",
  };

  const urgencyIcon = {
    neutral: <Clock className="h-4 w-4" />,
    warning: <Clock className="h-4 w-4" />,
    critical: <AlertCircle className="h-4 w-4" />,
    expired: <AlertCircle className="h-4 w-4" />,
  };

  const currentStyle = urgencyStyles[urgency as keyof typeof urgencyStyles];
  const Icon = urgencyIcon[urgency as keyof typeof urgencyIcon];

  return (
    <div className={cn(
      "relative flex items-center justify-between gap-4 px-4 py-2 border-b text-sm font-medium transition-colors w-full z-50",
      currentStyle
    )}>
      <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
        {Icon}
        <span>
          {urgency === "expired" ? (
            "O seu período de teste expirou. Actualize o plano para continuar a utilizar todas as funcionalidades."
          ) : (
            `Período de teste: ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}. Actualize o plano para continuar a utilizar todas as funcionalidades.`
          )}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <Link href="/billing">
          <Button 
            size="sm" 
            variant={urgency === "expired" ? "secondary" : "default"}
            className={cn(
              "h-7 text-xs px-3",
              urgency === "warning" && "bg-amber-600 hover:bg-amber-700 text-white",
              urgency === "critical" && "bg-destructive hover:bg-destructive/90 text-white"
            )}
          >
            Fazer Upgrade
          </Button>
        </Link>
        <button 
          onClick={() => setIsVisible(false)}
          className={cn(
            "p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity",
            urgency === "warning" && "hover:bg-amber-500/20 text-amber-700",
            urgency === "critical" && "hover:bg-destructive/20 text-destructive",
            urgency === "expired" && "hover:bg-white/20 text-white",
            urgency === "neutral" && "hover:bg-primary/10 text-primary"
          )}
          aria-label="Fechar banner"
        >
          <X className="h-4 w-4 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}
