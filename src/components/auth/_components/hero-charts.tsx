"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TrendingUp, Package, DollarSign, ArrowUpRight } from "lucide-react";

// --- Mock Data ---

const billingData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
  { month: "Jul", revenue: 3490 },
];

const stockData = [
  { category: "Eletrônicos", qty: 400, fill: "var(--primary)" },
  { category: "Escritório", qty: 300, fill: "var(--primary-400)" },
  { category: "Limpeza", qty: 200, fill: "var(--primary-600)" },
  { category: "Outros", qty: 150, fill: "var(--primary-800)" },
];

const pieData = [
  { name: "Vendas", value: 400, fill: "var(--primary)" },
  { name: "Serviços", value: 300, fill: "var(--primary-400)" },
  { name: "Outros", value: 200, fill: "var(--primary-700)" },
];

const radarData = [
  { subject: "Eficiência", A: 120, fullMark: 150 },
  { subject: "Vendas", A: 98, fullMark: 150 },
  { subject: "Stock", A: 86, fullMark: 150 },
  { subject: "Clientes", A: 99, fullMark: 150 },
  { subject: "Suporte", A: 85, fullMark: 150 },
];

// --- Styles ---

const glassClasses =
  "backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden";

// --- Components ---

export function GlassWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(glassClasses, className)}>{children}</div>;
}

const billingConfig = {
  revenue: {
    label: "Facturação",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function HeroBillingChart() {
  return (
    <GlassWrapper className="p-4 w-72 h-48 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Facturação semestral
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">$42,500</h3>
            <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-2 h-2" /> +12%
            </span>
          </div>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="h-24 w-full">
        <ChartContainer config={billingConfig}>
          <AreaChart data={billingData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.3}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </GlassWrapper>
  );
}

const stockConfig = {
  qty: {
    label: "Quantidade",
    color: "#a855f7",
  },
} satisfies ChartConfig;

export function HeroStockChart() {
  return (
    <GlassWrapper className="p-4 w-64 h-56 animate-in fade-in slide-in-from-left-4 duration-1000">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-primary" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Gestão de Stock
        </p>
      </div>
      <div className="h-32 w-full">
        <ChartContainer config={stockConfig}>
          <BarChart data={stockData}>
            <Bar
              dataKey="qty"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>Resumo de inventário ativo</span>
        <TrendingUp className="w-3 h-3 text-green-500" />
      </div>
    </GlassWrapper>
  );
}

export function HeroPieChart() {
  return (
    <GlassWrapper className="p-4 w-56 h-56 animate-in fade-in slide-in-from-right-4 duration-1000">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 text-center">
        Distribuição de Receita
      </p>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassWrapper>
  );
}

export function HeroRadarChart() {
  return (
    <GlassWrapper className="p-4 w-64 h-64 animate-in fade-in zoom-in-90 duration-1000">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 text-center">
        Performance Global
      </p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            />
            <Radar
              name="Mindgest"
              dataKey="A"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassWrapper>
  );
}

export function HeroStatsWidget({
  icon: Icon,
  label,
  value,
  trend,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  trend: string;
  delay: string;
}) {
  return (
    <GlassWrapper
      className={cn(
        "p-4 w-44 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-700",
        delay,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="p-1.5 bg-white/10 rounded-md">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] text-green-400 font-medium">{trend}</span>
      </div>
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-tight">
          {label}
        </p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </GlassWrapper>
  );
}
