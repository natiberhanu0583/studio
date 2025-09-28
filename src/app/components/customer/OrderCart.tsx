'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCafe } from '@/context/CafeContext';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const { placeholderImages } = placeholderImagesData;

export default function OrderCart() {
  const { cart, menuItems, addToCart, removeFromCart, getCartTotal, clearCart, placeOrder, cartItemCount } = useCafe();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handlePlaceOrder = () => {
    placeOrder(customerName, tableNumber, notes);
    // Only clear fields if order placement was successful (we'd need feedback from placeOrder for this)
    // For now, we optimistically clear them.
    setCustomerName('');
    setTableNumber('');
    setNotes('');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0" variant="destructive">
              {cartItemCount}
            </Badge>
          )}
          <span className="sr-only">Open Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Your Order</SheetTitle>
          <SheetDescription>Review your items before placing the order.</SheetDescription>
        </SheetHeader>
        <Separator className="my-4"/>
        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
             <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <SheetClose asChild>
                <Button variant="link" className="mt-2">Start an order</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input 
                      id="customerName" 
                      placeholder="e.g. Abebe" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input 
                      id="tableNumber" 
                      placeholder="e.g. 5 or Takeaway" 
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Extra spicy, no onions, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <Separator className="my-4"/>
            <ScrollArea className="flex-grow pr-4 -mr-6">
              <div className="space-y-4">
                {cart.map((cartItem) => {
                  const menuItem = menuItems.find((item) => item.id === cartItem.menuItemId);
                  if (!menuItem) return null;
                  const placeholder = placeholderImages.find(p => p.id === menuItem.imageId);
                  return (
                    <div key={menuItem.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        {placeholder && (
                            <Image 
                                src={placeholder.imageUrl} 
                                alt={menuItem.name} 
                                fill 
                                className="object-cover"
                                data-ai-hint={placeholder.imageHint}
                            />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">{menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">{menuItem.price.toFixed(2)} ETB</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeFromCart(menuItem.id)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-4 text-center">{cartItem.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addToCart(menuItem.id)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator className="my-4"/>
            <div className="space-y-2">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{getCartTotal().toFixed(2)} ETB</span>
                </div>
            </div>
            <SheetFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={clearCart}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
              <SheetClose asChild>
                <Button className="flex-grow" onClick={handlePlaceOrder} disabled={!customerName || !tableNumber}>Place Order</Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
