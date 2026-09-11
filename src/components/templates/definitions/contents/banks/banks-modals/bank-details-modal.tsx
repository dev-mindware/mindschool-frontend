"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import {
    Icon,
    Button,
    DetailRow,
    GlobalModal,
    ItemStatusBadge,
} from "@/components";
import { currentBankStore } from "@/stores";
import { formatDateTime } from "@/utils";

export function BankDetailsModal() {
    const { closeModal, open } = useModal();
    const { currentBank } = currentBankStore();

    if (!currentBank) return null;

    if (!open["details-bank"]) return null;

    return (
        <GlobalModal
            canClose
            id="details-bank"
            title={
                <>
                    <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
                        <Icon name="Landmark" className="w-10 h-10 text-primary" />
                    </div>

                    <div className="text-center space-y-1 mt-4">
                        <h2 className="text-2xl font-bold">{currentBank.bankName}</h2>
                        <div className="flex items-center justify-center gap-2">
                            {currentBank.isDefault && (
                                <span className="text-xs text-muted-foreground">Banco Padrão</span>
                            )}
                        </div>
                    </div>
                </>
            }
            className="!max-h-[85vh] w-full max-w-md"
            footer={
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => closeModal("details-bank")}>
                        Fechar
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 text-sm">
                <section className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                        Informações da Conta
                    </h3>
                    <DetailRow label="Número da Conta" value={currentBank.accountNumber} />
                    <DetailRow label="IBAN" value={currentBank.iban} />
                    {currentBank.phone && (
                        <DetailRow label="Telefone" value={currentBank.phone} />
                    )}
                </section>

                {currentBank.createdAt && (
                    <section className="space-y-2">
                        <h3 className="font-semibold text-foreground">Actualizado em</h3>
                        <DetailRow
                            label="Data de Criação"
                            value={formatDateTime(currentBank.createdAt)}
                        />
                    </section>
                )}
            </div>
        </GlobalModal>
    );
}
