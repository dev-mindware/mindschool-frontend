"use client";

import { useAuth } from "@/hooks/auth";
import { AccountSecurity } from "./profile/account-security";

export function Security() {
    const { user } = useAuth();

    return (
        <div className="space-y-6" suppressHydrationWarning>
            <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between border-b pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Segurança</h2>
                    <p className="text-muted-foreground mt-1">
                        Gerir as credenciais de acesso e a segurança da conta.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-card rounded-xl border p-6 shadow-sm">
                    <AccountSecurity user={user} />
                </div>
                {/*  <div className="bg-card rounded-xl border p-6 shadow-sm">
                    <SupportAccess />
                </div> */}
            </div>
        </div>
    );
}
