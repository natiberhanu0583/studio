// app/components/MenuItemCard.tsx
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCafe } from '@/context/CafeContext';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { PlusCircle } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

const { placeholderImages } = placeholderImagesData;

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useCafe();
  const placeholder = placeholderImages.find(p => p.id === item.imageId);
  const imageUrl = placeholder ? placeholder.imageUrl : (item.imageId && item.imageId.startsWith('http') || item.imageId?.startsWith('data:') ? item.imageId : null);

  // HIDE IF NOT AVAILABLE
  if (!item.isAvailable) return null;

  return (
    <Card className="flex flex-col overflow-hidden h-full group hover-lift border-primary/5 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized={imageUrl.startsWith('data:')}
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
               <PlusCircle className="w-12 h-12" />
             </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow space-y-3">
        <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{item.name}</CardTitle>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">{item.description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center border-t border-primary/5 mt-auto bg-primary/5">
        <p className="text-xl font-black text-primary tracking-tight">{item.price.toFixed(0)} <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">ETB</span></p>
        <Button 
          onClick={() => addToCart(item.id)} 
          className="rounded-full btn-gradient px-6 py-5 text-white font-bold"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}