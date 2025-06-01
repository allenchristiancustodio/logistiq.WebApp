// src/hooks/use-organization-sync.ts - Special hook for organization syncing
import { useState } from "react";
import { useOrganization, useAuth } from "@clerk/clerk-react";
import { useSyncOrganization } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";

export function useOrganizationSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { organization: clerkOrganization } = useOrganization();
  const { getToken } = useAuth();
  const syncOrganizationMutation = useSyncOrganization();
  const { setOrganization } = useAuthStore();

  const checkAndSyncOrganization = async () => {
    if (!clerkOrganization) {
      throw new Error("No organization found in Clerk");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if JWT has organization context
      const token = await getToken({ template: "logistiq-backend" });
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const orgId = payload.org_id;

        console.log("JWT org_id check:", orgId);

        // If JWT doesn't have org context, we need to wait/retry
        if (!orgId || orgId.includes("{{") || orgId === "{{org.id}}") {
          throw new Error(
            "Organization context not yet available in JWT. Please try again in a moment."
          );
        }
      }

      // Proceed with sync
      const orgResult = await syncOrganizationMutation.mutateAsync({
        name: clerkOrganization.name,
        slug: clerkOrganization.slug || undefined,
        imageUrl: clerkOrganization.imageUrl || undefined,
      });

      setOrganization(orgResult);
      return orgResult;
    } catch (err: any) {
      console.error("Organization sync failed:", err);
      setError(err.message || "Failed to sync organization");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncOrganization: checkAndSyncOrganization,
    isLoading,
    error,
  };
}
