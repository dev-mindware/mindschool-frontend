"use client";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { currentBankStore, useModal } from "@/stores";
import { BankFormData, bankSchema } from "@/schemas/bank-schema";
import { useAddBank, useUpdateBank } from "@/hooks/banks";
import {
  Input,
  Button,
  Checkbox,
  ButtonSubmit,
  GlobalModal,
  SelectField,
} from "@/components";

const ANGOLAN_BANKS = [
  { name: "BAI", code: "0040" },
  { name: "BIC", code: "0051" },
  { name: "BCI", code: "0005" },
  { name: "SOL", code: "0044" },
  { name: "BFA", code: "0006" },
  { name: "ATLANTICO", code: "0055" },
];

type BankModalProps = {
  action: "add" | "edit";
};

export function BankModal({ action }: BankModalProps) {
  const { closeModal, open } = useModal();
  const isOpen = open["add-bank"] || open["edit-bank"];
  const { currentBank } = currentBankStore();

  const { mutateAsync: addBank, isPending: isAdding } = useAddBank();
  const { mutateAsync: editBank, isPending: isEditing } = useUpdateBank();

  const bankOptions = useMemo(() => {
    const list = ANGOLAN_BANKS.map((b) => ({ value: b.name, label: b.name }));
    if (
      action === "edit" &&
      currentBank &&
      !ANGOLAN_BANKS.some((b) => b.name === currentBank.bankName)
    ) {
      list.push({ value: currentBank.bankName, label: currentBank.bankName });
    }
    return list;
  }, [action, currentBank]);

  const {
    reset,
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    mode: "onChange",
    defaultValues: {
      bankName: "",
      accountNumber: "",
      iban: "",
      phone: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (action === "edit" && currentBank) {
      reset({
        bankName: currentBank.bankName,
        accountNumber: currentBank.accountNumber,
        iban: currentBank.iban,
        phone: currentBank.phone || "",
        isDefault: currentBank.isDefault,
      });
    }
  }, [action, currentBank, reset]);

  async function onSubmit(data: BankFormData) {
    try {
      if (action === "add") {
        await addBank(data);
        reset();
      } else if (action === "edit" && currentBank) {
        await editBank({ id: currentBank.id, data });
      }
      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Não foi possível guardar o banco.",
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal(action === "add" ? "add-bank" : "edit-bank");
  };

  if ((action === "edit" && !currentBank) || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id={action === "add" ? "add-bank" : "edit-bank"}
      title={action === "add" ? "Adicionar Banco" : "Editar Banco"}
      className="!max-w-md !w-[90vw] md:!w-full"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[80vh]"
      >
        <Controller
          name="bankName"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Nome do Banco"
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                if (action === "add") {
                  const bank = ANGOLAN_BANKS.find((b) => b.name === val);
                  if (bank) {
                    setValue("iban", `AO06.${bank.code}.`);
                  }
                }
              }}
              options={bankOptions}
              placeholder="Seleccione o banco"
            />
          )}
        />
        {errors.bankName && (
          <p className="text-xs text-red-500 -mt-4">{errors.bankName.message}</p>
        )}

        <Input
          label="Número da Conta"
          placeholder="Número da conta"
          {...register("accountNumber")}
          error={errors.accountNumber?.message}
        />

        <Input
          label="IBAN"
          placeholder="AO06..."
          {...register("iban")}
          error={errors.iban?.message}
        />

        <Input
          label="Express (Opcional)"
          placeholder="Referência"
          {...register("phone")}
          error={errors.phone?.message}
        />

        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <Checkbox
            checked={watch("isDefault")}
            onCheckedChange={(checked) =>
              setValue("isDefault", checked as boolean)
            }
          />
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Banco Padrão
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            className="w-max"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            className="w-max"
            isLoading={isSubmitting || isAdding || isEditing}
          >
            {action === "add" ? "Adicionar" : "Guardar alterações"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
