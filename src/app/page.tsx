'use client';

import { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import MenuGrid from './components/customer/MenuGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CartDisplay from './components/customer/CartDisplay';
import { ShoppingCart } from 'lucide-react';
import OrderCart from './components/customer/OrderCart';

export default function CustomerPage() {
  const { menuItems } = useCafe();
  const [activeTab, setActiveTab] = useState('Food');

  const foodItems = menuItems.filter((item) => item.category === 'Food');
  const drinkItems = menuItems.filter((item) => item.category === 'Drink');
  const dessertItems = menuItems.filter((item) => item.category === 'Dessert');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* LEFT COLUMN: MENU (8/12 on large, 7/12 on medium) */}
      <div className="lg:col-span-8 md:col-span-7 space-y-8">
        <div className="text-left space-y-4 relative">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl -z-10 animate-pulse" />

          <Badge className="bg-emerald-600/10 text-emerald-700 border-emerald-600/20 hover:bg-emerald-600/20 transition-colors font-headline italic text-xs py-0.5">
            Established 2022 • Timeless Taste
          </Badge>

          <div className="relative">
            <h1 className="font-serif text-6xl md:text-8xl font-black tracking-tight text-foreground leading-none">
              T<span className="text-emerald-600">I</span>ME
            </h1>
            <p className="mt-0 text-emerald-500 font-mono font-bold uppercase tracking-[0.5em] text-lg md:text-xl">
              Burgur & Pizza
            </p>

            {/* Decorative Floating Arc Element */}
            <div className="absolute -right-8 top-0 hidden xl:block opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-32 h-32 animate-[spin_20s_linear_infinite]">
                <path d="M 50,10 A 40,40 0 1 1 20,80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-serif leading-relaxed italic border-l-4 border-emerald-600/40 pl-6 py-1">
            "Savor the moment with every bite. Where every second is a delicious memory."
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="h-10 w-2 bg-primary rounded-full" />
              Explore Menu
            </h2>
            <TabsList className="bg-muted/50 p-1.5 w-full lg:w-auto h-auto rounded-2xl border border-primary/10">
              <TabsTrigger value="Food" className="rounded-xl px-8 py-2.5 data-[state=active]:btn-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Food</TabsTrigger>
              <TabsTrigger value="Drink" className="rounded-xl px-8 py-2.5 data-[state=active]:btn-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Drinks</TabsTrigger>
              <TabsTrigger value="Dessert" className="rounded-xl px-8 py-2.5 data-[state=active]:btn-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Desserts</TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-[500px]">
            <TabsContent value="Food" className="mt-0 animate-in fade-in zoom-in-95 duration-500 outline-none">
              <MenuGrid items={foodItems} />
            </TabsContent>
            <TabsContent value="Drink" className="mt-0 animate-in fade-in zoom-in-95 duration-500 outline-none">
              <MenuGrid items={drinkItems} />
            </TabsContent>
            <TabsContent value="Dessert" className="mt-0 animate-in fade-in zoom-in-95 duration-500 outline-none">
              <MenuGrid items={dessertItems} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* RIGHT COLUMN: CART - Visible on Medium (Tablets) and Large Screens */}
      <div className="hidden md:block md:col-span-5 lg:col-span-4 sticky top-24 h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
        <div className="h-full rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 border border-primary/10">
          <CartDisplay />
        </div>
      </div>

      {/* MOBILE FLOATING CART BAR (Visible only on small screens when cart has items) */}
      <MobileCartBar />
    </div>
  );
}

import { Badge } from '@/components/ui/badge';

function MobileCartBar() {
  const { cartItemCount, getCartTotal } = useCafe();

  if (cartItemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-primary text-primary-foreground shadow-2xl rounded-2xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Your Order</p>
            <p className="font-black text-lg">{getCartTotal().toFixed(2)} ETB</p>
          </div>
        </div>

        <OrderCart />
      </div>
    </div>
  );
}
