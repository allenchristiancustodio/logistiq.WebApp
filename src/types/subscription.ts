// src/types/subscription.ts
export interface Subscription {
  id: string;
  clerkOrganizationId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  planName: string;
  monthlyPrice: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  isTrialActive: boolean;
  daysRemaining: number;
  isExpired: boolean;

  // Plan Limits
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  maxWarehouses: number;
  hasAdvancedReporting: boolean;
  hasReporting: boolean;
  hasInvoicing: boolean;

  // Current Usage
  currentUsers: number;
  currentProducts: number;
  currentOrders: number;
  currentWarehouses: number;

  createdAt: string;
  updatedAt?: string;
}

export enum SubscriptionStatus {
  Trial = "Trial",
  Active = "Active",
  PastDue = "PastDue",
  Cancelled = "Cancelled",
  Suspended = "Suspended",
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isPopular?: boolean;
  features: string[];
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  maxWarehouses: number;
  hasAdvancedReporting: boolean;
  hasReporting: boolean;
  hasInvoicing: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

export interface SubscriptionUsage {
  currentUsers: number;
  currentProducts: number;
  currentOrders: number;
  currentWarehouses: number;
  limits: SubscriptionLimits;
  usageMetrics: Record<string, UsageMetric>;
}

export interface SubscriptionLimits {
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  maxWarehouses: number;
  hasAdvancedReporting: boolean;
  hasReporting: boolean;
  hasInvoicing: boolean;
}

export interface UsageMetric {
  current: number;
  limit: number;
  percentageUsed: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
}

export interface CreateTrialSubscriptionRequest {
  planName?: string;
  trialDays?: number;
}

export interface CreatePaidSubscriptionRequest {
  planName: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  monthlyPrice: number;
  trialEndDate?: string;
}

export enum SubscriptionLimitType {
  Users = "Users",
  Products = "Products",
  Orders = "Orders",
  Warehouses = "Warehouses",
}
