import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper } from "@/components/layout/page-wrapper";
import SubscriptionDebug from "@/components/debug/subscription-debug";
import DebugAuth from "@/components/debug/auth-debug";
import { SubscriptionApiDebug } from "@/components/debug/subscription-api-debug";

export default function DebugPage() {
  return (
    <PageWrapper title="Debug Tools" description="Development debug tools">
      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="api">API Raw</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <SubscriptionDebug />
        </TabsContent>

        <TabsContent value="api">
          <SubscriptionApiDebug />
        </TabsContent>

        <TabsContent value="auth">
          <DebugAuth />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
