import { api } from "./api";
import { SubscriptionFormData } from "@/schemas";

type Data = Pick<SubscriptionFormData, "planId" | "frequency" | "proofPayment">;

export interface SubscriptionResponse {
  id: string;
  status: string;
  trialEndsAt: any;
  periodStartsAt: string;
  periodEndsAt: string;
  canceledAt: any;
  createdAt: string;
  updatedAt: string;
  billingPeriodInMonths: number;
  paymentProvider: any;
  providerClientId: any;
  providerSubscriptionId: any;
  proofFileUrl: string;
  companyId: string;
  planId: string;
}

export const subscriptionService = {
  createSubscription: async (data: Data) => {
    return api.post<SubscriptionResponse>("/subscriptions", {
      planId: data.planId,
      frequency: data.frequency,
      proofPayment: data.proofPayment,
    });
  },
};
