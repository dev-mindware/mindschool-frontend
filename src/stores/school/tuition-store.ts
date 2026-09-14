import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TuitionPlan, StudentTuitionFee, TuitionFinancialSummary, TuitionStatus } from "@/types/tuition";

interface TuitionState {
  plans: TuitionPlan[];
  fees: StudentTuitionFee[];
  summary: TuitionFinancialSummary;

  // Actions
  addPlan: (plan: Omit<TuitionPlan, "id" | "createdAt" | "updatedAt">) => TuitionPlan;
  updatePlan: (id: string, data: Partial<TuitionPlan>) => void;
  deletePlan: (id: string) => void;

  registerFeePayment: (
    feeId: string,
    payment: {
      amountPaid: number;
      paymentMethod: "MULTICAIXA" | "TRANSFER" | "CASH" | "EXPRESS";
      receiptNumber?: string;
      receiptId?: string;
    }
  ) => void;

  recordCollectionNotice: (feeId: string) => void;
}

const INITIAL_PLANS: TuitionPlan[] = [
  {
    id: "plan-primario-2026",
    name: "Propina Ensino Primário (1.ª à 6.ª Classe)",
    educationCycle: "PRIMARY",
    classLevel: "1.ª à 6.ª Classe",
    monthlyAmount: 35000,
    registrationFee: 20000,
    reEnrollmentFee: 15000,
    siblingsDiscountPercent: 10,
    latePenaltyPercent: 10,
    penaltyGracePeriodDays: 5,
    academicYear: "2025/2026",
    currency: "AOA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-secundario-2026",
    name: "Propina I Ciclo do Ensino Secundário (7.ª à 9.ª Classe)",
    educationCycle: "LOWER_SECONDARY",
    classLevel: "7.ª à 9.ª Classe",
    monthlyAmount: 45000,
    registrationFee: 25000,
    reEnrollmentFee: 20000,
    siblingsDiscountPercent: 10,
    latePenaltyPercent: 10,
    penaltyGracePeriodDays: 5,
    academicYear: "2025/2026",
    currency: "AOA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-puniv-2026",
    name: "Propina II Ciclo / Pré-Universitário (10.ª à 12.ª Classe)",
    educationCycle: "UPPER_SECONDARY",
    classLevel: "10.ª à 12.ª Classe",
    monthlyAmount: 55000,
    registrationFee: 30000,
    reEnrollmentFee: 25000,
    siblingsDiscountPercent: 10,
    latePenaltyPercent: 10,
    penaltyGracePeriodDays: 5,
    academicYear: "2025/2026",
    currency: "AOA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_FEES: StudentTuitionFee[] = [
  {
    id: "fee-001",
    studentId: "student-1",
    studentName: "Manuel António Kiala",
    studentNumber: "ALU-2026-0001",
    classSection: "10.ª Classe A",
    month: 9,
    year: 2025,
    monthLabel: "Setembro",
    baseAmount: 55000,
    discountAmount: 0,
    penaltyAmount: 0,
    totalAmount: 55000,
    dueDate: "2025-09-10",
    status: "PAID",
    paidAt: "2025-09-08",
    paymentMethod: "MULTICAIXA",
    receiptNumber: "FR-2025/0091",
    guardianName: "António Kiala",
    guardianPhone: "+244 923 456 789",
  },
  {
    id: "fee-002",
    studentId: "student-1",
    studentName: "Manuel António Kiala",
    studentNumber: "ALU-2026-0001",
    classSection: "10.ª Classe A",
    month: 10,
    year: 2025,
    monthLabel: "Outubro",
    baseAmount: 55000,
    discountAmount: 0,
    penaltyAmount: 5500,
    totalAmount: 60500,
    dueDate: "2025-10-10",
    status: "OVERDUE",
    guardianName: "António Kiala",
    guardianPhone: "+244 923 456 789",
  },
];

export const useTuitionStore = create<TuitionState>()(
  persist(
    (set) => ({
      plans: INITIAL_PLANS,
      fees: INITIAL_FEES,
      summary: {
        totalExpectedAmount: 38500000,
        totalCollectedAmount: 29450000,
        totalPendingAmount: 800000,
        totalOverdueAmount: 8250000,
        collectionRatePercent: 76.5,
        studentsInDebtCount: 42,
        studentsUpToDateCount: 198,
        academicYear: "2025/2026",
      },

      addPlan: (planData) => {
        const newPlan: TuitionPlan = {
          ...planData,
          id: `plan-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ plans: [newPlan, ...state.plans] }));
        return newPlan;
      },

      updatePlan: (id, data) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        }));
      },

      registerFeePayment: (feeId, payment) => {
        set((state) => ({
          fees: state.fees.map((fee) => {
            if (fee.id !== feeId) return fee;
            return {
              ...fee,
              status: "PAID" as TuitionStatus,
              paidAt: new Date().toISOString().split("T")[0],
              paymentMethod: payment.paymentMethod,
              receiptId: payment.receiptId,
              receiptNumber: payment.receiptNumber || `FR-${Date.now()}`,
            };
          }),
        }));
      },

      recordCollectionNotice: (feeId) => {
        set((state) => ({
          fees: state.fees.map((fee) =>
            fee.id === feeId
              ? {
                  ...fee,
                  guardianPhone: fee.guardianPhone,
                }
              : fee
          ),
        }));
      },
    }),
    {
      name: "mindschool-tuition-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        plans: state.plans,
        fees: state.fees,
      }),
    }
  )
);
