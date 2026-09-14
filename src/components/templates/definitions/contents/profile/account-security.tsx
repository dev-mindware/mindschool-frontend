"use client";

import { Button, Input } from "@/components";
import type { User } from "@/types";
import { useModal } from "@/stores";
import { ChangePasswordModal } from "./modals/change-password-modal";
import { ChangeEmailModal } from "./modals/change-email-modal";

interface AccountSecurityProps {
  user: User | null;
}

export function AccountSecurity({ user }: AccountSecurityProps) {
  const { openModal } = useModal();
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Credenciais da Conta</h3>
        <p className="text-xs text-muted-foreground">
          Faça a gestão dos seus dados de autenticação e proteção de acesso ao MindSchool.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          <div className="flex-1 max-w-sm">
            <Input
              label="Email de acesso"
              disabled
              defaultValue={user.email}
              className="h-10 text-xs bg-muted/40"
            />
          </div>
          <Button
            variant="outline"
            className="h-10 text-xs font-medium shrink-0"
            onClick={() => openModal("change-email")}
          >
            Alterar email
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          <div className="flex-1 max-w-sm">
            <Input
              label="Palavra-passe"
              type="password"
              value="************"
              disabled
              className="h-10 text-xs bg-muted/40 font-mono"
            />
          </div>
          <Button
            variant="outline"
            className="h-10 text-xs font-medium shrink-0"
            onClick={() => openModal("change-password")}
          >
            Alterar palavra-passe
          </Button>
        </div>
      </div>

      <ChangePasswordModal />
      <ChangeEmailModal currentEmail={user.email} />
    </div>
  );
}
