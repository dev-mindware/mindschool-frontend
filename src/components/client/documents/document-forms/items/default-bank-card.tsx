"use client";
import { Building2, Hash, CreditCard, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultBank } from "@/hooks/banks";
import { Button } from "@/components";
import { useModal } from "@/stores";

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
    const { openModal } = useModal();
    const { defaultBank, isLoading } = useDefaultBank();

    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card p-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
            </div>
        );
    }

    if (!defaultBank) {
        return (
            <div className="rounded-lg border-2 border-dashed bg-card/50 p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                        Nenhum Banco Registado
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                        Aceda ao menu <strong>Configurações</strong> para registar os dados bancários.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => openModal("add-bank")}
                >
                    + Adicionar Banco
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card p-4 space-y-3 relative">
            <div className="flex justify-between items-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Dados Bancários
                </p>
                <button
                    type="button"
                    onClick={() => openModal("add-bank")}
                    className="text-xs text-primary hover:underline font-medium"
                >
                    + Novo Banco
                </button>
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
