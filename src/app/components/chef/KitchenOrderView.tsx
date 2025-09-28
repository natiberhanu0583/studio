import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useCafe } from '@/context/CafeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KitchenOrderViewProps {
  orders: Order[];
}

export default function KitchenOrderView({ orders }: KitchenOrderViewProps) {
  const { updateOrderStatus } = useCafe();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {orders.map((order) => (
        <Card key={order.id} className="bg-card border-primary/50 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-xl">Order #{order.id}</CardTitle>
              {order.status === 'Preparing' && <Badge variant="secondary">Preparing</Badge>}
              {order.status === 'Sent to Chef' && <Badge>New</Badge>}
            </div>
            <CardDescription>{order.customerName}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             {order.notes && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-start gap-2 p-2 mb-2 rounded-md bg-muted text-muted-foreground border border-dashed border-primary/30">
                                <MessageSquare className="w-5 h-5 mt-0.5 text-primary/80 flex-shrink-0"/>
                                <p className="text-sm italic line-clamp-3">{order.notes}</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{order.notes}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            )}
            <ul className="space-y-2">
              {order.items.map(({ menuItem, quantity }) => (
                <li key={menuItem.id} className="flex justify-between items-center text-lg">
                  <span className="font-semibold">{menuItem.name}</span>
                  <span className="font-bold text-primary">x{quantity}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                <Clock className="w-3 h-3"/>
                <span>{formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full" onClick={() => updateOrderStatus(order.id, 'Ready')}>
                <CheckCircle className="mr-2"/>
                Mark as Ready
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
