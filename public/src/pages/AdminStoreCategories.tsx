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
import { CategoryBadge } from "@/components/ui/category-badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  badge_label: string;
  badge_color: string;
  is_active: boolean;
  display_order: number;
}

const AdminStoreCategories = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    badge_label: "",
    badge_color: "#3b82f6",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("store_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: t('admin_store.categories.messages.validation').split('.')[0], // Generic error title
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: StoreCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        badge_label: category.badge_label,
        badge_color: category.badge_color,
        is_active: category.is_active,
        display_order: category.display_order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        badge_label: "",
        badge_color: "#3b82f6",
        is_active: true,
        display_order: 0,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.badge_label) {
        toast({
          title: t('admin_store.categories.messages.validation').split('.')[0], // Fallback or specific key
          description: t('admin_store.categories.messages.validation'),
          variant: "destructive",
        });
        return;
      }

      if (editingCategory) {
        const { error } = await supabase
          .from("store_categories")
          .update(formData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast({ title: "Success", description: t('admin_store.categories.messages.updated') });
      } else {
        const { error } = await supabase
          .from("store_categories")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: t('admin_store.categories.messages.created') });
      }

      setShowDialog(false);
      loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin_store.categories.messages.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from("store_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: t('admin_store.categories.messages.deleted') });
      loadCategories();
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
        <h2 className="text-2xl font-semibold">{t('admin_store.categories.title')}</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin_store.categories.add')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin_store.categories.table.name')}</TableHead>
            <TableHead>{t('admin_store.categories.table.badge')}</TableHead>
            <TableHead>{t('admin_store.categories.table.slug')}</TableHead>
            <TableHead>{t('admin_store.categories.table.status')}</TableHead>
            <TableHead>{t('admin_store.categories.table.order')}</TableHead>
            <TableHead className="text-right">{t('admin_store.categories.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                <CategoryBadge
                  label={category.badge_label}
                  color={category.badge_color}
                  size="sm"
                />
              </TableCell>
              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
              <TableCell>
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? t('admin_store.categories.table.active') : t('admin_store.categories.table.inactive')}
                </Badge>
              </TableCell>
              <TableCell>{category.display_order}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('admin_store.categories.edit') : t('admin_store.categories.add')}
            </DialogTitle>
            <DialogDescription>
              {t('admin_store.categories.manageDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('admin_store.categories.form.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                    badge_label: formData.badge_label || e.target.value,
                  });
                }}
                placeholder="Medical Equipment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('admin_store.categories.form.slug')}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="medical-equipment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge_label">{t('admin_store.categories.form.badgeLabel')}</Label>
              <Input
                id="badge_label"
                value={formData.badge_label}
                onChange={(e) =>
                  setFormData({ ...formData, badge_label: e.target.value })
                }
                placeholder="Medical Equipment"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge_color">{t('admin_store.categories.form.badgeColor')}</Label>
                <Input
                  id="badge_color"
                  type="color"
                  value={formData.badge_color}
                  onChange={(e) =>
                    setFormData({ ...formData, badge_color: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Store category description..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Active</Label>
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
    </div >
  );
};

export default AdminStoreCategories;

