
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Order, MenuItem, User, CartItem, OrderStatus, PaymentStatus } from '@/lib/types';
import { menuItems as initialMenuItems, users as initialUsers, initialOrders } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface CafeContextType {
  menuItems: MenuItem[];
  users: User[];
  orders: Order[];
  cart: CartItem[];
  addToCart: (menuItemId: number) => void;
  removeFromCart: (menuItemId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (customerName: string, tableNumber: string, notes?: string) => void;
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: number, status: PaymentStatus) => void;
  clearSalesData: () => void;
  cartItemCount: number;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [menuItems] = useState<MenuItem[]>(initialMenuItems);
  const [users] = useState<User[]>(initialUsers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (menuItemId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.menuItemId === menuItemId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { menuItemId, quantity: 1 }];
    });
    const item = menuItems.find(i => i.id === menuItemId);
    toast({
        title: `${item?.name} added to order`,
        description: "You can view your full order in the cart.",
    })
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.menuItemId === menuItemId);
        if (existingItem && existingItem.quantity > 1) {
            return prevCart.map((item) =>
            item.menuItemId === menuItemId ? { ...item, quantity: item.quantity - 1 } : item
            );
        }
        return prevCart.filter((item) => item.menuItemId !== menuItemId);
    });
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const menuItem = menuItems.find((item) => item.id === cartItem.menuItemId);
      return total + (menuItem?.price || 0) * cartItem.quantity;
    }, 0);
  };

  const placeOrder = (customerName: string, tableNumber: string, notes?: string) => {
    if (cart.length === 0) {
        toast({
            variant: "destructive",
            title: "Your cart is empty",
            description: "Please add items to your cart before placing an order.",
        })
        return;
    };
    if (!customerName || !tableNumber) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter a customer name and table number.",
        });
        return;
    }

    const newOrder: Order = {
      id: orders.length + 1,
      customerName,
      tableNumber,
      items: cart.map(cartItem => {
        const menuItem = menuItems.find(item => item.id === cartItem.menuItemId)!;
        return { menuItem, quantity: cartItem.quantity };
      }),
      status: 'Received',
      timestamp: new Date().toISOString(),
      total: getCartTotal(),
      paymentStatus: 'Pending',
      notes,
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    toast({
        title: "Order Placed!",
        description: "Your order has been sent to the kitchen.",
    })
  };
  
  const updateOrderStatus = (orderId: number, status: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status, timestamp: new Date().toISOString() } : order
      )
    );
  };

  const updatePaymentStatus = (orderId: number, status: PaymentStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, paymentStatus: status } : order
      )
    );
  };

  const clearSalesData = () => {
    setOrders(prevOrders =>
      prevOrders.filter(order => {
        const isCompletedAndPaid = (order.status === 'Delivered' || order.status === 'Cancelled') && order.paymentStatus === 'Paid';
        return !isCompletedAndPaid;
      })
    );
  };

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const value = {
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
    cartItemCount,
  };

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (context === undefined) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
}
