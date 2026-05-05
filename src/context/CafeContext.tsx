// app/cafe-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { CartItem, OrderStatus, PaymentStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/lib/notifications';

// SERVER ACTIONS
import {
  getMenuItems,
  getOrders,
  createOrder,
  updateOrderStatus as serverUpdateOrderStatus,
  updatePaymentStatus as serverUpdatePaymentStatus,
  clearCompletedOrders,
  toggleMenuItemAvailability,
  getUsers,
} from '@/app/actions';

type UsersType = Awaited<ReturnType<typeof getUsers>>;
type MenuItemsType = Awaited<ReturnType<typeof getMenuItems>>;
type OrdersType = Awaited<ReturnType<typeof getOrders>>;

interface CafeContextType {
  menuItems: MenuItemsType;
  users: UsersType;
  orders: OrdersType;
  cart: CartItem[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (name: string, table: string, notes?: string) => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (id: number, status: PaymentStatus) => Promise<void>;
  clearSalesData: () => Promise<void>;
  toggleMenuItem: (id: number, available: boolean) => Promise<void>;
  cartItemCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'admin';

  const [menuItems, setMenuItems] = useState<MenuItemsType>([]);
  const [users, setUsers] = useState<UsersType>([]);
  const [orders, setOrders] = useState<OrdersType>([]);
  const prevOrdersRef = React.useRef<OrdersType>([]); // Use Ref to avoid closure issues in interval
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const menu = await getMenuItems(userRole);
      const orderList = await getOrders();
      const prevOrders = prevOrdersRef.current;

      // NOTIFICATION LOGIC (Only trigger if order count actually increased)
      if (!isInitial && prevOrders.length > 0 && orderList.length > prevOrders.length) {
         playNotificationSound('order');
         toast({ title: "New Order Received!", description: "A customer just placed a new order." });
      }

      if (!isInitial && prevOrders.length > 0) {
        orderList.forEach(order => {
          const prev = prevOrders.find(p => p.id === order.id);
          if (prev && prev.status !== order.status) {
            if (order.status === 'Ready') {
              playNotificationSound('ready');
              toast({ title: `Order #${order.id} is Ready!`, description: `Table ${order.tableNumber} is waiting for pickup.` });
            }
            if (order.status === 'Completed') {
              playNotificationSound('paid');
              toast({ title: `Order #${order.id} Paid!`, description: `Revenue updated in Sales Report.` });
            }
          }
        });
      }

      setMenuItems(menu);
      setOrders(orderList);
      prevOrdersRef.current = orderList; // Update ref for next poll

      if (userRole?.toLowerCase() === 'admin') {
        try {
          const userList = await getUsers();
          setUsers(userList);
        } catch {
          setUsers([]);
        }
      }
    } catch (err) {
      console.error('fetchAll error:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
    const interval = setInterval(() => fetchAll(false), 1500); 
    return () => clearInterval(interval);
  }, [userRole]); // Refetch if role changes

  const refetch = async () => {
    await fetchAll(false);
  };

  // CART LOGIC
  const addToCart = (id: number) => {
    setCart(prev => {
      const exists = prev.find(i => i.menuItemId === id);
      return exists
        ? prev.map(i => i.menuItemId === id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { menuItemId: id, quantity: 1 }];
    });
    const item = menuItems.find(i => i.id === id);
    toast({ title: `${item?.name} added to tray` });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const exists = prev.find(i => i.menuItemId === id);
      if (!exists) return prev;
      if (exists.quantity === 1) return prev.filter(i => i.menuItemId !== id);
      return prev.map(i => i.menuItemId === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => cart.reduce((sum, c) => {
    const item = menuItems.find(m => m.id === c.menuItemId);
    return sum + (item?.price || 0) * c.quantity;
  }, 0);

  const placeOrder = async (name: string, table: string, notes?: string) => {
    if (cart.length === 0) return;
    try {
      await createOrder({
        customerName: name,
        tableNumber: table,
        notes,
        items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        total: getCartTotal(),
      });
      clearCart();
      await refetch();
      // CartDisplay handles the sound for the person placing it
    } catch {
      toast({ variant: 'destructive', title: 'Failed to place order' });
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    // OPTIMISTIC UPDATE
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

    try {
      await serverUpdateOrderStatus(orderId, status);
      // refetch in background to sync
      fetchAll(false);
    } catch {
      setOrders(originalOrders); // Revert on failure
      toast({ variant: 'destructive', title: 'Status update failed' });
    }
  };

  const updatePaymentStatus = async (orderId: number, status: PaymentStatus) => {
    // OPTIMISTIC UPDATE
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));

    try {
      await serverUpdatePaymentStatus(orderId, status);
      fetchAll(false);
    } catch {
      setOrders(originalOrders);
      toast({ variant: 'destructive', title: 'Payment update failed' });
    }
  };

  const clearSalesData = async () => {
    try {
      await clearCompletedOrders();
      await fetchAll(false);
      toast({ title: 'System records cleared' });
    } catch {
      toast({ variant: 'destructive', title: 'Clear failed' });
    }
  };

  const toggleMenuItem = async (id: number, available: boolean) => {
    // OPTIMISTIC UPDATE
    const originalMenu = [...menuItems];
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isAvailable: available } : m));

    try {
      await toggleMenuItemAvailability(id, available);
      fetchAll(false);
      toast({ title: available ? 'Item back online' : 'Item hidden from menu' });
    } catch (err: any) {
      setMenuItems(originalMenu);
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const cartItemCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart]);

  const value: CafeContextType = {
    menuItems,
    users,
    orders,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    updateOrderStatus,
    updatePaymentStatus,
    clearSalesData,
    toggleMenuItem,
    cartItemCount,
    loading,
    refetch,
  };

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export const useCafe = () => {
  const ctx = useContext(CafeContext);
  if (!ctx) throw new Error('useCafe must be inside CafeProvider');
  return ctx;
};