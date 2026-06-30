export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inventory: number;
  initialStock: number;
  sales: number;
  rating: number;
  loyaltyExclusive?: boolean;
  pointsCost?: number; // Only for loyalty-exclusive products
}

export interface Voucher {
  id: string;
  code: string;
  amount: number;
  pointsCost: number;
  used: boolean;
  dateCreated: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discountApplied: number;
  pointsEarned: number;
  pointsRedeemed: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  joinDate: string;
  totalSpent: number;
  points: number;
  lifetimePoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  vouchers: Voucher[];
  orderHistory: Order[];
}

export interface Recommendation {
  productId: string;
  productName: string;
  reason: string;
  confidence: number; // e.g. 0.95
}

export interface CategorySales {
  category: string;
  revenue: number;
  units: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  categoryBreakdown: CategorySales[];
  dailySales: DailySales[];
  topSellingProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  lowStockItems: Product[];
}
