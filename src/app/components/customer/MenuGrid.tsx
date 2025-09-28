import type { MenuItem } from '@/lib/types';
import MenuItemCard from './MenuItemCard';

interface MenuGridProps {
  items: MenuItem[];
}

export default function MenuGrid({ items }: MenuGridProps) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground">No items in this category.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
