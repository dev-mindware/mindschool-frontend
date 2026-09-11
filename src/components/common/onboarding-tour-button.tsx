"use client";

import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAutoOnboardingTour, useOnboardingTour } from "@/hooks/onboarding/use-onboarding-tour";
import type {
  OnboardingTourId,
  OnboardingTourMode,
} from "@/constants/onboarding-tours";

type OnboardingTourButtonProps = {
  tourId: OnboardingTourId;
  autoStart?: boolean;
  className?: string;
};

export function OnboardingTourButton({
  tourId,
  autoStart = true,
  className,
}: OnboardingTourButtonProps) {
  const { startTour, canAccessTour, tourButtonEnabled } =
    useOnboardingTour(tourId);
  const hasModeChoice = tourId === "normal-invoice" || tourId === "pos-invoice";

  useAutoOnboardingTour(tourId, autoStart);

  if (!canAccessTour || !tourButtonEnabled) return null;

  if (hasModeChoice) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 border-primary/20 bg-background/80 text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5",
              className,
            )}
          >
            <Icon name="CircleHelp" className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Ver guia</span>
            <Icon name="ChevronDown" className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Escolher tipo de guia
          </DropdownMenuLabel>
          <TourModeItem
            mode="normal"
            icon="Map"
            label="Guia normal"
            description="Explica o fluxo sem preencher campos."
            onSelect={startTour}
          />
          <TourModeItem
            mode="demo"
            icon="Sparkles"
            label="Demonstração guiada"
            description="Preenche dados de teste e limpa ao sair. Não executa acções."
            onSelect={startTour}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 border-primary/20 bg-background/80 text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5",
            className,
          )}
          onClick={() => startTour("normal")}
        >
          <Icon name="CircleHelp" className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Ver guia</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Ver guia deste fluxo</p>
      </TooltipContent>
    </Tooltip>
  );
}

type TourModeItemProps = {
  mode: OnboardingTourMode;
  icon: "Map" | "Sparkles";
  label: string;
  description: string;
  onSelect: (mode: OnboardingTourMode) => void;
};

function TourModeItem({
  mode,
  icon,
  label,
  description,
  onSelect,
}: TourModeItemProps) {
  return (
    <DropdownMenuItem
      className="items-start gap-3 py-2"
      onSelect={() => onSelect(mode)}
    >
      <Icon name={icon} className="mt-0.5 h-4 w-4 text-primary" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium leading-none">{label}</span>
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Ajuda sobre ${label}`}
          >
            <Icon name="CircleHelp" className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-56">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </DropdownMenuItem>
  );
}
