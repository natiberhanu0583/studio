'use client';

import { useCafe } from '@/context/CafeContext';
import KitchenOrderView from '../components/chef/KitchenOrderView';

export default function ChefPage() {
  const { orders } = useCafe();

  const ordersForKitchen = orders.filter((order) =>
    ['Sent to Chef', 'Preparing'].includes(order.status)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Kitchen Orders</h1>
        <p className="mt-2 text-lg text-muted-foreground">Current orders for preparation.</p>
      </div>
      {ordersForKitchen.length > 0 ? (
        <KitchenOrderView orders={ordersForKitchen} />
      ) : (
        <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No orders in the kitchen right now.</p>
        </div>
      )}
    </div>
  );
}
