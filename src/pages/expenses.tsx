import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ExpensesPage() {
  return (
    <PageWrapper
      title="Expenses"
      description="Track and manage business expenses"
      action={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      }
    >
      {/* Expenses content will go here */}
      <div className="text-center py-12 text-gray-500">
        Expense tracking coming soon
      </div>
    </PageWrapper>
  );
}
