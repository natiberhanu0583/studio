'use client';

import { useSession, signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesReport from '../components/admin/SalesReport';
import UserManagement from '../components/admin/UserManagement';
import UnpaidOrdersReport from '../components/admin/UnpaidOrdersReport';
import ProfitabilityManagement from '../components/admin/ProfitabilityManagement';
import AdminMenuControl from '../components/admin/AdminMenuControl';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-lg font-headline animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  // ✅ Authorized admin (Auth bypassed for dev) — show dashboard
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-tight">
          Admin Control
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Overview of operations, financials, and menu availability.
        </p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl h-auto p-1.5 bg-muted/50 border border-primary/10 rounded-3xl overflow-hidden">
            <TabsTrigger value="sales" className="rounded-2xl py-3 data-[state=active]:btn-gradient data-[state=active]:text-white shadow-lg transition-all">Sales</TabsTrigger>
            <TabsTrigger value="unpaid" className="rounded-2xl py-3 data-[state=active]:btn-gradient data-[state=active]:text-white shadow-lg transition-all">Unpaid</TabsTrigger>
            <TabsTrigger value="menu" className="rounded-2xl py-3 data-[state=active]:btn-gradient data-[state=active]:text-white shadow-lg transition-all">Menu</TabsTrigger>
            <TabsTrigger value="profit" className="rounded-2xl py-3 data-[state=active]:btn-gradient data-[state=active]:text-white shadow-lg transition-all">Profit</TabsTrigger>
            <TabsTrigger value="users" className="rounded-2xl py-3 data-[state=active]:btn-gradient data-[state=active]:text-white shadow-lg transition-all">Users</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
          <TabsContent value="sales" className="outline-none">
            <SalesReport />
          </TabsContent>
          <TabsContent value="unpaid" className="outline-none">
            <UnpaidOrdersReport />
          </TabsContent>
          <TabsContent value="menu" className="outline-none">
            <AdminMenuControl />
          </TabsContent>
          <TabsContent value="profit" className="outline-none">
            <ProfitabilityManagement />
          </TabsContent>
          <TabsContent value="users" className="outline-none">
            <UserManagement />
          </TabsContent>
        </div>
      </Tabs>      
    </div>
  );
}
