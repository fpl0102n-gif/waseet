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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface StoreCategory {
  id: number;
  name: string;
  slug: string;
}

interface ProductType {
  id: number;
  store_category_id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminProductTypes = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({
    store_category_id: "",
    name: "",
    slug: "",
    description: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        supabase.from("store_categories").select("id, name, slug").eq("is_active", true),
        supabase
          .from("product_types")
          .select("*")
          .order("display_order", { ascending: true }),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (typesRes.error) throw typesRes.error;

      setCategories(categoriesRes.data || []);
      setProductTypes(typesRes.data || []);
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

  const handleOpenDialog = (type?: ProductType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        store_category_id: type.store_category_id.toString(),
        name: type.name,
        slug: type.slug,
        description: type.description || "",
        is_active: type.is_active,
        display_order: type.display_order,
      });
    } else {
      setEditingType(null);
      setFormData({
        store_category_id: categories[0]?.id.toString() || "",
        name: "",
        slug: "",
        description: "",
        is_active: true,
        display_order: 0,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.store_category_id) {
        toast({
          title: t('admin_store.types.messages.validation').split('.')[0], // Generic error title
          description: t('admin_store.types.messages.validation'),
          variant: "destructive",
        });
        return;
      }

      const data = {
        ...formData,
        store_category_id: parseInt(formData.store_category_id),
        display_order: parseInt(formData.display_order.toString()) || 0,
      };

      if (editingType) {
        const { error } = await supabase
          .from("product_types")
          .update(data)
          .eq("id", editingType.id);

        if (error) throw error;
        toast({ title: "Success", description: t('admin_store.types.messages.updated') });
      } else {
        const { error } = await supabase.from("product_types").insert([data]);

        if (error) throw error;
        toast({ title: "Success", description: t('admin_store.types.messages.created') });
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
    if (!confirm(t('admin_store.types.messages.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from("product_types")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: t('admin_store.types.messages.deleted') });
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
        <h2 className="text-2xl font-semibold">{t('admin_store.types.title')}</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin_store.types.add')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin_store.types.table.name')}</TableHead>
            <TableHead>{t('admin_store.types.table.category')}</TableHead>
            <TableHead>{t('admin_store.types.table.slug')}</TableHead>
            <TableHead>{t('admin_store.types.table.status')}</TableHead>
            <TableHead>{t('admin_store.types.table.order')}</TableHead>
            <TableHead className="text-right">{t('admin_store.types.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>{getCategoryName(type.store_category_id)}</TableCell>
              <TableCell className="text-muted-foreground">{type.slug}</TableCell>
              <TableCell>
                <Badge variant={type.is_active ? "default" : "secondary"}>
                  {type.is_active ? t('admin_store.types.table.active') : t('admin_store.types.table.inactive')}
                </Badge>
              </TableCell>
              <TableCell>{type.display_order}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(type.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? t('admin_store.types.edit') : t('admin_store.types.add')}
            </DialogTitle>
            <DialogDescription>
              {t('admin_store.types.manageDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store_category_id">{t('admin_store.types.form.category')}</Label>
              <Select
                value={formData.store_category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, store_category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin_store.types.form.placeholders.selectCategory')} />
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
              <Label htmlFor="name">{t('admin_store.types.form.name')}</Label>
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
                placeholder="Diagnostic Equipment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('admin_store.types.form.slug')}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="diagnostic"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('admin_store.types.form.desc')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product type description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">{t('admin_store.types.form.order')}</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">{t('admin_store.types.form.active')}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductTypes;

