// app/components/OrderCart.tsx   ← DROP THIS FILE HERE
'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
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

const { placeholderImages } = placeholderImagesData;

export default function OrderCart() {
  const { toast } = useToast();
  const {
    cart,
    menuItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    cartItemCount,
    refetch, // ← NEW: refresh orders after submit
  } = useCafe();

  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    setIsPlacing(true);

    try {
      await placeOrder(customerName, tableNumber, notes);
      setCustomerName('');
      setTableNumber('');
      setNotes('');
      await refetch(); // ← instantly updates waiter page
      toast({ title: 'Order sent!', description: 'Kitchen notified.' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to send order' });
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center" variant="destructive">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Your Order</SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Cart is empty</p>
            <SheetClose asChild>
              <Button variant="link" className="mt-4">Add items</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Customer Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Abebe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="table">Table</Label>
                  <Input
                    id="table"
                    placeholder="5 or Takeaway"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Extra spicy, no onions..."
                  className="resize-none"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Cart Items */}
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                {cart.map((c) => {
                  const item = menuItems.find((m) => m.id === c.menuItemId);
                  if (!item) return null;
                  const img = placeholderImages.find((p) => p.id === item.imageId);

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {img && (
                          <Image
                            src={img.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toFixed(2)} ETB
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">{c.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
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

            <Separator className="my-4" />

            {/* Total */}
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-primary">{getCartTotal().toFixed(2)} ETB</span>
            </div>

            <SheetFooter className="mt-6 gap-3">
              <Button variant="outline" onClick={clearCart} className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <SheetClose asChild>
                <Button
                  className="flex-1"
                  onClick={handlePlaceOrder}
                  disabled={!customerName || !tableNumber || isPlacing}
                >
                  {isPlacing ? 'Sending...' : 'Place Order'}
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}