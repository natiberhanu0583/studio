'use client';

import { useEffect, useState, useMemo } from 'react';
import DownloadPdfButton from './DownloadPdfButton';
import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SalesReport() {
  const { orders, clearSalesData } = useCafe();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'weekly'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter orders by status and time
  const filteredOrders = useMemo(() => {
    const paid = orders.filter(o => o.status === 'Delivered' && o.paymentStatus === 'Paid');
    if (filter === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return paid.filter(o => new Date(o.timestamp) >= oneWeekAgo);
    }
    return paid;
  }, [orders, filter]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;

  // Calculate stats by item
  const itemStats = useMemo(() => {
    const stats: Record<number, { name: string, category: string, count: number, revenue: number, profit: number }> = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = item.menuItem;
        if (!stats[menuItem.id]) {
          stats[menuItem.id] = { 
            name: menuItem.name, 
            category: menuItem.category, 
            count: 0, 
            revenue: 0, 
            profit: 0 
          };
        }
        stats[menuItem.id].count += item.quantity;
        stats[menuItem.id].revenue += menuItem.price * item.quantity;
        // @ts-ignore - cost field added to schema
        const cost = menuItem.cost || 0;
        stats[menuItem.id].profit += (menuItem.price - cost) * item.quantity;
      });
    });

    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const totalProfit = itemStats.reduce((sum, item) => sum + item.profit, 0);

  const handleDelete = async () => {
    await clearSalesData();
    toast({ title: "Deleted!", description: "Sales data cleared.", variant: "destructive" });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground mt-1">From {totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalProfit.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground mt-1">Net gain after costs</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Package className="h-4 w-4" />
              Best Seller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 truncate">
              {itemStats[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {itemStats[0]?.count || 0} units sold
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="font-headline text-3xl">Performance Metrics</CardTitle>
              <CardDescription>Track sales, rankings, and profitability</CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    All Time
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Weekly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <DownloadPdfButton 
                orders={filteredOrders} 
                stats={{
                  totalRevenue,
                  totalProfit,
                  bestSeller: itemStats[0]?.name || 'N/A'
                }}
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Sales History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all delivered and paid orders. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="ranking" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 max-w-sm">
              <TabsTrigger value="ranking">Item Ranking</TabsTrigger>
              <TabsTrigger value="history">Order History</TabsTrigger>
            </TabsList>

            <TabsContent value="ranking" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemStats.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold">{item.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.category === 'Food' ? 'bg-orange-100 text-orange-600' : 
                          item.category === 'Drink' ? 'bg-blue-100 text-blue-600' : 
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono">{item.count}</TableCell>
                      <TableCell className="text-right font-medium">{item.revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">+{item.profit.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell>#{o.id}</TableCell>
                      <TableCell className="font-medium">{o.customerName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                        {o.items.map((i: any) => `${i.menuItem.name} (x${i.quantity})`).join(', ')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(o.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-bold">{o.total.toFixed(2)} ETB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}