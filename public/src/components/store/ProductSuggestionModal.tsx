import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Upload, X } from "lucide-react";

export function ProductSuggestionModal() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        whatsapp: "",
        telegram: "",
        product_name: "",
        proposed_price: "",
        currency: "DZD",
        store_name: "",
        store_location: "",
        source_type: "local",
        description: "",
    });

    const [hasWhatsapp, setHasWhatsapp] = useState(false);
    const [hasTelegram, setHasTelegram] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('suggestion-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('suggestion-images')
                    .getPublicUrl(filePath);

                newUrls.push(data.publicUrl);
            }

            setImageUrls(prev => [...prev, ...newUrls]);
            setImages(prev => [...prev, ...files]); // Keep track of files if needed, mostly urls matter now
            toast({ title: t('store.suggestion.toast.images_uploaded'), description: t('store.suggestion.toast.images_desc', { count: files.length }) });

        } catch (error: any) {
            console.error(error);
            toast({ title: t('store.suggestion.toast.upload_failed'), description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (imageUrls.length === 0) {
            toast({ title: t('store.suggestion.toast.image_required'), description: t('store.suggestion.toast.image_required_desc'), variant: "destructive" });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('store_product_suggestions')
                .insert({
                    ...formData,
                    whatsapp: hasWhatsapp ? formData.whatsapp : null,
                    telegram: hasTelegram ? formData.telegram : null,
                    images: imageUrls,
                    status: 'pending' // explicit
                });

            if (error) throw error;

            toast({
                title: t('store.suggestion.toast.success_title'),
                description: t('store.suggestion.toast.success_desc'),
                duration: 5000
            });

            setIsOpen(false);
            // Reset Form (Optional but good UX)
            setFormData({
                full_name: "", email: "", phone: "", whatsapp: "", telegram: "",
                product_name: "", proposed_price: "", currency: "DZD",
                store_name: "", store_location: "", source_type: "local", description: ""
            });
            setImageUrls([]);
            setHasWhatsapp(false);
            setHasTelegram(false);

        } catch (error: any) {
            console.error(error);
            toast({ title: t('store.suggestion.toast.failed_title'), description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> {t('store.suggestion.btn_trigger')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('store.suggestion.title')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t('store.suggestion.personal_info')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('store.suggestion.full_name')}</Label>
                                <Input required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. Ahmed Benali" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('store.suggestion.phone')}</Label>
                                <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="0550..." />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Email</Label>
                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="hasWa" checked={hasWhatsapp} onCheckedChange={(checked) => setHasWhatsapp(checked as boolean)} />
                                <Label htmlFor="hasWa">{t('store.suggestion.whatsapp_label')}</Label>
                            </div>
                            {hasWhatsapp && (
                                <Input
                                    placeholder={t('store.suggestion.whatsapp_placeholder')}
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                />
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox id="hasTg" checked={hasTelegram} onCheckedChange={(checked) => setHasTelegram(checked as boolean)} />
                                <Label htmlFor="hasTg">{t('store.suggestion.telegram_label')}</Label>
                            </div>
                            {hasTelegram && (
                                <Input
                                    placeholder={t('store.suggestion.telegram_placeholder')}
                                    value={formData.telegram}
                                    onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t('store.suggestion.product_details')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('store.suggestion.product_name')}</Label>
                                <Input required value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('store.suggestion.proposed_price')}</Label>
                                <div className="flex gap-2">
                                    <Input required type="number" step="0.01" value={formData.proposed_price} onChange={e => setFormData({ ...formData, proposed_price: e.target.value })} />
                                    <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DZD">DZD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('store.suggestion.photos_label')}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {imageUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square border rounded-md overflow-hidden group">
                                        <img src={url} alt="Preview" className="object-cover w-full h-full" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                    {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                                    <span className="text-xs text-muted-foreground mt-2">{t('store.suggestion.upload')}</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t('store.suggestion.source_info')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('store.suggestion.store_name')}</Label>
                                <Input value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} placeholder="e.g. Boutique Algiers" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('store.suggestion.source_type')}</Label>
                                <Select value={formData.source_type} onValueChange={v => setFormData({ ...formData, source_type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">{t('store.suggestion.source_types.local')}</SelectItem>
                                        <SelectItem value="imported">{t('store.suggestion.source_types.imported')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('store.suggestion.store_location')}</Label>
                            <Input value={formData.store_location} onChange={e => setFormData({ ...formData, store_location: e.target.value })} placeholder="City, Wilaya" />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('store.suggestion.notes')}</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder={t('store.suggestion.notes_placeholder')} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>{t('store.suggestion.cancel')}</Button>
                        <Button type="submit" disabled={loading || uploading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('store.suggestion.submit')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
