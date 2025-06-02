import { useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/clerk-react";
import { Building2, Plus, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateOrganizationModal } from "./create-organization-modal";

export function OrganizationSwitcher() {
  const { organization: currentOrg } = useOrganization();
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const [isSwitching, setIsSwitching] = useState(false);

  // Get organizations from user memberships
  const organizations =
    userMemberships.data?.map((membership) => membership.organization) || [];
  const organizationCount = organizations.length;

  const handleSwitchOrganization = async (orgId: string) => {
    if (orgId === currentOrg?.id) return;

    try {
      setIsSwitching(true);
      if (setActive) {
        await setActive({ organization: orgId });
      }
      // The auth router will handle the rest (clearing cache, etc.)
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isLoaded || !currentOrg) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
        <div className="flex-1 min-w-0">
          <div className="w-24 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 w-full justify-between"
          disabled={isSwitching}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentOrg.name}
              </p>
              <p className="text-xs text-gray-500">
                {organizationCount} organization
                {organizationCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Current Organization */}
        <DropdownMenuItem className="flex items-center space-x-3 p-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Building2 className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentOrg.name}</p>
            <p className="text-xs text-gray-500">Current organization</p>
          </div>
          <Check className="w-4 h-4 text-blue-600" />
        </DropdownMenuItem>

        {/* Other Organizations */}
        {organizations
          .filter((org) => org.id !== currentOrg.id)
          .map((org) => (
            <DropdownMenuItem
              key={org.id}
              className="flex items-center space-x-3 p-2 cursor-pointer"
              onClick={() => handleSwitchOrganization(org.id)}
            >
              <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{org.name}</p>
                <p className="text-xs text-gray-500">
                  Switch to this organization
                </p>
              </div>
            </DropdownMenuItem>
          ))}

        <DropdownMenuSeparator />

        {/* Create New Organization */}
        <CreateOrganizationModal>
          <DropdownMenuItem
            className="flex items-center space-x-3 p-2 cursor-pointer text-blue-600"
            onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
          >
            <div className="w-6 h-6 border-2 border-dashed border-blue-300 rounded flex items-center justify-center">
              <Plus className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Create organization</p>
              <p className="text-xs text-gray-500">Start a new organization</p>
            </div>
          </DropdownMenuItem>
        </CreateOrganizationModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
