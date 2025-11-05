// app/chef/page.tsx
'use client';

import { useSession, signIn } from "next-auth/react";
import { useCafe } from '@/context/CafeContext';
import OrderCard from '../components/waiter/OrderCard'; // ← SAME AS WAITER
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChefPage() {
  const { data: session, status } = useSession();
  const { orders } = useCafe();

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">Please log in with a Chef Account</h2>
        <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Sign in with Google
        </button>
      </div>
    );
  }

  // Accept chef / Chef
  if (!['chef', 'Chef'].includes(session.user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">You are not authorized to view the Chef Dashboard.</p>
        <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Sign in with a Chef Account
        </button>
      </div>
    );
  }

  // CHEF SEES ONLY RELEVANT ORDERS
  const kitchenOrders = orders
    .filter(order => ['Received', 'Sent to Chef', 'Preparing', 'Ready'].includes(order.status))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const completedOrders = orders
    .filter(order => order.status === 'Delivered' && order.paymentStatus === 'Paid')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Kitchen Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage cooking and preparation.</p>
      </div>

      <Tabs defaultValue="kitchen" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="kitchen">Kitchen Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="kitchen">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {kitchenOrders.length > 0 ? (
              kitchenOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No orders in the kitchen.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No completed orders.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}