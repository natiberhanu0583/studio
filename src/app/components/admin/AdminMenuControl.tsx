'use client';

import { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings2, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toggleMenuItemAvailability, deleteMenuItem } from '@/app/actions';
import { Input } from '@/components/ui/input';
import MenuItemForm from './MenuItemForm';
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

export default function AdminMenuControl() {
  const { menuItems: allItems, refetch } = useCafe();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAvailability = async (itemId: number, currentAvailable: boolean) => {
    try {
      await toggleMenuItemAvailability(itemId, !currentAvailable);
      await refetch();
      toast({
        title: 'Status Updated',
        description: `${allItems.find(i => i.id === itemId)?.name} is now ${!currentAvailable ? 'Available' : 'Hidden'}`,
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMenuItem(id);
      await refetch();
      toast({ title: 'Deleted', description: 'Item removed from menu.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <Card className="border-primary/10 shadow-xl shadow-primary/5">
      <CardHeader className="bg-muted/30 pb-6 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <Settings2 className="h-8 w-8 text-primary" />
              Menu Control
            </CardTitle>
            <CardDescription>Manage your café offerings and availability.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                className="pl-10 rounded-full bg-background" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="rounded-full btn-gradient gap-2 w-full sm:w-auto text-white font-bold"
            >
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-4 group ${
                item.isAvailable 
                ? 'bg-card border-primary/10 hover:border-primary/30 shadow-sm' 
                : 'bg-muted/40 border-dashed border-muted-foreground/30 grayscale-[0.5]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest py-0">
                    {item.category}
                  </Badge>
                </div>
                <div className="flex gap-2">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => { setEditingItem(item); setIsFormOpen(true); }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this item from your menu.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-primary/5">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="font-mono font-bold text-primary">{item.price.toFixed(0)} ETB</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-medium">{item.isAvailable ? 'Live' : 'Hidden'}</span>
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => toggleAvailability(item.id, item.isAvailable)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <MenuItemForm 
        item={editingItem} 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </Card>
  );
}
