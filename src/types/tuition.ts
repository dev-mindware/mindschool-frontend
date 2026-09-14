import { EducationCycle } from "./academic";

export type TuitionStatus = "PAID" | "PENDING" | "OVERDUE" | "EXEMPT";

export interface TuitionPlan {
  id: string;
  name: string;
  educationCycle: EducationCycle;
  classLevel: string;
  monthlyAmount: number;
  registrationFee: number;
  reEnrollmentFee: number;
  siblingsDiscountPercent: number;
  latePenaltyPercent: number;
  penaltyGracePeriodDays: number;
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
