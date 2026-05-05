'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCafe } from '@/context/CafeContext';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/lib/notifications';

const { placeholderImages } = placeholderImagesData;

export default function CartDisplay() {
  const { toast } = useToast();
  const {
    cart,
    menuItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    refetch,
  } = useCafe();

  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    if (!customerName || !tableNumber) {
      toast({ variant: 'destructive', title: 'Please fill in your name and table number' });
      return;
    }
    setIsPlacing(true);

    try {
      await placeOrder(customerName, tableNumber, notes);
      playNotificationSound('order');
      setCustomerName('');
      setTableNumber('');
      setNotes('');
      await refetch();
      toast({ title: 'Order sent!', description: 'Kitchen notified with sound.' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to send order' });
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-full border rounded-xl bg-card/50 backdrop-blur-sm">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Your cart is empty</p>
        <p className="text-sm text-muted-foreground mt-2">Add some delicious items to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Your Order
        </h2>
      </div>

      <div className="p-4 space-y-4 shrink-0 bg-muted/10">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="side-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input
              id="side-name"
              placeholder="Abebe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-background border-muted-foreground/20 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="side-table" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table</Label>
            <Input
              id="side-table"
              placeholder="5 or Takeaway"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-background border-muted-foreground/20 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="side-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
          <Textarea
            id="side-notes"
            placeholder="Extra spicy, no onions..."
            className="resize-none bg-background border-muted-foreground/20 focus:border-primary transition-all min-h-[60px]"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-grow px-4 overflow-y-auto">
        <div className="py-4 space-y-4">
          {cart.map((c) => {
            const item = menuItems.find((m) => m.id === c.menuItemId);
            if (!item) return null;
            const imgPlaceholder = placeholderImages.find((p) => p.id === item.imageId);
            const imageUrl = imgPlaceholder ? imgPlaceholder.imageUrl : (item.imageId && (item.imageId.startsWith('http') || item.imageId.startsWith('data:')) ? item.imageId : null);

            return (
              <div key={item.id} className="flex gap-3 group transition-all">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 shadow-sm">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized={imageUrl.startsWith('data:')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase font-bold">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-xs font-semibold text-primary">
                    {item.price.toFixed(2)} ETB
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center font-bold text-sm">{c.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => addToCart(item.id)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 bg-muted/30 border-t space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Total</span>
          <span className="text-2xl font-black text-primary">{getCartTotal().toFixed(2)} ETB</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={clearCart}
            className="btn-gradient-secondary border-none"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button
            className="btn-gradient text-white font-bold"
            onClick={handlePlaceOrder}
            disabled={!customerName || !tableNumber || isPlacing}
          >
            {isPlacing ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
