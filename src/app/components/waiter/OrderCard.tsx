
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { useCafe } from '@/context/CafeContext';
import { cn } from '@/lib/utils';
import { intelligentOrderNotifications } from '@/ai/flows/intelligent-order-notifications';
import { useToast } from '@/hooks/use-toast';
import { Clock, CreditCard, User, Hash, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<OrderStatus, string> = {
  Received: 'bg-blue-500',
  'Sent to Chef': 'bg-orange-500',
  Preparing: 'bg-yellow-500 text-black',
  Ready: 'bg-green-500',
  Delivered: 'bg-gray-500',
  Cancelled: 'bg-red-500',
};

const orderStatusOptions: OrderStatus[] = ['Received', 'Sent to Chef', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

export default function OrderCard({ order }: OrderCardProps) {
  const { updateOrderStatus, updatePaymentStatus } = useCafe();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    
    const aiStatus = newStatus.toLowerCase().replace(/ /g, '_') as 'received' | 'sent_to_chef' | 'preparing' | 'ready' | 'delivered';
    
    if (!['received', 'sent_to_chef', 'preparing', 'ready', 'delivered'].includes(aiStatus)) {
        return;
    }
    
    try {
      const result = await intelligentOrderNotifications({
        orderId: String(order.id),
        orderStatus: aiStatus,
        customerPhoneNumber: '+15551234567', // Mock customer phone
        waiterPhoneNumber: '+15551234568', // Mock waiter phone
        estimatedPrepTimeMinutes: 15, // Mock prep time
      });

      if (result.customerNotificationSent || result.waiterNotificationSent) {
        toast({
          title: 'Smart Notification Triggered',
          description: result.notificationMessage,
        });
      }
    } catch (error) {
      console.error('AI Notification Error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not determine notification logic.',
      });
    }
  };

  const handlePayment = () => {
    updatePaymentStatus(order.id, 'Paid');
    toast({
        title: `Order #${order.id} Marked as Paid`,
        description: `${order.customerName}'s payment has been confirmed.`,
    })
  }
  
  const isOrderFinal = order.status === 'Delivered' || order.status === 'Cancelled';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-2xl">Order #{order.id}</CardTitle>
                <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-1">
                    <span className="flex items-center gap-2"><User className="w-4 h-4"/>{order.customerName}</span>
                    <span className="flex items-center gap-2"><Hash className="w-4 h-4"/>Table {order.tableNumber}</span>
                </div>
            </div>
            <Badge className={cn("text-white", statusColors[order.status])}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {order.notes && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-start gap-2 p-2 mb-4 rounded-md bg-muted text-muted-foreground border border-dashed border-primary/30">
                            <MessageSquare className="w-5 h-5 mt-0.5 text-primary/80 flex-shrink-0"/>
                            <p className="text-sm italic line-clamp-2">{order.notes}</p>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">{order.notes}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        )}
        <ul className="space-y-1 text-sm">
          {order.items.map(({ menuItem, quantity }) => (
            <li key={menuItem.id} className="flex justify-between">
              <span>{menuItem.name}</span>
              <span className="text-muted-foreground">x{quantity}</span>
            </li>
          ))}
        </ul>
        <div className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4"/>
            <span>{formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-primary">{order.total.toFixed(2)} ETB</span>
            </div>
            <Badge variant={order.paymentStatus === 'Paid' ? 'secondary' : 'destructive'}>{order.paymentStatus}</Badge>
        </div>
         {order.paymentStatus === 'Pending' && (
            <Button className="w-full" onClick={handlePayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                Mark as Paid
            </Button>
         )}
        <Select onValueChange={handleStatusChange} defaultValue={order.status} disabled={isOrderFinal}>
          <SelectTrigger>
            <SelectValue placeholder="Update Status" />
          </SelectTrigger>
          <SelectContent>
            {orderStatusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}



