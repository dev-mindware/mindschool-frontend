"use client";

import { useAuth } from "@/hooks/auth";
import { AccountSecurity } from "./profile/account-security";
import { SecurityCenter } from "@/components/client/settings/security/security-center";

export function Security() {
  const { user } = useAuth();

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Segurança</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Faça a gestão das credenciais de acesso, palavra-passe e segurança da conta.
          </p>
        </div>
      </div>

      <div className="border-b pb-8 last:border-0">
        <AccountSecurity user={user} />
      </div>

      <div className="border-b pb-8 last:border-0">
        <SecurityCenter />
      </div>
    </div>
  );
}
