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
    const titleStr = String(title ?? "");
    const titleSizeClass =
        titleStr.length > 14
            ? "text-sm sm:text-base xl:text-lg"
            : titleStr.length > 9
              ? "text-base sm:text-lg xl:text-xl"
              : "text-lg sm:text-xl xl:text-2xl";

    return (
        <Card
            onClick={onClick}
            className={cn(
                "h-full flex flex-col justify-between border shadow-none cursor-default text-foreground overflow-hidden transition-all py-0 bg-gradient-to-t from-primary/2 to-card",
                variant === "action" && (isDestructive ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40" : "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40"),
                isInteractive && "cursor-pointer active:scale-[0.98]",
                className
            )}
        >
            <CardContent className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-1.5 min-w-0">
                <div className="space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 min-w-0">
                        <h2
                            title={titleStr}
                            className={cn(
                                titleSizeClass,
                                "font-semibold tracking-tight tabular-nums min-w-0 break-words leading-tight",
                                variant === "action" && (isDestructive ? "text-destructive" : "text-primary")
                            )}
                        >
                            {title}
                        </h2>
                        {icon && (
                            <div className={cn(
                                "p-1.5 sm:p-2 rounded-xs shrink-0",
                                variant === "action"
                                    ? (isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")
                                    : "bg-muted text-muted-foreground"
                            )}>
                                <Icon name={icon} className="size-3.5 sm:size-4" />
                            </div>
                        )}
                    </div>
                    <p
                        title={subtitle}
                        className={cn(
                            "text-xs sm:text-sm text-foreground leading-snug line-clamp-2 break-words",
                            variant === "action" ? (isDestructive ? "text-destructive font-medium" : "text-primary font-medium") : "font-medium"
                        )}
                    >
                        {subtitle}
                    </p>
                </div>

                {(trend || description) && (
                    <div className="mt-auto pt-1 space-y-1 min-w-0">
                        {trend && <MetricTrendIndicator {...trend} />}
                        {description && (
                            <p
                                title={description}
                                className="text-[11px] sm:text-xs text-muted-foreground w-full font-medium leading-relaxed line-clamp-2 break-words"
                            >
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
