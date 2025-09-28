
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesReport from '../components/admin/SalesReport';
import UserManagement from '../components/admin/UserManagement';
import UnpaidOrdersReport from '../components/admin/UnpaidOrdersReport';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage users and view sales reports.</p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid Orders</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>
        <TabsContent value="unpaid">
          <UnpaidOrdersReport />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
