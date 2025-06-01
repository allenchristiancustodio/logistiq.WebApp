export type OnboardingStep = "profile" | "organization" | "complete";

export interface OnboardingStepInfo {
  id: OnboardingStep;
  title: string;
  description: string;
  order: number;
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "Set up your personal information and preferences",
    order: 1,
  },
  {
    id: "organization",
    title: "Organization Setup",
    description: "Configure your organization details and settings",
    order: 2,
  },
  {
    id: "complete",
    title: "Ready to Go!",
    description: "You're all set to start using Logistiq",
    order: 3,
  },
];
