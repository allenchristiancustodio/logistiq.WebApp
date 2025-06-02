import { useForm } from "react-hook-form";
import { useUser } from "@clerk/clerk-react";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: string;
}

interface UserProfileFormProps {
  onSubmit: (data: UserProfileForm) => Promise<void>;
  isLoading: boolean;
}

export function UserProfileFormComponent({
  onSubmit,
  isLoading,
}: UserProfileFormProps) {
  const { user: clerkUser } = useUser();

  const userForm = useForm<UserProfileForm>({
    defaultValues: {
      firstName: clerkUser?.firstName || "",
      lastName: clerkUser?.lastName || "",
      phone: clerkUser?.phoneNumbers[0]?.phoneNumber || "",
      preferences: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Set up your personal information for Logistiq
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...userForm.register("firstName", {
                  required: "First name is required",
                })}
                placeholder="John"
                className="h-12"
              />
              {userForm.formState.errors.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {userForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...userForm.register("lastName", {
                  required: "Last name is required",
                })}
                placeholder="Doe"
                className="h-12"
              />
              {userForm.formState.errors.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {userForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...userForm.register("phone")}
                placeholder="+1 (555) 123-4567"
                className="h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferences">Notes & Preferences</Label>
            <Textarea
              id="preferences"
              {...userForm.register("preferences")}
              placeholder="Any specific preferences, role, or notes about your account..."
              rows={4}
              className="text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Saving Profile...
              </>
            ) : (
              "Complete Profile & Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
