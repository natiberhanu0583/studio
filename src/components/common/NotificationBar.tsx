'use client';

import { useCafe } from '@/context/CafeContext';
import { useState, useEffect } from 'react';
import { Bell, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NotificationBar() {
  const { orders } = useCafe();
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Monitor for changes to show in the bar
  useEffect(() => {
    const latestOrder = orders[0];
    if (latestOrder) {
      if (latestOrder.status === 'Pending') {
        setRecentNotification(`New Order #${latestOrder.id} from ${latestOrder.customerName} (Table ${latestOrder.tableNumber})`);
      } else if (latestOrder.status === 'Ready') {
        setRecentNotification(`Order #${latestOrder.id} is Ready for pickup!`);
      }
    }
    
    // Auto hide after 5 seconds
    const timer = setTimeout(() => setRecentNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [orders]);

  if (!recentNotification) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-md animate-in slide-in-from-top-4 duration-500">
      <div className="glass border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-2xl bg-emerald-500/10 backdrop-blur-2xl">
        <div className="bg-primary/20 p-2 rounded-full">
          <Bell className="h-5 w-5 text-primary animate-ring" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">{recentNotification}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Live Update</p>
        </div>
        <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">Now</Badge>
      </div>
    </div>
  );
}
