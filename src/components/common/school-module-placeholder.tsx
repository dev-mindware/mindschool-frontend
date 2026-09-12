import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
  CardContent,
  Icon,
  Button,
  TitleList,
  Input,
  Badge,
  DynamicMetricCard,
} from "@/components";
import type { icons } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface ModuleStat {
  label?: string;
  value?: string | number;
  title?: string | number;
  subtitle?: string;
  subtext?: string;
  description?: string;
  trend?: {
    percent: number;
    label?: string;
  };
  variant?: "default" | "action" | "interactive";
  colors?: "default" | "destructive";
  icon?: keyof typeof icons;
}

interface SchoolModulePlaceholderProps {
  title: string;
  subtitle: string;
  icon: keyof typeof icons;
  description: string;
  badge?: string;
  actionText?: string;
  actionHref?: string;
  primaryActionLabel?: string;
  primaryActionIcon?: keyof typeof icons;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: keyof typeof icons;
  onSecondaryAction?: () => void;
  stats?: ModuleStat[];
  children?: React.ReactNode;
}

export function SchoolModulePlaceholder({
  title,
  subtitle,
  icon,
  description,
  badge = "MindSchool",
  actionText,
  actionHref,
  primaryActionLabel,
  primaryActionIcon = "Plus",
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionIcon = "Download",
  onSecondaryAction,
  stats,
  children,
}: SchoolModulePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* MindGest Standard TitleList */}
      <TitleList title={title} suTitle={subtitle}>
        <div className="flex items-center gap-2">
          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
              className="gap-1.5 h-9"
            >
              <Icon name={secondaryActionIcon} className="w-4 h-4 text-muted-foreground" />
              <span>{secondaryActionLabel}</span>
            </Button>
          )}

          {primaryActionLabel && (
            <Button
              size="sm"
              onClick={onPrimaryAction}
              className="gap-1.5 h-9 shadow-xs"
            >
              <Icon name={primaryActionIcon} className="w-4 h-4" />
              <span>{primaryActionLabel}</span>
            </Button>
          )}

          {actionHref && !primaryActionLabel && (
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link href={actionHref}>{actionText || "Voltar ao Dashboard"}</Link>
            </Button>
          )}
        </div>
      </TitleList>

      {/* KPI Summary Cards using Dashboard's DynamicMetricCard */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 @5xl/main:grid-cols-4">
          {stats.map((stat, i) => (
            <DynamicMetricCard
              key={i}
              title={stat.title ?? stat.value ?? 0}
              subtitle={stat.subtitle ?? stat.label ?? ""}
              description={stat.description ?? stat.subtext}
              icon={stat.icon}
              trend={stat.trend}
              variant={stat.variant}
              colors={stat.colors}
            />
          ))}
        </div>
      )}

      {/* Filter / Search Bar (Standard MindGest Pattern) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon
            name="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder={`Pesquisar em ${title}...`}
            className="pl-9 bg-card border-border/80"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="outline" className="px-2.5 py-1 text-xs font-normal border-border/80">
            Ano Lectivo: 2026
          </Badge>
          <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium">
            {badge}
          </Badge>
        </div>
      </div>

      {/* Main Module Content */}
      {children ? (
        children
      ) : (
        <Card className="border-border/80 bg-card p-8 text-center flex flex-col items-center justify-center min-h-[320px] shadow-xs">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
            <Icon name={icon} className="size-7" />
          </div>
          <CardTitle className="text-xl font-bold mb-2 text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="max-w-lg text-sm text-muted-foreground leading-relaxed mb-6">
            {description}
          </CardDescription>
          {primaryActionLabel && (
            <Button onClick={onPrimaryAction} className="gap-2">
              <Icon name={primaryActionIcon} className="w-4 h-4" />
              {primaryActionLabel}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
