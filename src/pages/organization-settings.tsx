import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorMessage } from "@/components/ui/error-message";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentOrganization, useUpdateOrganization } from "@/hooks/use-api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface OrganizationUpdateForm {
  description?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  defaultCurrency?: string;
  timeZone?: string;
}

const INDUSTRIES = [
  "Technology",
  "Retail",
  "Manufacturing",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Food & Beverage",
  "Transportation",
  "Other",
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
];

const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
];

export default function OrganizationSettingsPage() {
  const { organization: clerkOrg } = useOrganization();
  const {
    data: backendOrg,
    isLoading,
    error,
    refetch,
  } = useCurrentOrganization();

  const updateOrgMutation = useUpdateOrganization();
  const [activeTab, setActiveTab] = useState("general");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<OrganizationUpdateForm>({
    defaultValues: {
      description: backendOrg?.description || "",
      industry: backendOrg?.industry || "",
      address: backendOrg?.address || "",
      phone: backendOrg?.phone || "",
      email: backendOrg?.email || "",
      website: backendOrg?.website || "",
      //   defaultCurrency: backendOrg?.currency || "USD",
      //   timeZone: backendOrg?.timezone || "UTC",
    },
  });

  const selectedIndustry = watch("industry");
  const selectedCurrency = watch("defaultCurrency");
  const selectedTimeZone = watch("timeZone");

  const onSubmit = async (data: OrganizationUpdateForm) => {
    try {
      await updateOrgMutation.mutateAsync(data);
      toast.success("Organization settings updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update organization settings");
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading organization settings..." />;
  }

  if (error) {
    return (
      <PageWrapper
        title="Organization Settings"
        description="Manage your organization"
      >
        <ErrorMessage
          title="Failed to load organization settings"
          message="There was an error loading your organization settings."
          onRetry={() => refetch()}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Organization Settings"
      description={`Manage settings for ${clerkOrg?.name}`}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your organization's basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={clerkOrg?.name || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Organization name is managed by Clerk and cannot be changed
                    here
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Brief description of your organization..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={selectedIndustry}
                      onValueChange={(value) => setValue("industry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="business@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      {...register("website")}
                      placeholder="https://www.company.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="Street address, city, state, ZIP code"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure currency and time zone preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select
                      value={selectedCurrency}
                      onValueChange={(value) =>
                        setValue("defaultCurrency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select
                      value={selectedTimeZone}
                      onValueChange={(value) => setValue("timeZone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_ZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isDirty || updateOrgMutation.isPending}
              >
                {updateOrgMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Preferences</CardTitle>
              <CardDescription>
                Configure business-specific settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Business preferences settings coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                Manage team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Member management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
