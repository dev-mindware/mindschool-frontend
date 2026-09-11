import { z } from "zod";
import { FileSchema } from "./helps";

export const FeaturesSchema = z.object({
  hasPOS: z.boolean(),
  hasGestAI: z.boolean(),
  canExportSaft: z.boolean(),
  hasStockManagement: z.boolean(),
  hasAdvancedReporting: z.boolean(),
  hasSupplierManagement: z.boolean(),
  hasSimplifiedReporting: z.boolean(),
});

const PlanSchema = z.object({
  id: z.string().trim().optional(),
  name: z.enum(["Base", "Pro", "Smart"]),
  priceMonthly: z.string().trim(),
  isPublic: z.boolean(),
  createdAt: z.string().trim(),
  updatedAt: z.string().trim(),
  maxUsers: z.number(),
  maxStores: z.number(),
  billingIntervals: z.any(),
  features: FeaturesSchema,
});

export const subscriptionSchema = z.object({
  status: z.string().trim().optional(),
  companyId: z.string().trim().optional(),

  planId: z.string().trim(),
  frequency: z.enum(["MONTHLY", "ANNUAL"]),
  proofPayment: FileSchema.nullable(),

  periodStartsAt: z.string().trim().datetime().optional(),
  periodEndsAt: z.string().trim().datetime().optional(),
  canceledAt: z.string().trim().datetime().nullable().optional(),

  paymentProvider: z.string().trim().optional(),
  providerClientId: z.string().trim().optional(),
  providerSubscriptionId: z.string().trim().optional(),

  plan: z.any().optional(),
  name: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
