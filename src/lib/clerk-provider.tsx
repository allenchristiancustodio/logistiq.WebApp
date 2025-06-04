import { ClerkProvider } from "@clerk/clerk-react";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to your .env file!"
  );
}

export default function ClerkProviderWrapper({
  children,
}: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        baseTheme: [], // Optional: dark theme support
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          card: "shadow-xl",
        },
        variables: {
          colorPrimary: "#2563eb", // Match your blue theme
          colorTextOnPrimaryBackground: "#ffffff",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
