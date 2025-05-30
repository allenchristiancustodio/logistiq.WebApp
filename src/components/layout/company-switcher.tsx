import { useNavigate } from "react-router-dom";
import { ChevronDown, Building2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useUserCompanies, useSwitchCompany } from "@/hooks/use-api";
import { toast } from "sonner";

interface CompanySwitcherProps {
  isCollapsed: boolean;
}

export default function CompanySwitcher({ isCollapsed }: CompanySwitcherProps) {
  const navigate = useNavigate();
  const { user, updateUserCompany, token, isAuthenticated } = useAuthStore();
  const { data: companies, isLoading } = useUserCompanies();
  const switchCompanyMutation = useSwitchCompany();

  const currentCompanyName = user?.currentCompanyName || "Select Company";
  const currentCompanyId = user?.currentCompanyId;

  const handleCompanySwitch = async (
    companyId: string,
    companyName: string
  ) => {
    if (companyId === currentCompanyId || switchCompanyMutation.isPending)
      return;

    try {
      console.log("Switching to company:", { companyId, companyName });

      const result = await switchCompanyMutation.mutateAsync({
        companyId,
      });

      console.log("Company switch result:", result);

      // Update auth store
      updateUserCompany(result.currentCompanyId, result.currentCompanyName);

      toast.success(`Switched to ${companyName}`);

      // Optionally reload the page to refresh company-specific data
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to switch company:", error);
      toast.error("Failed to switch company");
    }
  };

  const handleCreateNewCompany = () => {
    navigate("/onboarding");
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated || !token) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="px-3 py-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border-gray-200"
            disabled={switchCompanyMutation.isPending}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentCompanyName}
                </p>
                <p className="text-xs text-gray-500">Switch company</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          {isLoading ? (
            <DropdownMenuItem disabled>
              <div className="text-center text-sm text-gray-500">
                Loading companies...
              </div>
            </DropdownMenuItem>
          ) : (
            <>
              {/* Companies List */}
              {companies && companies.length > 0 ? (
                companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    onClick={() =>
                      handleCompanySwitch(company.id, company.name)
                    }
                    disabled={switchCompanyMutation.isPending}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500">{company.role}</p>
                      </div>
                    </div>
                    {company.id === currentCompanyId && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <div className="text-center text-sm text-gray-500">
                    No companies found
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Create New Company */}
              <DropdownMenuItem onClick={handleCreateNewCompany}>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <Plus className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Create new company
                    </p>
                    <p className="text-xs text-gray-500">
                      Set up a new organization
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
