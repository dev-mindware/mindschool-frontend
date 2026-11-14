"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Can,
  Badge,
  Button,
  FormModal,
  Icon,
  Input,
  TitleList,
} from "@/components";
import { useBankAccounts } from "@/modules/finance/hooks/use-tuition-payments";
import { type ApiBankAccount } from "@/modules/finance/services/tuition-payments-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import {
  bankAccountSchema,
  normalizeIban,
  type BankAccountFormData,
} from "@/schemas";
import type { z } from "zod";

type BankAccountInput = z.input<typeof bankAccountSchema>;

const MODAL_ID = "bank-account-modal";
const EMPTY: BankAccountInput = {
  bankName: "",
  accountHolder: "",
  iban: "",
  accountNumber: "",
  swift: "",
  instructions: "",
};

const formatIban = (s: string) =>
  normalizeIban(s).replace(/(.{4})/g, "$1 ").trim();

export function BankAccountsPageContent() {
  const { accounts, isLoading: loading, create, update } = useBankAccounts();
  const { openModal } = useModal();
  const [editing, setEditing] = useState<ApiBankAccount | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<BankAccountInput, unknown, BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    mode: "onChange",
    defaultValues: EMPTY,
  });

  const openNew = () => {
    setEditing(null);
    reset(EMPTY);
    openModal(MODAL_ID);
  };

  const openEdit = (b: ApiBankAccount) => {
    setEditing(b);
    reset({
      bankName: b.bank_name,
      accountHolder: b.account_holder,
      iban: formatIban(b.iban),
      accountNumber: b.account_number ?? "",
      swift: b.swift ?? "",
      instructions: b.instructions ?? "",
    });
    void trigger();
    openModal(MODAL_ID);
  };

  const onSubmit = async (data: BankAccountFormData) => {
    const payload = {
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      iban: normalizeIban(data.iban),
      accountNumber: data.accountNumber || undefined,
      swift: data.swift || undefined,
      instructions: data.instructions || undefined,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: payload });
        SucessMessage("Conta bancária actualizada.");
      } else {
        await create.mutateAsync(payload);
        SucessMessage("Conta bancária adicionada.");
      }
    } catch (e) {
      applyApiFieldErrors(e, setError, {
        bank_name: "bankName",
        account_holder: "accountHolder",
        account_number: "accountNumber",
      });
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a conta bancária."));
      throw e;
    }
  };

  const toggleActive = async (b: ApiBankAccount) => {
    try {
      await update.mutateAsync({ id: b.id, data: { isActive: !b.is_active } });
      SucessMessage(b.is_active ? "Conta desactivada." : "Conta reactivada.");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível alterar o estado."));
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <TitleList
        title="Contas Bancárias da Escola"
        suTitle="Mostradas ao encarregado quando paga propinas por transferência ou depósito. Pode ter várias contas (BAI, BFA, BIC, etc.)."
      >
        <Can permission="bank_account:write">
          <Button onClick={openNew} className="gap-2 text-xs">
            <Icon name="Plus" className="size-4" /> Nova Conta Bancária
          </Button>
        </Can>
      </TitleList>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xs border border-border/60 bg-muted/40" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xs border border-dashed border-border p-10 text-center space-y-2">
          <Icon name="Landmark" className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Nenhuma conta bancária registada</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Adicione pelo menos o IBAN principal da escola para que os encarregados saibam para onde transferir ao enviar o comprovativo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((b) => (
            <div
              key={b.id}
              className="rounded-xs border border-border/70 bg-card p-5 space-y-3 transition-shadow hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xs bg-primary/10 text-primary">
                    <Icon name="Landmark" className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{b.bank_name}</p>
                    <p className="text-xs text-muted-foreground">{b.account_holder}</p>
                  </div>
                </div>
                <Badge variant={b.is_active ? "success" : "secondary"}>
                  {b.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <div className="rounded-xs bg-muted/50 px-3 py-2 font-mono text-xs tracking-wide select-all">
                {formatIban(b.iban)}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {b.account_number && <span>Conta: {b.account_number}</span>}
                {b.swift && <span>SWIFT: {b.swift}</span>}
              </div>
              {b.instructions && <p className="text-xs text-muted-foreground">{b.instructions}</p>}
              <Can permission="bank_account:write">
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(b)}>
                    {b.is_active ? "Desactivar" : "Reactivar"}
                  </Button>
                </div>
              </Can>
            </div>
          ))}
        </div>
      )}

      <FormModal
        id={MODAL_ID}
        title={editing ? "Editar Conta Bancária" : "Nova Conta Bancária"}
        submitLabel="Guardar"
        isLoading={busy}
        disabled={!isValid || busy}
        onSubmit={handleSubmit(onSubmit)}
        onClose={() => reset(EMPTY)}
      >
        <Input
          label="Banco *"
          placeholder="Ex.: Banco Angolano de Investimentos (BAI)"
          error={errors.bankName?.message}
          {...register("bankName")}
        />
        <Input
          label="Titular da conta *"
          placeholder="Ex.: Colégio Esperança, Lda."
          error={errors.accountHolder?.message}
          {...register("accountHolder")}
        />
        <div className="sm:col-span-2">
          <Input
            label="IBAN *"
            placeholder="AO06.0040.0000.5660.0824.1017.4"
            error={errors.iban?.message}
            {...register("iban", {
              onChange: (e) => {
                e.target.value = formatIban(e.target.value);
              },
            })}
          />
        </div>
        <Input
          label="Número de conta (opcional)"
          placeholder="14 dígitos numéricos"
          error={errors.accountNumber?.message}
          {...register("accountNumber")}
        />
        <Input
          label="Código SWIFT/BIC (opcional)"
          placeholder="Ex.: BAIPAOLU"
          error={errors.swift?.message}
          {...register("swift", {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
        />
        <div className="sm:col-span-2">
          <Input
            label="Instruções para o encarregado (opcional)"
            placeholder="Ex.: Colocar o nome do aluno na descrição da transferência"
            error={errors.instructions?.message}
            {...register("instructions")}
          />
        </div>
      </FormModal>
    </div>
  );
}
