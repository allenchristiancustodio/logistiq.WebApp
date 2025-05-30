import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateCompany } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const companySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
  address: z
    .string()
    .max(500, "Address must not exceed 500 characters")
    .optional(),
  phone: z.string().max(20, "Phone must not exceed 20 characters").optional(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please provide a valid website URL")
    .optional()
    .or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser, token } = useAuthStore();
  const createCompanyMutation = useCreateCompany();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      console.log("Creating company with data:", data);

      const result = await createCompanyMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
      });

      console.log("Company creation result:", result);

      // Update the user state to reflect they now have an active company
      if (user && token) {
        setUser(
          {
            ...user,
            hasActiveCompany: true,
            currentCompanyId: result.id,
            currentCompanyName: result.name,
          },
          token
        );
      }

      toast.success(`Company "${result.name}" created successfully!`);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to create company:", error);
      toast.error(
        error.message || "Failed to create company. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Logistiq!
            </h1>
            <p className="text-gray-600">
              Let's set up your company to get started with inventory management
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of your company (optional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="company@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Business St, City, State 12345"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.yourcompany.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createCompanyMutation.isPending}
                className="w-full flex items-center justify-center px-6 py-4 text-base font-medium"
              >
                {createCompanyMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Creating Company...
                  </>
                ) : (
                  <>
                    Create Company & Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              You can update this information later in your company settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
