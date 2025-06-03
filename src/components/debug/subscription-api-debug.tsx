import { useCurrentSubscription } from "@/hooks/use-subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubscriptionApiDebug() {
  const { data: subscription, isLoading, error } = useCurrentSubscription();

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Subscription API Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">API Status</h4>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div>
              <strong>Loading:</strong> {isLoading ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Error:</strong>{" "}
              {error ? `❌ ${error.message}` : "✅ None"}
            </div>
            <div>
              <strong>Has Data:</strong> {subscription ? "✅ Yes" : "❌ No"}
            </div>
          </div>
        </div>

        {subscription && (
          <div>
            <h4 className="font-semibold mb-2">Raw Subscription Data</h4>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
              <pre>{JSON.stringify(subscription, null, 2)}</pre>
            </div>
          </div>
        )}

        {subscription && (
          <div>
            <h4 className="font-semibold mb-2">Key Properties Check</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <strong>planName:</strong>
                <div className="mt-1">
                  Value: <code>{JSON.stringify(subscription.planName)}</code>
                </div>
                <div>
                  Type: <code>{typeof subscription.planName}</code>
                </div>
                <div>Exists: {subscription.planName ? "✅" : "❌"}</div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <strong>isTrialActive:</strong>
                <div className="mt-1">
                  Value:{" "}
                  <code>{JSON.stringify(subscription.isTrialActive)}</code>
                </div>
                <div>
                  Type: <code>{typeof subscription.isTrialActive}</code>
                </div>
                <div>
                  Exists:{" "}
                  {subscription.isTrialActive !== undefined ? "✅" : "❌"}
                </div>
              </div>
            </div>
          </div>
        )}

        {subscription && (
          <div>
            <h4 className="font-semibold mb-2">All Properties</h4>
            <div className="bg-gray-50 p-3 rounded text-xs">
              {Object.keys(subscription).map((key) => (
                <div key={key} className="mb-1">
                  <strong>{key}:</strong>{" "}
                  {JSON.stringify((subscription as any)[key])}
                </div>
              ))}
            </div>
          </div>
        )}

        {!subscription && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h4 className="font-semibold text-red-900 mb-2">
              No Subscription Data
            </h4>
            <p className="text-red-700">
              The API returned no subscription data. This could mean:
            </p>
            <ul className="list-disc ml-6 mt-2 text-red-700">
              <li>No subscription exists for this organization</li>
              <li>The API endpoint is not working correctly</li>
              <li>There's an authentication/authorization issue</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
