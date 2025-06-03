# API Hooks Organization

This directory contains React hooks for API interactions, organized by domain for better maintainability.

## Structure

### 📁 **Domain-Specific Hook Files**

- **`use-auth-api.ts`** - Authentication, users, and organization management
- **`use-products.ts`** - Product CRUD operations and SKU checking
- **`use-categories.ts`** - Category management and hierarchy
- **`use-subscriptions.ts`** - Subscription management, plans, and Stripe integration
- **`use-subscription-limits.ts`** - Subscription limit checking and validation

### 📁 **Index File**

- **`use-api.ts`** - Re-exports all hooks for backward compatibility

## Usage

### Option 1: Import from specific domain files (Recommended)

```typescript
import { useProducts } from "@/hooks/use-products";
import { useCurrentSubscription } from "@/hooks/use-subscriptions";
import { useCurrentUser } from "@/hooks/use-auth-api";
```

### Option 2: Import from main index (Backward compatible)

```typescript
import {
  useProducts,
  useCreateProduct,
  useCurrentSubscription,
  useCurrentUser,
} from "@/hooks/use-api";
```

## Query Keys

Each domain has its own query key structure:

```typescript
import { authQueryKeys } from "@/hooks/use-auth-api";
import { productQueryKeys } from "@/hooks/use-products";
import { subscriptionQueryKeys } from "@/hooks/use-subscriptions";

// Use domain-specific keys
authQueryKeys.user;
productQueryKeys.products(orgId, params);
subscriptionQueryKeys.subscription(orgId);
```

## Hook Categories

### 🔐 **Authentication & Users** (`use-auth-api.ts`)

- `useCurrentUser()` - Get current user
- `useSyncUser()` - Sync user with backend
- `useCompleteUserOnboarding()` - Complete user onboarding
- `useUpdateUserProfile()` - Update user profile
- `useCurrentOrganization()` - Get current organization
- `useSyncOrganization()` - Sync organization
- `useCompleteOrganizationSetup()` - Complete org setup
- `useCurrentOrgId()` - Helper to get org ID

### 📦 **Products** (`use-products.ts`)

- `useProducts(params)` - List products with search/filter
- `useProduct(id)` - Get single product
- `useCreateProduct()` - Create new product
- `useUpdateProduct()` - Update existing product
- `useDeleteProduct()` - Delete product
- `useCheckSkuAvailability()` - Check if SKU is available

### 🏷️ **Categories** (`use-categories.ts`)

- `useCategories(params)` - List categories
- `useCategory(id)` - Get single category
- `useCategoryHierarchy()` - Get category tree
- `useCreateCategory()` - Create new category
- `useUpdateCategory()` - Update existing category
- `useDeleteCategory()` - Delete category

### 💳 **Subscriptions** (`use-subscriptions.ts`)

- `useCurrentSubscription()` - Get current subscription
- `useAvailablePlans()` - Get available plans
- `useSubscriptionLimits()` - Get subscription limits
- `useSubscriptionUsage()` - Get usage statistics
- `useSubscriptionFeatures()` - Get feature flags
- `useCreateTrialSubscription()` - Create trial
- `useCreatePaidSubscription()` - Create paid subscription
- `useUpdateSubscription()` - Update subscription
- `useCancelSubscription()` - Cancel subscription
- Stripe integration hooks
- Plan management hooks

### ⚡ **Subscription Limits** (`use-subscription-limits.ts`)

- `useSubscriptionLimitCheck()` - Check limits before actions

## Benefits

✅ **Better Organization** - Related hooks are grouped together  
✅ **Easier Navigation** - Find hooks by domain  
✅ **Reduced Conflicts** - Smaller files, less merge conflicts  
✅ **Better Maintainability** - Easier to modify specific domains  
✅ **Backward Compatible** - Existing imports still work  
✅ **Type Safety** - Proper TypeScript support maintained

## Migration Guide

No immediate migration required! All existing imports from `use-api.ts` continue to work.

For new code, prefer importing from specific domain files:

```typescript

// ✅ New way (recommended)
import { useProducts } from "@/hooks/use-products";
```
