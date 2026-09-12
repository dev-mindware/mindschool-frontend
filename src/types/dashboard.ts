import { Role } from "./auth";

/* ========================================================================== */
/*  MindSchool Educational Role-Adaptive Dashboard Contracts                  */
/* ========================================================================== */

/**
 * Supported academic period filters for the dashboard
 */
export type DashboardPeriodFilter =
  | "1_TRIMESTRE"
  | "2_TRIMESTRE"
  | "3_TRIMESTRE"
  | "ANNUAL";

/**
 * Educational cycles under the Angolan General Education System (Decreto Presidencial 424/25)
 */
export type AcademicCycle = "PRIMARY" | "CYCLE_1" | "CYCLE_2";

/**
 * Performance metrics by academic cycle
 */
export interface CyclePerformanceData {
  cycle: AcademicCycle;
  label: string;
  totalStudents: number;
  approvedCount: number;
  appealCount: number; // Em recurso / prova de exame
  failedCount: number; // Retidos / reprovados
  approvalRate: number; // Percentage 0-100
}

/**
 * Pautas closure status metrics
 */
export interface PautaStatusSummary {
  totalClasses: number;
  openPautas: number;
  submittedPautas: number;
  approvedPautas: number;
  closedPautas: number;
  closingProgressPercent: number;
}

/**
 * Teacher daily QR punch clock metrics
 */
export interface TeacherAttendanceKpi {
  totalTeachers: number;
  checkedInToday: number;
  absentToday: number;
  lateArrivals: number;
  punctualityRate: number;
  lastCheckInTime?: string;
  myStatusToday?: {
    hasCheckedIn: boolean;
    checkInTime?: string;
    plannedClassesToday: number;
    completedClassesToday: number;
  };
}

/**
 * Early dropout risk alert item (Notion 14.1 / UC-10)
 */
export interface DropoutRiskAlertItem {
  id: string;
  studentName: string;
  studentNumber: string;
  className: string;
  cycle: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  unjustifiedAbsences: number;
  failingSubjectsCount: number;
  recommendedAction: string;
}

/**
 * Secretary queue item (Certificates, admissions, and enrollments)
 */
export interface SecretaryQueueItem {
  id: string;
  title: string;
  requesterName: string;
  type: "CERTIFICATE" | "DECLARATION" | "ADMISSION_VALIDATION" | "ENROLLMENT_CONFIRMATION";
  requestedAt: string;
  status: "PENDING" | "PROCESSING" | "READY" | "REJECTED";
  urgency: "NORMAL" | "HIGH" | "URGENT";
}

/**
 * Financial tuition collection metrics (Kz)
 */
export interface TuitionFinancialKpi {
  monthName: string;
  expectedRevenueAoa: number;
  collectedRevenueAoa: number;
  collectionRatePercent: number;
  overdueStudentsCount: number;
  overdueTotalAoa: number;
  certifiedInvoicesCount: number;
  monthlyEvolution: Array<{
    month: string;
    expected: number;
    collected: number;
  }>;
}

/**
 * Student individual mini-bulletin for guardian/student portal
 */
export interface StudentSubjectGrade {
  subjectName: string;
  teacherName: string;
  mac: number; // Média de Avaliação Contínua
  cpp: number; // Prova de Professor
  ct: number;  // Classificação Trimestral
  absences: number;
  status: "APROVADO" | "ATENCAO" | "REPROVADO";
}

export interface StudentDashboardSummary {
  studentName: string;
  studentNumber: string;
  className: string;
  academicYear: string;
  generalAverage: number;
  totalAbsences: number;
  tuitionStatus: "REGULAR" | "PENDING" | "OVERDUE";
  grades: StudentSubjectGrade[];
  upcomingExams: Array<{
    title: string;
    subject: string;
    date: string;
    type: "ONLINE" | "PRESENTIAL";
  }>;
}

/**
 * Quick action link item for the dashboard toolbar
 */
export interface DashboardQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  variant?: "primary" | "secondary" | "outline" | "terracotta";
}

/**
 * Consolidated role-specific dashboard payload
 */
export interface RoleDashboardData {
  role: Role;
  period: DashboardPeriodFilter;
  kpis: Array<{
    title: string;
    value: string | number;
    description: string;
    variation?: number;
    icon: string;
    trend?: "up" | "down" | "neutral";
  }>;
  quickActions: DashboardQuickAction[];
  cyclePerformance?: CyclePerformanceData[];
  pautaStatus?: PautaStatusSummary;
  teacherAttendance?: TeacherAttendanceKpi;
  dropoutAlerts?: DropoutRiskAlertItem[];
  secretaryQueue?: SecretaryQueueItem[];
  tuitionFinancial?: TuitionFinancialKpi;
  studentSummary?: StudentDashboardSummary;
}

/* ========================================================================== */
/*  Legacy POS / Reports Dashboard Interfaces (Preserved for compatibility)    */
/* ========================================================================== */

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

export type DashboardPeriodType = "month" | "quarter" | "year";

export interface DashboardPeriod {
  type: DashboardPeriodType;
  label: string;
  startDate: string;
  endDate: string;
}

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
  reference?: string;
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
  storesBreakdown?: StoreBreakdown[];
}
