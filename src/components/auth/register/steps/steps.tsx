"use client";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { FirstStep } from "./first-step";
import { SecondStep } from "./second-step";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperSeparator,
  StepperIndicator,
  AccountCreatedModal,
} from "@/components";
import { NavigationButtons } from "./navigation-buttons";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/schemas";
import { ThirdStep } from "./third-step";
import { HeroImageSide } from "../../_components";
import { useAddCompany } from "@/hooks";
import { ErrorMessage } from "@/utils/messages";
import Link from "next/link";

export function RegisterForm() {
  const steps = [1, 2, 3];
  const [currentStep, setCurrentStep] = useState(1);
  const { mutateAsync: addCompany, isPending } = useAddCompany();
  const [isLoading, startTransition] = useTransition();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Captura automaticamente o codigo do afiliado a partir do link de convite
  // (ex.: /auth/register?ref=MWD-AO-1234). Aceita ?ref ou ?code.
  const searchParams = useSearchParams();
  const affiliateFromUrl = (searchParams.get("ref") || searchParams.get("code") || "").trim();
  const affiliateLocked = affiliateFromUrl.length > 0;

  useEffect(() => {
    if (affiliateFromUrl) {
      form.setValue("step1.affiliateCode", affiliateFromUrl, { shouldValidate: true });
    }
  }, [affiliateFromUrl]);

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        return await form.trigger("step1");
      case 2:
        return await form.trigger("step2");
      default:
        return false;
    }
  };

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = async () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return <FirstStep affiliateLocked={affiliateLocked} />;
      case 2:
        return <SecondStep />;
      case 3:
        return <ThirdStep />;
      default:
        return null;
    }
  };

  function onSubmit(data: RegisterFormData) {
    startTransition(async () => {
      try {
        const { passwordConfirmation, affiliateCode, ...rest } = data.step1;
        const finalData = {
          ...rest,
          ...data.step2,
          ...(affiliateCode ? { affiliateCode } : {}),
        };

        await addCompany(finalData);
      } catch (error: any) {
        if (error?.response?.data) {
          ErrorMessage(
            error?.response?.data?.message ||
            "Ocorreu um erro ao criar a conta",
          );
        } else {
          ErrorMessage("Ocorreu um erro desconhecido.Tente novamente");
        }
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative grid h-dvh min-h-0 overflow-hidden lg:grid-cols-2">
          <HeroImageSide source="/login.png" />

          <div className="relative z-20 flex min-h-0 flex-col p-4 md:p-6">
            <div className="mx-auto w-full max-w-md text-center">
              <Stepper value={currentStep} onValueChange={setCurrentStep}>
                {steps.map((step) => (
                  <StepperItem
                    key={step}
                    step={step}
                    className="not-last:flex-1"
                    loading={isLoading}
                  >
                    <StepperTrigger asChild>
                      <StepperIndicator />
                    </StepperTrigger>
                    {step < steps.length && <StepperSeparator />}
                  </StepperItem>
                ))}
              </Stepper>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <div className="w-full max-w-md">{renderCurrentForm()}</div>

              <NavigationButtons
                currentStep={currentStep}
                totalSteps={steps.length}
                handlePrevStep={handlePrevStep}
                handleNextStep={handleNextStep}
                isLoading={isLoading || isPending}
              />

              <div className="text-sm text-center">
                Já tens uma conta?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
      <AccountCreatedModal />
    </FormProvider>
  );
}
