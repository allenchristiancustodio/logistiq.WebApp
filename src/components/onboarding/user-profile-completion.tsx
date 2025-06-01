// src/components/onboarding/user-profile-completion.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@clerk/clerk-react";
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
import { useCompleteUserOnboarding, useSyncUser } from "@/hooks/use-api";
import { toast } from "sonner";

interface UserProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: string;
}

interface UserProfileCompletionProps {
  onComplete?: () => void;
}

export default function UserProfileCompletion({ onComplete }: UserProfileCompletionProps) {
  const { user: clerkUser } = useUser();
  const syncUserMutation = useSyncUser();
  const completeOnboardingMutation = useCompleteUserOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfileForm>({
    defaultValues: {
      firstName: clerkUser?.firstName || "",
      lastName: clerkUser?.lastName || "",
      phone: clerkUser?.phoneNumbers[0]?.phoneNumber || "",
      preferences: "",
    },
  });

  const onSubmit = async (data: UserProfileForm) => {
    try {
      setIsLoading(true);

      // Update Clerk user first if needed
      if (clerkUser && (
        clerkUser.firstName !== data.firstName || 
        clerkUser.lastName !== data.lastName
      )) {
        await clerkUser.update({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      // Sync with backend
      await syncUserMutation.mutateAsync({
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        imageUrl: clerkUser?.imageUrl,
      });

      await completeOnboardingMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        preferences: data.preferences,
      });

      toast.success("Profile updated successfully!");
      onComplete?.();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Let's set up your profile to get started with Logistiq
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName", { required: "First name is required" })}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName", { required: "Last name is required" })}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="preferences">Preferences (Optional)</Label>
            <Textarea
              id="preferences"
              {...register("preferences")}
              placeholder="Any specific preferences or notes..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || syncUserMutation.isPending}
          >
            {isLoading || syncUserMutation.isPending ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}