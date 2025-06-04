import { CreateOrganization } from "@clerk/clerk-react";
import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OrganizationCreationStep() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Create Your Business
        </CardTitle>
        <CardDescription>
          Set up your business organization in Logistiq
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateOrganization
          skipInvitationScreen={true}
          hideSlug={false}
          afterCreateOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white w-full",
              card: "shadow-none border-0 bg-transparent p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formFieldInput:
                "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              formFieldLabel: "text-gray-700 font-medium",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
