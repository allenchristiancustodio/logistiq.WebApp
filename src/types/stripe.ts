// src/types/stripe.ts
export interface StripeCheckoutRequest {
  priceId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  organizationName: string;
  successUrl: string;
  cancelUrl: string;
  isAnnual?: boolean;
  trialDays?: number;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  sessionUrl: string;
  customerId: string;
}

export interface StripePortalRequest {
  customerId: string;
  returnUrl: string;
}

export interface StripePortalResponse {
  sessionUrl: string;
}

export interface StripePrice {
  id: string;
  productId: string;
  productName: string;
  productDescription: string;
  unitAmount: number;
  currency: string;
  interval: "month" | "year";
  intervalCount: number;
  isActive: boolean;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAt?: string;
  canceledAt?: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface BillingInfo {
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
}
