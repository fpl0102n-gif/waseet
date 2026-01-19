import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Section from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { CategoryBadge } from "@/components/ui/category-badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductSuggestionModal } from "@/components/store/ProductSuggestionModal";

interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  badge_label: string;
  badge_color: string;
  is_active: boolean;
}

interface ProductType {
  id: number;
  name: string;
  slug: string;
  store_category_id: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[] | null;
  status: string;
  store_category_id: number;
  product_type_id: number | null;
  product_types?: ProductType;
  stock_quantity: number | null;
}

const Store = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [storeCategory, setStoreCategory] = useState<StoreCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadStoreData();
  }, [categorySlug]);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      // Load store category (default to first active category if none specified)
      let categoryResult;

      if (categorySlug) {
        categoryResult = await supabase
          .from("store_categories")
          .select("*")
          .eq("slug", categorySlug)
          .eq("is_active", true)
          .single();
      } else {
        // Load default category
        const result = await supabase
          .from("store_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .limit(1);

        if (result.data && result.data.length > 0) {
          categoryResult = { data: result.data[0], error: result.error };
        } else {
          categoryResult = { data: null, error: result.error };
        }
      }

      const { data: categoryData, error: categoryError } = categoryResult;

      if (categoryError || !categoryData) {
        // Check if it's because no categories exist
        if (categoryError?.code === 'PGRST116' || !categoryData) {
          // No categories found - show empty state
          setStoreCategory(null);
          setLoading(false);
          return;
        }

        // Specific category not found
        if (categorySlug) {
          toast({
            title: t('store.notFound.title'),
            description: t('store.notFound.desc'),
            variant: "destructive"
          });
        }
        setLoading(false);
        return;
      }

      const category = categoryData;

      if (!category) {
        setStoreCategory(null);
        setLoading(false);
        return;
      }

      setStoreCategory(category);

      // Load product types for this category
      const { data: typesData, error: typesError } = await supabase
        .from("product_types")
        .select("*")
        .eq("store_category_id", category.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!typesError && typesData) {
        setProductTypes(typesData);
      }

      // Load products
      await loadProducts(category.id);

    } catch (error) {
      console.error("Error loading store data:", error);
      toast({
        title: t('store.toast.error_title'),
        description: t('store.toast.load_data_error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryId: number) => {
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_types (*)
        `)
        .eq("store_category_id", categoryId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedProductType) {
        const productType = productTypes.find(pt => pt.slug === selectedProductType);
        if (productType) {
          query = query.eq("product_type_id", productType.id);
        }
      }

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: t('store.toast.error_title'),
        description: t('store.toast.load_products_error'),
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (storeCategory) {
      loadProducts(storeCategory.id);
    }
  }, [selectedProductType, searchQuery, storeCategory]);

  if (loading) {
    return (
      <AppLayout>
        <Section padding="md">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Section>
      </AppLayout>
    );
  }

  if (!storeCategory) {
    return (
      <AppLayout>
        <Section padding="md">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {categorySlug ? t('store.notFound.title') : t('store.noCategories.title')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {categorySlug
                ? t('store.notFound.desc')
                : t('store.noCategories.desc')}
            </p>
            {!categorySlug && (
              <Button onClick={() => navigate("/")} variant="outline">
                {t('store.goHome')}
              </Button>
            )}
          </div>
        </Section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section padding="md">
        <div className="max-w-7xl mx-auto">
          {/* Store Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{storeCategory.name}</h1>
                    <CategoryBadge
                      label={storeCategory.badge_label}
                      color={storeCategory.badge_color}
                      size="md"
                    />
                  </div>
                  {storeCategory.description && (
                    <p className="text-muted-foreground">{storeCategory.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ProductSuggestionModal />
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <Input
                placeholder={t('store.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                {t('store.clear')}
              </Button>
            </div>

            {/* Filters */}
            {productTypes.length > 0 && (
              <FilterBar
                productTypes={productTypes}
                selectedProductType={selectedProductType}
                onProductTypeChange={setSelectedProductType}
              />
            )}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description || undefined}
                  price={product.price}
                  images={product.images || undefined}
                  slug={product.slug}
                  categoryLabel={storeCategory.badge_label}
                  categoryColor={storeCategory.badge_color}
                  productTypeName={product.product_types?.name}
                  stockQuantity={product.stock_quantity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('store.noProducts.title')}</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedProductType
                  ? t('store.noProducts.descSearch')
                  : t('store.noProducts.descEmpty')}
              </p>
            </div>
          )}
        </div>
      </Section>
    </AppLayout>
  );
};

export default Store;

