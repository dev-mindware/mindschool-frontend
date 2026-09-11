export interface DashboardSummaryItem {
  total?: number;
  amount?: number;
  insight: string;
}

export interface DashboardSummary {
  productsSold: DashboardSummaryItem;
  servicesRendered: DashboardSummaryItem;
  totalSales: DashboardSummaryItem;
  overallTotal: DashboardSummaryItem;
}

export interface RevenueEvolution {
  month: string;
  revenue: number;
}

export interface SalesDistribution {
  category: string;
  value: number;
  label: string;
}

export interface StoreBreakdown {
  storeId: string;
  storeName: string;
  totalSales: number;
  productsSold: number;
  servicesRendered: number;
}

export interface RecentSale {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "cancelled";
  itemsCount: number;
}

export interface UserContext {
  role: string;
  email: string;
}

export interface ManagerDashboardData {
  summary: DashboardSummary;
  revenueEvolution: RevenueEvolution[];
  salesDistribution: SalesDistribution[];
  recentSales: RecentSale[];
  userContext: UserContext;
}

export interface OwnerDashboardData extends ManagerDashboardData {
  storesBreakdown: StoreBreakdown[];
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Overview (Visão Geral)                                          */
/*  Contrato acordado com o backend — actualmente servido por mock.           */
/* -------------------------------------------------------------------------- */

export type DashboardPeriodType = "month" | "quarter" | "year";

export interface DashboardPeriod {
  type: DashboardPeriodType;
  label: string;
  startDate: string;
  endDate: string;
}

/** Métrica de topo: valor absoluto + variação face ao período anterior. */
export interface DashboardMetric {
  label: string;
  value: number;
  variationPercent: number;
  currency?: string;
}

export interface DashboardSummaryCards {
  revenue: DashboardMetric;
  sales: DashboardMetric;
  clients: DashboardMetric;
  stock: DashboardMetric;
}

export interface FinancialEvolutionPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DashboardFinancialEvolution {
  label: string;
  range: string;
  series: FinancialEvolutionPoint[];
}

export interface SalesTypeBreakdown {
  count: number;
  percentage: number;
  amount: number;
  currency: string;
}

export interface DashboardSalesDistribution {
  label: string;
  totalSales: number;
  products: SalesTypeBreakdown;
  services: SalesTypeBreakdown;
}

export interface DashboardClientsOverview {
  totalClients: number;
  newClientsThisMonth: number;
  newClientsVariationPercent: number;
  recurringClientsPercentage: number;
  clientsWithDebt: number;
  clientsWithDebtVariationPercent: number;
}

export type ReceivableBucketKey = "overdue" | "due_7_days" | "due_30_days";

export interface ReceivableBucket {
  key: ReceivableBucketKey;
  label: string;
  amount: number;
  percentage: number;
}

export interface DashboardAccountsReceivable {
  total: number;
  currency: string;
  buckets: ReceivableBucket[];
}

export interface DashboardStockOverview {
  stockValue: number;
  currency: string;
  normalStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export type DashboardActivityType =
  | "invoice_created"
  | "payment_received"
  | "product_added"
  | "client_added"
  | "stock_adjusted";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  title: string;
  amount: number | null;
  currency: string | null;
  createdAt: string;
  /** Referência humana do documento/entidade (ex.: "FT 00234"). */
  reference?: string;
  /** Id da entidade de origem, para navegação a partir do item. */
  entityId?: string;
}

export interface DashboardMonthlyGoal {
  target: number;
  current: number;
  percentage: number;
  remaining: number;
  currency: string;
}

export interface DashboardOverview {
  title: string;
  period: DashboardPeriod;
  summaryCards: DashboardSummaryCards;
  financialEvolution: DashboardFinancialEvolution;
  salesDistribution: DashboardSalesDistribution;
  clientsOverview: DashboardClientsOverview;
  accountsReceivable: DashboardAccountsReceivable;
  stockOverview: DashboardStockOverview;
  recentActivity: DashboardActivity[];
  monthlyGoal: DashboardMonthlyGoal;
  /** Apenas no âmbito global (OWNER). Ausente na vista de loja. */
  storesBreakdown?: StoreBreakdown[];
}
