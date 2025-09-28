
'use client';

import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function UnpaidOrdersReport() {
  const { orders } = useCafe();

  const unpaidOrders = orders.filter(
      (order) => (order.status === 'Delivered' || order.status === 'Cancelled') && order.paymentStatus === 'Pending'
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalUnpaidRevenue = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Unpaid Orders</CardTitle>
        <CardDescription>
            A list of all completed or cancelled orders that are still pending payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unpaidOrders.length > 0 ? (
                unpaidOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right">{order.total.toFixed(2)} ETB</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No unpaid orders found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={3}>
                    <span className="font-bold">Total Unpaid Orders: {unpaidOrders.length}</span>
                </TableCell>
                <TableCell className="text-right font-bold">Total Unpaid</TableCell>
                <TableCell className="text-right font-bold text-destructive">{totalUnpaidRevenue.toFixed(2)} ETB</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

