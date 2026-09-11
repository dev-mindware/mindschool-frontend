"use client";
import { useState, useMemo } from "react";
import { Icon } from "@/components";
import { Badge } from "@/components/ui";
import { Plan } from "@/types";
import {
  formatCurrency,
  getPlanFeatures,
} from "@/utils";

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}

const MAX_VISIBLE_FEATURES = 5;

export function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const [showAll, setShowAll] = useState(false);

  const featuresList = useMemo(() => {
    return getPlanFeatures(plan);
  }, [plan]);

  const visibleFeatures = showAll
    ? featuresList
    : featuresList.slice(0, MAX_VISIBLE_FEATURES);

  const remainingCount =
    featuresList.length - MAX_VISIBLE_FEATURES;

  return (
    <div
      className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${isSelected
        ? "border-primary-500 bg-primary-50 dark:bg-primary-300/10"
        : "border-border hover:border-primary-500"
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground text-lg">
          Plano {plan.name}
        </h4>
        {isSelected && (
          <Badge className="bg-primary-500 text-white">
            Seleccionado
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold text-primary-600">
          {formatCurrency(plan.priceMonthly)}
        </div>
      </div>

      <ul className="space-y-2 mb-4 text-sm">
        {visibleFeatures.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Icon
              name="Check"
              className="h-4 w-4 text-green-600 flex-shrink-0"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {remainingCount > 0 && !showAll && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(true);
          }}
          className="text-xs text-primary-600 hover:underline"
        >
          + {remainingCount} funcionalidades
        </button>
      )}
    </div>
  );
}
