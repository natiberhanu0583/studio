export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'Food' | 'Drink' | 'Dessert';
  imageId: string;
};

export type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
};

export type OrderStatus = 'Received' | 'Sent to Chef' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export type Order = {
  id: number;
  customerName: string; 
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: string;
  total: number;
  paymentStatus: PaymentStatus;
  notes?: string;
};

export type UserRole = 'Admin' | 'Waiter' | 'Chef' | 'Customer';

export type User = {
  id: number;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
};

export type CartItem = {
  menuItemId: number;
  quantity: number;
};
