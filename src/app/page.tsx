'use client';

import { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import MenuGrid from './components/customer/MenuGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomerPage() {
  const { menuItems } = useCafe();
  const [activeTab, setActiveTab] = useState('Food');

  const foodItems = menuItems.filter((item) => item.category === 'Food');
  const drinkItems = menuItems.filter((item) => item.category === 'Drink');
  const dessertItems = menuItems.filter((item) => item.category === 'Dessert');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Welcome to Shega Cafe</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Enjoy the taste of tradition. Browse our menu and place your order.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="Food">Food</TabsTrigger>
          <TabsTrigger value="Drink">Drinks</TabsTrigger>
          <TabsTrigger value="Dessert">Desserts</TabsTrigger>
        </TabsList>
        <TabsContent value="Food">
          <MenuGrid items={foodItems} />
        </TabsContent>
        <TabsContent value="Drink">
          <MenuGrid items={drinkItems} />
        </TabsContent>
        <TabsContent value="Dessert">
          <MenuGrid items={dessertItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
