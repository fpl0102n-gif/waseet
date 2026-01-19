import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface DonationFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const ALGERIAN_WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
    'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Menia'
].sort();

export default function DonationForm({ onSuccess, onCancel }: DonationFormProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        has_whatsapp: false,
        has_telegram: false,
        item_name: '',
        category: '',
        condition: '', // new, used_good, used_fair
        location: '',
        description: '',
        consent: false
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        for (const file of files) {
            const fileName = `${Math.random().toString(36).substring(7)}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('donation-images')
                .upload(fileName, file);

            if (data) {
                const { data: publicUrl } = supabase.storage
                    .from('donation-images')
                    .getPublicUrl(fileName);
                newUrls.push(publicUrl.publicUrl);
            }
        }

        setImageUrls([...imageUrls, ...newUrls]);
        setUploading(false);
    };

    const removeImage = (index: number) => {
        const newUrls = [...imageUrls];
        newUrls.splice(index, 1);
        setImageUrls(newUrls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.consent) {
            toast({ title: t('alkhayr_public.submit.errors.required'), description: t('alkhayr_public.submit.errors.confirm'), variant: "destructive" });
            return;
        }

        if (imageUrls.length === 0) {
            toast({ title: "Photos Requises", description: "Veuillez ajouter au moins une photo.", variant: "destructive" });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from('material_donations').insert({
                full_name: formData.full_name,
                phone_number: formData.phone,
                email: formData.email,
                whatsapp: formData.has_whatsapp,
                telegram: formData.has_telegram,
                item_name: formData.item_name,
                category: formData.category,
                condition: formData.condition,
                location: formData.location,
                description: formData.description, // Private description
                images: imageUrls,
                main_image: imageUrls[0],
                status: 'pending' // Pending admin approval
            });

            if (error) throw error;

            // Direct Email Invocation
            console.log("Invoking Material Donation email...");
            supabase.functions.invoke('send-email', {
                body: {
                    type: 'material_donation',
                    record: {
                        full_name: formData.full_name,
                        phone_number: formData.phone,
                        email: formData.email,
                        item_name: formData.item_name,
                        category: formData.category,
                        condition: formData.condition,
                        location: formData.location,
                        id: 'new',
                        created_at: new Date().toISOString()
                    }
                }
            }).then(({ data, error }) => {
                if (error) console.error("Email API Error:", error);
                else console.log("Email API Success:", data);
            });

            if (error) throw error;

            toast({
                title: t('alkhayr_public.donations.form.success_title'),
                description: t('alkhayr_public.donations.form.success_desc'),
                className: "bg-green-600 text-white"
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: t('alkhayr_public.submit.errors.submit'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-green-100 shadow-lg max-w-3xl mx-auto">
            <CardHeader className="bg-green-50/50 border-b border-green-100">
                <CardTitle className="text-xl text-green-800">{t('alkhayr_public.donations.form.title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Donor Info (Private) */}
                    <div className="bg-blue-50/50 p-4 rounded-lg space-y-4 border border-blue-100">
                        <h3 className="font-semibold text-blue-900 text-sm">{t('alkhayr_public.donations.form.donor_info')}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('alkhayr_public.donations.form.name')}</Label>
                                <Input
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('alkhayr_public.donations.form.phone')}</Label>
                                <Input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="whatsapp"
                                    checked={formData.has_whatsapp}
                                    onCheckedChange={(checked) => setFormData({ ...formData, has_whatsapp: checked as boolean })}
                                />
                                <Label htmlFor="whatsapp" className="cursor-pointer font-normal">{t('alkhayr_public.donations.form.has_whatsapp')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="telegram"
                                    checked={formData.has_telegram}
                                    onCheckedChange={(checked) => setFormData({ ...formData, has_telegram: checked as boolean })}
                                />
                                <Label htmlFor="telegram" className="cursor-pointer font-normal">{t('alkhayr_public.donations.form.has_telegram')}</Label>
                            </div>
                        </div>
                    </div>

                    {/* Item Details (Public) */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">{t('alkhayr_public.donations.form.item_details')}</h3>

                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.donations.form.item_name')}</Label>
                            <Input
                                required
                                value={formData.item_name}
                                onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                                placeholder="Ex: Chaise roulante, Glucomètre..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('alkhayr_public.donations.form.category')}</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, category: val })} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('alkhayr_public.donations.form.category')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="medicine">{t('alkhayr_public.donations.card.medicine')}</SelectItem>
                                        <SelectItem value="equipment">{t('alkhayr_public.donations.card.equipment')}</SelectItem>
                                        <SelectItem value="other">{t('alkhayr_public.donations.card.other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('alkhayr_public.donations.form.condition')}</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, condition: val })} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('alkhayr_public.donations.form.condition')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">{t('alkhayr_public.donations.card.new')}</SelectItem>
                                        <SelectItem value="used_good">{t('alkhayr_public.donations.card.used_good')}</SelectItem>
                                        <SelectItem value="used_fair">{t('alkhayr_public.donations.card.used_fair')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.donations.form.location')}</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, location: val })} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wilaya" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {ALGERIAN_WILAYAS.map(w => (
                                        <SelectItem key={w} value={w}>{w}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.donations.form.description')}</Label>
                            <Textarea
                                className="min-h-[100px]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="..."
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.donations.form.photos')}</Label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                                    {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : <Upload className="h-6 w-6 text-gray-400" />}
                                    <span className="text-xs text-gray-500 mt-1">{t('alkhayr_public.donations.form.uploading')}</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                </label>

                                {imageUrls.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 group">
                                        <img src={url} className="w-full h-full object-cover rounded-lg border" />
                                        <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeImage(idx)}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2 pt-4 border-t">
                        <Checkbox
                            id="consent"
                            checked={formData.consent}
                            onCheckedChange={(c) => setFormData({ ...formData, consent: c as boolean })}
                        />
                        <Label htmlFor="consent" className="text-sm text-gray-600 font-normal cursor-pointer leading-tight">
                            {t('alkhayr_public.donations.form.consent')}
                        </Label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading || uploading || !formData.consent}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('alkhayr_public.donations.form.submit')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
