import { EducationCycle } from "@/types/academic";

export type TuitionStatus = "PAID" | "PENDING" | "OVERDUE" | "EXEMPT";

export interface CustomEmolument {
  id: string;
  code: string;
  name: string;
  price: number;
  deliveryDays: number;
  requiresPayment: boolean;
  description?: string;
  active: boolean;
}

export interface EmailTemplateItem {
  subject: string;
  body: string;
}

export interface EmailCollectionsConfig {
  enabled: boolean;
  preDueDays: number;
  graceWarning: boolean;
  penaltyNotification: boolean;
  monthlyFollowup: boolean;
  sendHour?: string;
  templates?: {
    pre_due?: EmailTemplateItem;
    grace?: EmailTemplateItem;
    penalty?: EmailTemplateItem;
    monthly?: EmailTemplateItem;
    receipt?: EmailTemplateItem;
  };
}

export interface TuitionPlan {
  id: string;
  name: string;
  educationCycle: EducationCycle;
  classLevel: string;
  monthlyAmount: number;
  registrationFee: number;
  reEnrollmentFee: number;
  siblingsDiscountPercent: number;
  dueStartDay: number;
  dueDay: number;
  penaltyGracePeriodDays: number;
  latePenaltyType: "percentage" | "fixed";
  latePenaltyPercent: number;
  latePenaltyValue: number;
  monthlyIncreaseType: "percentage" | "fixed";
  monthlyIncreaseValue: number;
  customEmoluments: CustomEmolument[];
  emailCollections: EmailCollectionsConfig;
  academicYear: string;
  currency: "AOA";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTuitionFee {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  classSection: string;
  month: number;
  year: number;
  monthLabel: string;
  baseAmount: number;
  discountAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  dueDate: string;
  status: TuitionStatus;
  paidAt?: string;
  paymentMethod?: "MULTICAIXA" | "TRANSFER" | "CASH" | "EXPRESS";
  receiptId?: string;
  receiptNumber?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
}

export interface TuitionPaymentInput {
  studentId: string;
  feeIds: string[];
  paymentMethod: "MULTICAIXA" | "TRANSFER" | "CASH" | "EXPRESS";
  paymentReference?: string;
  amountPaid: number;
  receivedBy: string;
  notes?: string;
}

export interface TuitionFinancialSummary {
  totalExpectedAmount: number;
  totalCollectedAmount: number;
  totalPendingAmount: number;
  totalOverdueAmount: number;
  collectionRatePercent: number;
  studentsInDebtCount: number;
  studentsUpToDateCount: number;
  academicYear: string;
}
