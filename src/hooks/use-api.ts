// Central API hooks index - organized by domain

// Authentication & User Management
export * from "./use-auth-api";

// Product Management
export * from "./use-products";

// Category Management
export * from "./use-categories";

// Subscription Management
export * from "./use-subscriptions";

// Subscription Limit Checking
export * from "./use-subscription-limits";

// Legacy query keys for backward compatibility
import { authQueryKeys } from "./use-auth-api";
import { productQueryKeys } from "./use-products";
import { categoryQueryKeys } from "./use-categories";
import { subscriptionQueryKeys } from "./use-subscriptions";

export const queryKeys = {
  // Legacy structure for backward compatibility
  user: authQueryKeys.user,
  currentOrganization: authQueryKeys.currentOrganization,
  products: productQueryKeys.products,
  product: productQueryKeys.product,
  ping: authQueryKeys.ping,
  authTest: authQueryKeys.authTest,

  // New organized structure
  auth: authQueryKeys,
  productKeys: productQueryKeys,
  category: categoryQueryKeys,
  subscription: subscriptionQueryKeys,
};
