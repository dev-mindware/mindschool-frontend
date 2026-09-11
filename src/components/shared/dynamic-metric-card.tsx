"use client";

import { Card, CardContent, Icon } from "@/components";
import { cn } from "@/lib/utils";
import { icons } from "lucide-react";
import { MetricTrendIndicator, type MetricTrend } from "./metric-trend";

interface DynamicMetricCardProps {
    title: string | number;
    subtitle: string;
    description?: string;
    icon?: keyof typeof icons;
    variant?: "default" | "action" | "interactive";
    colors?: "default" | "destructive";
    trend?: MetricTrend;
    className?: string;
    onClick?: () => void;
}

export function DynamicMetricCard({
    title,
    subtitle,
    description,
    icon,
    variant = "default",
    colors = "default",
    trend,
    className,
    onClick,
}: DynamicMetricCardProps) {
    const isInteractive = onClick || variant === "interactive" || variant === "action";
    const isDestructive = colors === "destructive";

    return (
        <Card
            onClick={onClick}
            className={cn(
                "border shadow-none cursor-default text-foreground overflow-hidden transition-all py-2 bg-gradient-to-t from-primary/2 to-card",
                variant === "action" && (isDestructive ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40" : "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40"),
                isInteractive && "cursor-pointer active:scale-[0.98]",
                className
            )}
        >
            <CardContent className="p-3 md:p-4 flex justify-between items-start">
                <div className="flex flex-col h-full flex-1">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center gap-2">
                            <h2 className={cn(
                                "text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate",
                                variant === "action" && (isDestructive ? "text-destructive" : "text-primary")
                            )}>
                                {title}
                            </h2>
                            {icon && (
                                <div className={cn(
                                    "p-2 rounded-md shrink-0",
                                    variant === "action"
                                        ? (isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Icon name={icon as any} className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <p className={cn(
                            "text-xs sm:text-sm md:text-base text-foreground line-clamp-1",
                            variant === "action" && (isDestructive ? "text-destructive font-medium" : "text-primary font-medium")
                        )}>
                            {subtitle}
                        </p>
                    </div>
                    {trend && <MetricTrendIndicator {...trend} className="mt-1.5" />}

                    {description && (
                        <p className="text-[11px] md:text-xs text-muted-foreground w-full font-medium mt-1.5 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
