import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";

export function CreateOrganizationPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Organization</CardTitle>
          <CardDescription>
            To get started with Logistiq, you need to create an organization for
            your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-left space-y-2">
            <h4 className="text-sm font-medium">
              Your organization will allow you to:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manage your product inventory</li>
              <li>• Track orders and sales</li>
              <li>• Collaborate with team members</li>
              <li>• Generate reports and analytics</li>
            </ul>
          </div>

          <CreateOrganizationModal>
            <Button className="w-full" size="lg">
              <Building2 className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </CreateOrganizationModal>

          <p className="text-xs text-gray-500">
            You can always create additional organizations later
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
