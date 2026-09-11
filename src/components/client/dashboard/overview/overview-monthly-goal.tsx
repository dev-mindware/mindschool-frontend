"use client";

import { Card, CardContent, CardHeader, CardTitle, Icon } from "@/components";
import { formatCurrencyCompact } from "@/utils/format-currency";
import type { DashboardMonthlyGoal } from "@/types";

interface OverviewMonthlyGoalProps {
    goal: DashboardMonthlyGoal;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OverviewMonthlyGoal({ goal }: OverviewMonthlyGoalProps) {
    const percentage = Math.min(Math.max(goal.percentage, 0), 100);
    const reached = goal.remaining <= 0;

    return (
        <Card className="flex h-full flex-col gap-0 py-4">
            <CardHeader className="px-4 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon name="Trophy" className="size-4" />
                    </span>
                    Meta do Período
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 items-center gap-4 px-4">
                <div className="relative size-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                        <circle
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            className="fill-none stroke-muted"
                            strokeWidth={10}
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700"
                            strokeWidth={10}
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={CIRCUMFERENCE * (1 - percentage / 100)}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {percentage}%
                    </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-lg font-bold tracking-tight">
                        {formatCurrencyCompact(goal.current, goal.currency)}
                        <span className="text-sm font-normal text-muted-foreground">
                            {" "}
                            / {formatCurrencyCompact(goal.target, goal.currency)}
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {reached
                            ? "Meta atingida. Parabéns!"
                            : `Faltam ${formatCurrencyCompact(
                                goal.remaining,
                                goal.currency
                            )} para atingir a meta`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
