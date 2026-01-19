import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react";

interface StoreCategory {
  id: number;
  name: string;
}

interface ProductType {
  id: number;
  name: string;
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
  stock_quantity: number | null;
  sku: string | null;
}

const AdminProducts = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    store_category_id: "",
    product_type_id: "",
    name: "",
    slug: "",
    description: "",

    price: "",
    stock_quantity: "",
    status: "active",
    sku: "",
    images: [] as string[],
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.store_category_id) {
      loadProductTypes(parseInt(formData.store_category_id));
    }
  }, [formData.store_category_id]);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from("store_categories").select("id, name").eq("is_active", true),
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (productsRes.error) throw productsRes.error;

      setCategories(categoriesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductTypes = async (categoryId: number) => {
    try {
      const { data, error } = await supabase
        .from("product_types")
        .select("id, name, store_category_id")
        .eq("store_category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;
      setProductTypes(data || []);
    } catch (error: any) {
      console.error("Error loading product types:", error);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    try {
      if (product) {
        setEditingProduct(product);
        setFormData({
          store_category_id: product.store_category_id.toString(),
          product_type_id: product.product_type_id?.toString() || "none",
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: product.price.toString(),
          stock_quantity: product.stock_quantity !== null ? product.stock_quantity.toString() : "",
          status: product.status,
          sku: product.sku || "",
          images: product.images || [],
        });
        loadProductTypes(product.store_category_id);
      } else {
        // Check if categories are loaded
        if (categories.length === 0) {
          toast({
            title: t('admin_store.products.noCategories.title'),
            description: t('admin_store.products.noCategories.desc'),
            variant: "destructive",
          });
          return;
        }

        setEditingProduct(null);
        setFormData({
          store_category_id: categories[0]?.id.toString() || "",
          product_type_id: "none",
          name: "",
          slug: "",
          description: "",
          price: "",
          stock_quantity: "",
          status: "active",
          sku: "",
          images: [],
        });

        // Load product types for the first category
        if (categories[0]?.id) {
          loadProductTypes(categories[0].id);
        }
      }
      setShowDialog(true);
    } catch (error: any) {
      console.error("Error opening dialog:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open dialog",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `store-products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("store-products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("store-products")
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
      });
      toast({ title: "Success", description: t('admin_store.products.messages.imagesUploaded') });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.price || !formData.store_category_id) {
        toast({
          title: "Validation Error",
          description: t('admin_store.categories.messages.validation'), // Reuse validation message
          variant: "destructive",
        });
        return;
      }

      const data = {
        store_category_id: parseInt(formData.store_category_id),
        product_type_id: formData.product_type_id && formData.product_type_id !== "none" ? parseInt(formData.product_type_id) : null,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        status: formData.status,
        sku: formData.sku || null,
        images: formData.images.length > 0 ? formData.images : null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", editingProduct.id);

        if (error) throw error;
        if (error) throw error;
        toast({ title: "Success", description: t('admin_store.products.messages.updated') });
      } else {
        const { error } = await supabase.from("products").insert([data]);

        if (error) throw error;
        toast({ title: "Success", description: t('admin_store.products.messages.created') });
      }

      setShowDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin_store.products.messages.confirmDelete'))) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: t('admin_store.products.messages.deleted') });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('admin_store.products.title')}</h2>
        <Button
          onClick={() => handleOpenDialog()}
          disabled={categories.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('admin_store.products.add')}
        </Button>
      </div>

      {categories.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{t('admin_store.products.noCategories.boxTitle')}</strong> {t('admin_store.products.noCategories.boxDesc')}
          </p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin_store.products.table.category')}</TableHead>
            <TableHead>{t('admin_store.products.table.category')}</TableHead>
            <TableHead>{t('admin_store.products.table.price')}</TableHead>
            <TableHead>{t('admin_store.products.table.price')}</TableHead>
            <TableHead>{t('admin_store.products.table.stock')}</TableHead>
            <TableHead>{t('admin_store.products.table.status')}</TableHead>
            <TableHead className="text-right">{t('admin_store.products.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{getCategoryName(product.store_category_id)}</TableCell>
              <TableCell>
                {product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })} DZD
              </TableCell>
              <TableCell>
                {product.stock_quantity !== null ? (
                  product.stock_quantity > 0 ? (
                    <span className="text-green-600 font-medium">{t('admin_store.products.table.inStock', { count: product.stock_quantity })}</span>
                  ) : (
                    <span className="text-red-500 font-medium">{t('admin_store.products.table.outOfStock')}</span>
                  )
                ) : (
                  <span className="text-muted-foreground">{t('admin_store.products.table.unlimited')}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t('admin_store.products.edit') : t('admin_store.products.add')}
            </DialogTitle>
            <DialogDescription>
              {t('admin_store.products.manageDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No store categories available. Please create a category first.
                </p>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store_category_id">{t('admin_store.products.form.category')}</Label>
                    <Select
                      value={formData.store_category_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, store_category_id: value, product_type_id: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin_store.products.form.placeholders.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_type_id">{t('admin_store.products.form.type')}</Label>
                    <Select
                      value={formData.product_type_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, product_type_id: value })
                      }
                      disabled={!formData.store_category_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin_store.products.form.placeholders.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {productTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Product name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="product-slug"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        placeholder="SKU-123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, stock_quantity: e.target.value })
                        }
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Product description..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageUpload(e.target.files);
                      }
                    }}
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading images...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {categories.length > 0 && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={uploadingImages}>
                Save
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;

