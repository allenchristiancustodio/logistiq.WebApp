export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  status: string;
  createdAt: string;
}
