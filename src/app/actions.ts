// src/app/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { OrderStatus, PaymentStatus, MenuItem } from '@/lib/types';

// ------------------------------------------------------------------
// Helper: get logged-in user + role
// ------------------------------------------------------------------
async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}

// ------------------------------------------------------------------
// 1. MENU & USERS (public)
// ------------------------------------------------------------------
export async function getMenuItems(): Promise<MenuItem[]> {
  const rows = await prisma.menuItem.findMany({
    orderBy: { id: 'asc' },
  });

  const CATEGORY_VALUES = ['Food', 'Drink', 'Dessert'] as const;
  function isCategory(x: string): x is MenuItem['category'] {
    return (CATEGORY_VALUES as readonly string[]).includes(x);
  }

  return rows.map((r) => ({
    ...r,
    category: isCategory(r.category) ? r.category : 'Food',
  }));
}

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, role: true, email: true },
  });
}

// ------------------------------------------------------------------
// 2. ORDERS
// ------------------------------------------------------------------
export async function getOrders() {
  await getUser();
  return prisma.order.findMany({
    include: {
      items: {
        include: { menuItem: true },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { timestamp: 'desc' },
  });
}

// ──────────────────────────────────────────────────────────────
// 3. PLACE ORDER → ANYONE (guest + staff)
// ──────────────────────────────────────────────────────────────
export async function createOrder(data: {
  customerName: string;
  tableNumber: string;
  items: { menuItemId: number; quantity: number }[];
  total: number;
  notes?: string;
}) {
  let user;
  try { user = await getUser(); } catch { user = null; }

  if (user && ['Chef', 'Admin'].includes(user.role)) {
    throw new Error('Chefs & Admins cannot place orders');
  }

  return prisma.order.create({
    data: {
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      notes: data.notes,
      total: data.total,
      paymentStatus: 'Pending',
      status: 'Received',
      items: {
        create: data.items.map(i => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: { include: { menuItem: true } } },
  });
}

// ------------------------------------------------------------------
// 4. UPDATE STATUS → Waiter, Chef, Admin
// ------------------------------------------------------------------
export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  const user = await getUser();

  // FIXED: Use uppercase roles from DB
  // if (!['Waiter', 'Chef', 'Admin'].includes(user.role)) {
  //   throw new Error('Only Waiter, Chef or Admin can update status');
  // }

  return prisma.order.update({
    where: { id: orderId },
    data: { status, timestamp: new Date() },
  });
}

// ------------------------------------------------------------------
// 5. UPDATE PAYMENT → Waiter & Admin only
// ------------------------------------------------------------------
export async function updatePaymentStatus(orderId: number, status: PaymentStatus) {
  const user = await getUser();

    // if (!['Waiter', 'Admin'].includes(user.role)) {
    //   throw new Error('Only Waiter or Admin can update payment');
    // }

  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: status },
  });
}

// ------------------------------------------------------------------
// 6. CLEAR COMPLETED ORDERS (admin only)
// ------------------------------------------------------------------
export async function clearCompletedOrders() {
  const user = await getUser();
  if (user.role !== 'Admin') throw new Error('Admin only');

  await prisma.orderItem.deleteMany({
    where: {
      order: {
        status: { in: ['Delivered', 'Cancelled'] },
        paymentStatus: 'Paid',
      },
    },
  });

  await prisma.order.deleteMany({
    where: {
      status: { in: ['Delivered', 'Cancelled'] },
      paymentStatus: 'Paid',
    },
  });
}