import { useForm } from "react-hook-form";
import { useUser } from "@clerk/clerk-react";
import { User, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

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
  const { user: storeUser } = useAuthStore();
  const [preferenceTags, setPreferenceTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Parse existing preferences from store data
  useEffect(() => {
    if (storeUser?.preferences) {
      // Split comma-separated preferences into tags
      const existingTags = storeUser.preferences
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      setPreferenceTags(existingTags);
    }
  }, [storeUser?.preferences]);

  const userForm = useForm<UserProfileForm>({
    defaultValues: {
      firstName: storeUser?.firstName || clerkUser?.firstName || "",
      lastName: storeUser?.lastName || clerkUser?.lastName || "",
      phone: storeUser?.phone || clerkUser?.phoneNumbers[0]?.phoneNumber || "",
      preferences: storeUser?.preferences || "",
    },
  });

  // Update form values when store data changes
  useEffect(() => {
    if (storeUser) {
      userForm.reset({
        firstName: storeUser.firstName || clerkUser?.firstName || "",
        lastName: storeUser.lastName || clerkUser?.lastName || "",
        phone: storeUser.phone || clerkUser?.phoneNumbers[0]?.phoneNumber || "",
        preferences: storeUser.preferences || "",
      });
    }
  }, [storeUser, clerkUser, userForm]);

  const addTag = () => {
    if (currentTag.trim() && !preferenceTags.includes(currentTag.trim())) {
      const newTags = [...preferenceTags, currentTag.trim()];
      setPreferenceTags(newTags);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPreferenceTags(preferenceTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (data: UserProfileForm) => {
    // Option 1: Convert tags to comma-separated string for backend
    const processedData: UserProfileForm = {
      ...data,
      preferences:
        preferenceTags.length > 0 ? preferenceTags.join(", ") : undefined,
    };

    // Option 2: If backend prefers JSON format, use this instead:
    // const processedData = {
    //   ...data,
    //   preferences: preferenceTags.length > 0 ? JSON.stringify({
    //     tags: preferenceTags,
    //     role: data.role || 'User',
    //     notifications: true
    //   }) : undefined
    // };

    await onSubmit(processedData);
  };

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
        <form
          onSubmit={userForm.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
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
            <Label htmlFor="preferences">Preferences & Interests</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a preference (e.g., Admin Role, Manager, Notifications)"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {preferenceTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferenceTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Add tags for your role, responsibilities, or preferences. Press
                Enter or click + to add.
              </p>
            </div>
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
