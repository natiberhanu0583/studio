'use client';

import { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateMenuItemCost } from '@/app/actions';
import { Save, Info } from 'lucide-react';

export default function ProfitabilityManagement() {
  const { menuItems, refetch } = useCafe();
  const { toast } = useToast();
  const [costs, setCosts] = useState<Record<number, string>>({});

  const handleCostChange = (itemId: number, value: string) => {
    setCosts(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSave = async (itemId: number) => {
    const costValue = costs[itemId];
    if (costValue === undefined) return;

    const cost = parseFloat(costValue);
    if (isNaN(cost)) {
      toast({ variant: 'destructive', title: 'Invalid cost', description: 'Please enter a valid number.' });
      return;
    }

    try {
      await updateMenuItemCost(itemId, cost);
      await refetch();
      toast({ title: 'Saved!', description: 'Item cost updated successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
          Profitability Management
        </CardTitle>
        <CardDescription>
          Set the cost price for each menu item to calculate accurate profit margins in the Sales Report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex gap-3 items-start">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Profit is calculated as <code>(Price - Cost) × Units Sold</code>. 
            Ensure costs are accurate for your reports.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="w-[180px]">Cost Price (ETB)</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-bold">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right font-mono">{item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder={(item as any).cost?.toFixed(2) || '0.00'}
                    value={costs[item.id] ?? (item as any).cost ?? ''}
                    onChange={(e) => handleCostChange(item.id, e.target.value)}
                    className="font-mono"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    onClick={() => handleSave(item.id)}
                    disabled={costs[item.id] === undefined}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
