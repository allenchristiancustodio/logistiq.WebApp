import { useState } from "react";
import { CreateOrganization } from "@clerk/clerk-react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateOrganizationModalProps {
  children: React.ReactNode;
}

export function CreateOrganizationModal({
  children,
}: CreateOrganizationModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Organization
          </DialogTitle>
        </DialogHeader>
        <CreateOrganization
          skipInvitationScreen={true}
          hideSlug={false}
          afterCreateOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              card: "shadow-none border-0 bg-transparent p-0",
              headerTitle: "hidden", // Hide since we have our own title
              headerSubtitle: "hidden",
              formFieldInput:
                "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              formFieldLabel: "text-gray-700 font-medium",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
