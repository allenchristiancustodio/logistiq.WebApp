// import ApiDebugComponent from "@/components/debug/api-debug";

import DebugAuth from "@/components/debug/auth-debug";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your Logistiq dashboard</p>
      </div>

      <DebugAuth />
    </div>
  );
}
