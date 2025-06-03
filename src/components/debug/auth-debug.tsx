import { useAuth, useUser, useOrganization } from "@clerk/clerk-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/hooks/use-api";

export default function DebugAuth() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { organization } = useOrganization();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [rawToken, setRawToken] = useState<string>("");

  const { data: productsData } = useProducts({ page: 1, pageSize: 5 });

  const decodeJWT = (token: string) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      return decoded;
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  const handleGetToken = async () => {
    try {
      const token = await getToken({ template: "logistiq-backend" });
      setRawToken(token?.toString() || "");
      console.log("Raw Token:", rawToken);
      if (token) {
        const decoded = decodeJWT(token.toString());
        setTokenInfo({
          raw: token,
          decoded: decoded,
          length: token.length,
        });
      }
    } catch (error: unknown) {
      console.error("Failed to get token:", error);
      setTokenInfo({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testAPI = async () => {
    try {
      const token = await getToken({ template: "logistiq-backend" });

      const response = await fetch("http://localhost:5228/api/test/auth-test", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.text();
      console.log("API Test Result:", { status: response.status, result });

      if (response.ok) {
        alert("API Connection Successful!\n" + result);
      } else {
        alert(
          "API Connection Failed!\nStatus: " +
            response.status +
            "\nResponse: " +
            result
        );
      }
    } catch (error: unknown) {
      console.error("API Test Error:", error);
      alert(
        "API Test Error: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  if (!isSignedIn) {
    return <div>Please sign in to debug auth</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div>
          <h3 className="font-semibold mb-2">👤 User Info</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div>
              <strong>ID:</strong> {user?.id}
            </div>
            <div>
              <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
            </div>
            <div>
              <strong>Name:</strong> {user?.fullName}
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div>
          <h3 className="font-semibold mb-2">🏢 Organization Info</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            {organization ? (
              <>
                <div>
                  <strong>ID:</strong> {organization.id}
                </div>
                <div>
                  <strong>Name:</strong> {organization.name}
                </div>
                <div>
                  <strong>Slug:</strong> {organization.slug}
                </div>
              </>
            ) : (
              <div className="text-red-600">No organization selected</div>
            )}
          </div>
        </div>

        {/* JWT Token Testing */}
        <div>
          <h3 className="font-semibold mb-2"> JWT Token</h3>
          <div className="space-y-3">
            <Button onClick={handleGetToken}>Get JWT Token</Button>
            <Button onClick={testAPI} variant="outline">
              Test API Connection
            </Button>

            {tokenInfo && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                {tokenInfo.error ? (
                  <div className="text-red-600">
                    <strong>Error:</strong> {tokenInfo.error}
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>Token Length:</strong> {tokenInfo.length}
                    </div>
                    <div>
                      <strong>Raw Token:</strong>
                    </div>
                    <textarea
                      className="w-full h-20 text-xs bg-white p-2 border rounded"
                      value={tokenInfo.raw}
                      readOnly
                    />
                    <div>
                      <strong>Decoded Payload:</strong>
                    </div>
                    <pre className="bg-white p-2 border rounded text-xs overflow-auto">
                      {JSON.stringify(tokenInfo.decoded, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Environment Check */}
        <div>
          <h3 className="font-semibold mb-2">🌍 Environment</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div>
              <strong>API URL:</strong> {import.meta.env.VITE_API_URL}
            </div>
            <div>
              <strong>Clerk Publishable Key:</strong>{" "}
              {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...
            </div>
          </div>
        </div>

        {/* Products Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Products Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Current Org Products:</strong>{" "}
              {productsData?.totalCount || 0}
            </div>
            {productsData?.products?.slice(0, 3).map((product) => (
              <div key={product.id} className="pl-4 text-xs">
                • {product.name} (SKU: {product.sku})
              </div>
            ))}
            {(productsData?.totalCount || 0) > 3 && (
              <div className="pl-4 text-xs text-gray-500">
                ...and {(productsData?.totalCount || 0) - 3} more
              </div>
            )}
            <div className="text-red-600 text-xs mt-2">
              ⚠️ If you see products from other orgs when switching, the backend
              isn't filtering by organization ID properly.
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
