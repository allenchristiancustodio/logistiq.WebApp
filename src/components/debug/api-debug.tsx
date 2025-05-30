import { useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { usePing, useAuthTest } from "@/hooks/use-api";
import { toast } from "sonner";

interface TestResult {
  test: string;
  success: boolean;
  data: any;
  timestamp: string;
}

export default function ApiDebugComponent() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token, isAuthenticated } = useAuthStore();
  const { getToken } = useKindeAuth();

  const pingQuery = usePing();
  const authTestQuery = useAuthTest();

  const addTestResult = (test: string, success: boolean, data: any) => {
    setTestResults((prev) => [
      ...prev,
      {
        test,
        success,
        data,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const testApiConnectivity = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Basic API connectivity (no auth)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/test/ping`
        );
        const data = await response.json();
        addTestResult("Basic API Ping", response.ok, data);
      } catch (error: any) {
        addTestResult("Basic API Ping", false, { error: error.message });
      }

      // Test 2: Get token from Kinde
      try {
        const kindeToken = await getToken();
        addTestResult("Get Kinde Token", !!kindeToken, {
          hasToken: !!kindeToken,
          tokenPrefix: kindeToken ? kindeToken.substring(0, 20) + "..." : null,
        });

        if (kindeToken) {
          // Test 3: Authenticated API call
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/test/auth-test`,
              {
                headers: {
                  Authorization: `Bearer ${kindeToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const data = await response.json();
            addTestResult("Authenticated API Call", response.ok, data);
          } catch (error: any) {
            addTestResult("Authenticated API Call", false, {
              error: error.message,
            });
          }

          // Test 4: User creation/update
          try {
            const userResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/users/create-or-update`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${kindeToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: "test@example.com",
                  firstName: "Test",
                  lastName: "User",
                }),
              }
            );
            const userData = await userResponse.json();
            addTestResult("Create/Update User", userResponse.ok, userData);
          } catch (error: any) {
            addTestResult("Create/Update User", false, {
              error: error.message,
            });
          }

          // Test 5: Get current user
          try {
            const currentUserResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/users/me`,
              {
                headers: {
                  Authorization: `Bearer ${kindeToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const currentUserData = await currentUserResponse.json();
            addTestResult(
              "Get Current User",
              currentUserResponse.ok,
              currentUserData
            );
          } catch (error: any) {
            addTestResult("Get Current User", false, { error: error.message });
          }

          // Test 6: Get user companies
          try {
            const companiesResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/users/companies`,
              {
                headers: {
                  Authorization: `Bearer ${kindeToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const companiesData = await companiesResponse.json();
            addTestResult(
              "Get User Companies",
              companiesResponse.ok,
              companiesData
            );
          } catch (error: any) {
            addTestResult("Get User Companies", false, {
              error: error.message,
            });
          }
        }
      } catch (error: any) {
        addTestResult("Get Kinde Token", false, { error: error.message });
      }
    } catch (error: any) {
      addTestResult("API Test Error", false, { error: error.message });
    }

    setIsLoading(false);
  };

  const testSpecificEndpoint = async (
    endpoint: string,
    method: string = "GET",
    body?: any
  ) => {
    try {
      const kindeToken = await getToken();
      if (!kindeToken) {
        toast.error("No authentication token available");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${kindeToken}`,
            "Content-Type": "application/json",
          },
          ...(body && { body: JSON.stringify(body) }),
        }
      );

      const data = await response.json();
      const result = {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        data,
      };

      addTestResult(`${method} ${endpoint}`, response.ok, result);

      if (response.ok) {
        toast.success(`${method} ${endpoint} - Success`);
      } else {
        toast.error(`${method} ${endpoint} - Failed`);
      }
    } catch (error: any) {
      addTestResult(`${method} ${endpoint}`, false, { error: error.message });
      toast.error(`${method} ${endpoint} - Error: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Debug Panel</CardTitle>
        <CardDescription>
          Test API connectivity and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current State */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Current State</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">API URL:</span>
              <span className="text-gray-600">
                {import.meta.env.VITE_API_URL}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Authenticated:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Has Token:</span>
              <Badge variant={token ? "default" : "secondary"}>
                {token ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">User:</span>
              <span className="text-gray-600">{user?.fullName || "None"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Company:</span>
              <span className="text-gray-600">
                {user?.currentCompanyName || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tests */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Tests</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => pingQuery.refetch()}
              disabled={pingQuery.isFetching}
              variant="outline"
              size="sm"
            >
              {pingQuery.isFetching ? "Testing..." : "Test Ping"}
            </Button>
            <Button
              onClick={() => authTestQuery.refetch()}
              disabled={authTestQuery.isFetching || !token}
              variant="outline"
              size="sm"
            >
              {authTestQuery.isFetching ? "Testing..." : "Test Auth"}
            </Button>
          </div>

          {pingQuery.data && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              <strong>Ping Result:</strong> {JSON.stringify(pingQuery.data)}
            </div>
          )}

          {authTestQuery.data && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              <strong>Auth Test Result:</strong>{" "}
              {JSON.stringify(authTestQuery.data, null, 2)}
            </div>
          )}
        </div>

        {/* Specific Endpoint Tests */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Specific Endpoint Tests
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              onClick={() => testSpecificEndpoint("/users/me")}
              disabled={!token}
              variant="outline"
              size="sm"
            >
              GET /users/me
            </Button>
            <Button
              onClick={() => testSpecificEndpoint("/users/companies")}
              disabled={!token}
              variant="outline"
              size="sm"
            >
              GET /companies
            </Button>
            <Button
              onClick={() => testSpecificEndpoint("/companies/current")}
              disabled={!token}
              variant="outline"
              size="sm"
            >
              GET /current-company
            </Button>
            <Button
              onClick={() => testSpecificEndpoint("/products")}
              disabled={!token}
              variant="outline"
              size="sm"
            >
              GET /products
            </Button>
            <Button
              onClick={() => testSpecificEndpoint("/test/auth-test")}
              disabled={!token}
              variant="outline"
              size="sm"
            >
              GET /auth-test
            </Button>
          </div>
        </div>

        {/* Full Test Suite */}
        <div>
          <Button
            onClick={testApiConnectivity}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Running Tests..." : "Run Full API Test Suite"}
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Test Results</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.success
                      ? "bg-green-50 border-green-400"
                      : "bg-red-50 border-red-400"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {result.success ? "✅" : "❌"} {result.test}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            {/* Clear Results Button */}
            <div className="mt-4">
              <Button
                onClick={() => setTestResults([])}
                variant="outline"
                size="sm"
              >
                Clear Results
              </Button>
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Environment Info</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
            <div>
              <strong>Mode:</strong> {import.meta.env.MODE}
            </div>
            <div>
              <strong>API URL:</strong> {import.meta.env.VITE_API_URL}
            </div>
            <div>
              <strong>Kinde Domain:</strong> {import.meta.env.VITE_KINDE_DOMAIN}
            </div>
            <div>
              <strong>Client ID:</strong>{" "}
              {import.meta.env.VITE_KINDE_CLIENT_ID?.substring(0, 10)}...
            </div>
            <div>
              <strong>Redirect URI:</strong>{" "}
              {import.meta.env.VITE_KINDE_REDIRECT_URL}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
