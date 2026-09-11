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
    <div>
      <h3 className="text-2xl text-center md:text-start">Segurança da conta</h3>
      <p className="text-center text-muted-foreground md:text-start">
        Altere as suas configurações de segurança.
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              label="Email"
              disabled
              defaultValue={user.email}
              className="w-[50%]"
            />
            <Button
              className="whitespace-nowrap"
              onClick={() => openModal("change-email")}
            >
              Alterar email
            </Button>
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              label="Palavra-passe"
              type="password"
              value="************"
              disabled
              className="w-[50%]"
            />
            <Button onClick={() => openModal("change-password")}>
              Alterar palavra-passe
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordModal />
      <ChangeEmailModal currentEmail={user.email} />
    </div>
  );
}
