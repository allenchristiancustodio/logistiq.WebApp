import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  return (
    <PageWrapper
      title="Inventory"
      description="Track your inventory levels"
      action={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Movement
        </Button>
      }
    >
      {/* Inventory content will go here */}
      <div className="text-center py-12 text-gray-500">
        Inventory management coming soon
      </div>
    </PageWrapper>
  );
}
