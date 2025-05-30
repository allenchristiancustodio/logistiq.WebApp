import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { type ReactNode } from "react";

interface KindeProviderWrapperProps {
  children: ReactNode;
}

export default function KindeProviderWrapper({
  children,
}: KindeProviderWrapperProps) {
  return (
    <KindeProvider
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URL}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URL}
    >
      {children}
    </KindeProvider>
  );
}
