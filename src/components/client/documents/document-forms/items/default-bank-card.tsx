"use client";

import { Building2, Hash, CreditCard, Phone } from "lucide-react";
import { useAuth } from "@/hooks/auth";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

export function DefaultBankCard() {
  const { user } = useAuth();

  const defaultBank = {
    bankName: "Banco Angolano de Investimentos (BAI)",
    accountNumber: "0040.0000.1234.5678",
    iban: "AO06.0040.0000.1234.5678.1012.3",
    phone: user?.company?.phone || "+244 923 000 111",
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 relative">
      <div className="flex justify-between items-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Coordenadas Bancárias da Escola
        </p>
      </div>
      <Row
        icon={<Building2 size={14} />}
        label="Banco"
        value={defaultBank.bankName}
      />
      <Row
        icon={<Hash size={14} />}
        label="Nº de Conta"
        value={defaultBank.accountNumber}
      />
      <Row
        icon={<CreditCard size={14} />}
        label="IBAN"
        value={defaultBank.iban}
      />
      <Row
        icon={<Phone size={14} />}
        label="Express"
        value={defaultBank.phone}
      />
    </div>
  );
}
