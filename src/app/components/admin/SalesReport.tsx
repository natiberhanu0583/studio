
'use client';

import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
}


export default function SalesReport() {
  const { orders, clearSalesData } = useCafe();
  const { toast } = useToast();

  const completedOrders = orders.filter((order) => order.status === 'Delivered' && order.paymentStatus === 'Paid');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = completedOrders.length;
  
  const handleExport = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.autoTable({
      head: [['Order ID', 'Customer', 'Date', 'Amount']],
      body: completedOrders.map(order => [
        `#${order.id}`,
        order.customerName,
        new Date(order.timestamp).toLocaleDateString(),
        `${order.total.toFixed(2)} ETB`
      ]),
      foot: [
        [{ content: `Total Orders: ${totalOrders}`, colSpan: 2, styles: { fontStyle: 'bold' } }, 
         { content: 'Total Revenue', styles: { halign: 'right', fontStyle: 'bold' } }, 
         { content: `${totalRevenue.toFixed(2)} ETB`, styles: { halign: 'left', fontStyle: 'bold' } }]
      ],
      didDrawPage: (data) => {
        doc.setFontSize(20);
        doc.text("Sales Report", data.settings.margin.left, 15);
      },
    });

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const dateString = `${day}_${month}_${year}`;
    doc.save(`shega_${dateString}.pdf`);

    toast({
        title: "Export Complete",
        description: "Your sales report PDF has been downloaded.",
    });
  };

  const handleDelete = () => {
    clearSalesData();
    toast({
        title: "Sales Data Cleared",
        description: "All paid, completed orders have been deleted.",
        variant: "destructive",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Sales Details</CardTitle>
                <CardDescription>A summary of all paid and delivered orders.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleExport} disabled={completedOrders.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={completedOrders.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete All
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all paid and delivered sales
                            data from the system. Unpaid orders will not be affected.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedOrders.length > 0 ? (
                completedOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{order.total.toFixed(2)} ETB</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No paid and delivered orders yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={2}>
                    <span className="font-bold">Total Orders: {totalOrders}</span>
                </TableCell>
                <TableCell className="text-right font-bold">Total Revenue</TableCell>
                <TableCell className="text-right font-bold text-primary">{totalRevenue.toFixed(2)} ETB</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
