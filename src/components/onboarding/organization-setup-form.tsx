import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/clerk-react";
import { Building2, Globe, Loader2 } from "lucide-react";
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

interface ComprehensiveOrganizationSetupForm {
  // Basic Information
  description?: string;
  industry?: string;

  // Contact Information
  email?: string;
  phone?: string;
  website?: string;

  // Address Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Business Details
  taxId?: string;
  businessRegistrationNumber?: string;

  // Regional Settings
  defaultCurrency: string;
  timeZone: string;
  dateFormat: string;

  // Business Preferences
  multiLocationEnabled: boolean;
}

interface OrganizationSetupFormProps {
  onSubmit: (data: ComprehensiveOrganizationSetupForm) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
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
  "Logistics & Supply Chain",
  "E-commerce",
  "Consulting",
  "Other",
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
];

const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Singapore", label: "Singapore" },
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "Singapore",
  "Netherlands",
  "Sweden",
  "Other",
];

export function OrganizationSetupForm({
  onSubmit,
  onBack,
  isLoading,
}: OrganizationSetupFormProps) {
  const { organization: clerkOrganization } = useOrganization();

  const orgForm = useForm<ComprehensiveOrganizationSetupForm>({
    defaultValues: {
      description: "",
      industry: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "United States",
      postalCode: "",
      taxId: "",
      businessRegistrationNumber: "",
      defaultCurrency: "USD",
      timeZone: "America/New_York",
      dateFormat: "MM/dd/yyyy",
      multiLocationEnabled: false,
    },
  });

  const watchedOrgValues = orgForm.watch();

  return (
    <form onSubmit={orgForm.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Tell us about {clerkOrganization?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              {...orgForm.register("description")}
              placeholder="Brief description of your business, what you do, your mission..."
              rows={4}
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={watchedOrgValues.industry}
                onValueChange={(value) => orgForm.setValue("industry", value)}
              >
                <SelectTrigger className="h-12">
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
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How can customers and partners reach you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                {...orgForm.register("email")}
                placeholder="contact@company.com"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="orgPhone">Business Phone</Label>
              <Input
                id="orgPhone"
                type="tel"
                {...orgForm.register("phone")}
                placeholder="+1 (555) 123-4567"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...orgForm.register("website")}
                placeholder="https://www.yourcompany.com"
                className="h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
          <CardDescription>
            Your business location for shipping and legal purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                {...orgForm.register("address")}
                placeholder="123 Business Street"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...orgForm.register("city")}
                placeholder="New York"
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                {...orgForm.register("state")}
                placeholder="NY"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">ZIP/Postal Code</Label>
              <Input
                id="postalCode"
                {...orgForm.register("postalCode")}
                placeholder="10001"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="addressCountry">Country</Label>
              <Select
                value={watchedOrgValues.country}
                onValueChange={(value) => orgForm.setValue("country", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Legal & Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Legal & Tax Information</CardTitle>
          <CardDescription>
            Optional business registration details for compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                {...orgForm.register("taxId")}
                placeholder="XX-XXXXXXX"
                className="h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional & System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Regional & System Preferences
          </CardTitle>
          <CardDescription>
            Configure how Logistiq displays dates, currency, and time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="defaultCurrency">Default Currency *</Label>
              <Select
                value={watchedOrgValues.defaultCurrency}
                onValueChange={(value) =>
                  orgForm.setValue("defaultCurrency", value)
                }
              >
                <SelectTrigger className="h-12">
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
              <Label htmlFor="timeZone">Time Zone *</Label>
              <Select
                value={watchedOrgValues.timeZone}
                onValueChange={(value) => orgForm.setValue("timeZone", value)}
              >
                <SelectTrigger className="h-12">
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

          <div className="border-t pt-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="multiLocationEnabled"
                checked={watchedOrgValues.multiLocationEnabled}
                onChange={(e) =>
                  orgForm.setValue("multiLocationEnabled", e.target.checked)
                }
                className="rounded h-5 w-5"
              />
              <Label htmlFor="multiLocationEnabled" className="text-base">
                Enable multi-location support (warehouses, stores, etc.)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="h-12 px-8"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 px-8 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Setting up business...
            </>
          ) : (
            "Complete Setup & Launch Logistiq"
          )}
        </Button>
      </div>
    </form>
  );
}
