// src/components/onboarding/organization-setup.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCompleteOrganizationSetup,
  useSyncOrganization,
} from "@/hooks/use-api";
import { toast } from "sonner";

interface OrganizationSetupForm {
  description?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  businessRegistrationNumber?: string;
  defaultCurrency: string;
  timeZone: string;
}

interface OrganizationSetupProps {
  onComplete?: () => void;
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
  { value: "AUD", label: "Australian Dollar (AUD)" },
];

const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
];

export default function OrganizationSetup({
  onComplete,
}: OrganizationSetupProps) {
  const { organization: clerkOrganization } = useOrganization();
  const syncOrganizationMutation = useSyncOrganization();
  const completeSetupMutation = useCompleteOrganizationSetup();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganizationSetupForm>({
    defaultValues: {
      description: "",
      industry: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      taxId: "",
      businessRegistrationNumber: "",
      defaultCurrency: "USD",
      timeZone: "UTC",
    },
  });

  const selectedIndustry = watch("industry");
  const selectedCurrency = watch("defaultCurrency");
  const selectedTimeZone = watch("timeZone");

  const onSubmit = async (data: OrganizationSetupForm) => {
    if (!clerkOrganization) {
      toast.error(
        "No organization found. Please create an organization first."
      );
      return;
    }

    try {
      setIsLoading(true);

      // Sync with backend
      await completeSetupMutation.mutateAsync({
        description: data.description,
        industry: data.industry,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        taxId: data.taxId,
        businessRegistrationNumber: data.businessRegistrationNumber,
        defaultCurrency: data.defaultCurrency,
        timeZone: data.timeZone,
        dateFormat: "MM/dd/yyyy", // Default format
        multiLocationEnabled: false, // Default value
      });

      toast.success("Organization setup completed!");
      onComplete?.();
    } catch (error: any) {
      console.error("Failed to setup organization:", error);
      toast.error("Failed to setup organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Organization Setup</CardTitle>
        <CardDescription>
          Complete your organization profile for {clerkOrganization?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

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
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  {...register("taxId")}
                  placeholder="Tax identification number"
                />
              </div>

              <div>
                <Label htmlFor="businessRegistrationNumber">
                  Registration Number (Optional)
                </Label>
                <Input
                  id="businessRegistrationNumber"
                  {...register("businessRegistrationNumber")}
                  placeholder="Business registration number"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferences</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) => setValue("defaultCurrency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
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
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || syncOrganizationMutation.isPending}
          >
            {isLoading || syncOrganizationMutation.isPending
              ? "Setting up..."
              : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
