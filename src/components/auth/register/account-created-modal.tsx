"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useModal, useAuthStore } from "@/stores";
import { Button } from "@/components";
import { GlobalModal } from "@/components/modal";
import { RegisterFormData } from "@/schemas";
import { loginAction } from "@/actions/login";
import { ErrorMessage } from "@/utils/messages";

export function AccountCreatedModal() {
  const { closeModal } = useModal();
  const router = useRouter();
  const { getValues } = useFormContext<RegisterFormData>();
  const [isPending, startTransition] = useTransition();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = () => {
    startTransition(async () => {
      try {
        const { email, password } = getValues("step1");

        const result = await loginAction({ email, password });

        if (result.user && result.redirectPath) {
          setUser(result.user);
          closeModal("account-created");
          router.push(result.redirectPath);
          return;
        }

        ErrorMessage(result.message || "Ocorreu um erro ao realizar o login automático.");
      } catch (error) {
        ErrorMessage("Ocorreu um erro inesperado ao realizar o login.");
        console.error("Login automatic error:", error);
      }
    });
  };

  return (
    <GlobalModal
      sucess
      canClose={false}
      id="account-created"
      title="Bem-vindo(a) ao Mindgest!"
      className="!w-lg text-center"
      description="Sua conta foi criada com sucesso."
    >
      <div className="flex flex-col items-center justify-center py-2 space-y-4">
        <div className="w-full">
          <Button
            onClick={handleLogin}
            loading={isPending}
            className="w-full bg-primary hover:bg-primary/90 font-semibold"
          >
            Entrar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
