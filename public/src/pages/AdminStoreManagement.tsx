import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Store, Package, Tag, Settings } from "lucide-react";
import AdminStoreCategories from "./AdminStoreCategories";
import AdminProducts from "./AdminProducts";
import AdminProductTypes from "./AdminProductTypes";

const AdminStoreManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('admin_store.management.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('admin_store.management.desc')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {t('admin_store.management.tabs.categories')}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('admin_store.management.tabs.products')}
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('admin_store.management.tabs.types')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <AdminStoreCategories />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="types" className="mt-6">
            <AdminProductTypes />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminStoreManagement;


