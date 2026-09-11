"use client"
import { Button, Icon } from "@/components";
import { cn } from "@/lib/utils";

type Props = {
  totalSteps: number,
  handlePrevStep: () => void;
  handleNextStep: () => Promise<void>
  currentStep: number,
  isLoading?: boolean;
}

export function NavigationButtons({
  totalSteps,
  currentStep,
  handleNextStep,
  handlePrevStep,
  isLoading,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-5">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          className="w-32"
          disabled={isLoading}
        >
          Voltar
        </Button>
      )}

      {currentStep < totalSteps && (
        <Button
          type="button"
          variant="outline"
          onClick={handleNextStep}
          className="w-32"
          disabled={isLoading}
        >
          Próximo
        </Button>
      )}

      {currentStep === totalSteps && (
        <Button
          type="submit"
          className={cn(
            "w-32 bg-primary text-white disabled:bg-primary/80 disabled:cursor-not-allowed"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icon name="LoaderCircle" className="w-5 h-5 animate-spin" />
          ) : (
            "Criar conta"
          )}
        </Button>
      )}
    </div>
  );
}


