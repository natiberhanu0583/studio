'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DownloadPdfButton({ orders, stats }: { orders: any[], stats?: any }) {
  const { toast } = useToast();

  const generatePDF = () => {
    try {
      toast({ title: 'Generating PDF...' });
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(26, 75, 153);
      doc.text('TIME BURGER & PIZZA - SALES REPORT', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      // Stats Section
      if (stats) {
        doc.setDrawColor(200);
        doc.setFillColor(245, 247, 250);
        doc.rect(14, 40, 182, 35, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(33);
        doc.text('PERFORMANCE SUMMARY', 18, 48);
        
        doc.setFontSize(10);
        doc.text(`Total Revenue: ${stats.totalRevenue.toLocaleString()} ETB`, 18, 56);
        doc.text(`Total Profit: ${stats.totalProfit.toLocaleString()} ETB`, 18, 62);
        doc.text(`Best Seller: ${stats.bestSeller}`, 110, 56);
        doc.text(`Total Orders: ${orders.length}`, 110, 62);
      }

      // Order Table
      const tableData = orders.map(o => [
        `#${o.id}`,
        o.customerName,
        o.items.map((i: any) => `${i.menuItem.name} (x${i.quantity})`).join(', '),
        o.tableNumber,
        new Date(o.timestamp).toLocaleDateString(),
        `${o.total.toFixed(0)} ETB`
      ]);

      autoTable(doc, {
        startY: stats ? 80 : 40,
        head: [['ID', 'Customer', 'Items Detail', 'Table', 'Date', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [26, 75, 153] },
        styles: { fontSize: 8 },
        columnStyles: { 2: { cellWidth: 60 } }
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} | Time Burger & Pizza Confidential`, 105, 290, { align: 'center' });
      }

      doc.save(`TimeBurgerPizza_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: 'PDF Downloaded!', description: 'Check your Downloads folder' });
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate file.' });
    }
  };

  return (
    <Button onClick={generatePDF} className="gap-2">
      <Download className="h-4 w-4" />
      Download PDF Report
    </Button>
  );
}