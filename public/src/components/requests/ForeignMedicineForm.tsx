
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Upload } from 'lucide-react';
import { PersonalInfoSection } from './shared/PersonalInfoSection';

const ForeignMedicineForm = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [wilayas, setWilayas] = useState<any[]>([]);

    useEffect(() => {
        const fetchWilayas = async () => {
            const { data } = await supabase.from('wilayas').select('*').order('code');
            setWilayas(data || []);
        };
        fetchWilayas();
    }, []);

    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        city: '',
        phone: '',
        email: '',
        contactType: { whatsapp: false, telegram: false },
        contactValues: { whatsapp: '', telegram: '' },
        medicineDetails: '',
        expectedCountry: '',
        needType: 'purchase_and_shipping' as 'purchase_and_shipping' | 'shipping_only',
        financialAbility: 'can_pay' as 'can_pay' | 'cannot_pay' | 'partially',
        budget: '',
        urgency: 'normal' as 'urgent' | 'normal',
        notes: '',
        title: '',
        category: 'humanitarian',
        wilaya: '',
        wilayaId: null as number | null
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPrescriptionFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.fullName || !formData.city || !formData.medicineDetails || !prescriptionFile) {
                toast({
                    title: t('order.validation.error'),
                    description: t('order.validation.name_required'),
                    variant: 'destructive'
                });
                setLoading(false);
                return;
            }

            // File Validation
            if (prescriptionFile) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

                if (prescriptionFile.size > maxSize) {
                    toast({ title: "Fichier trop volumineux", description: "La taille maximale est de 5MB.", variant: "destructive" });
                    setLoading(false);
                    return;
                }
                if (!allowedTypes.includes(prescriptionFile.type)) {
                    toast({ title: "Format invalide", description: "Formats acceptés: JPG, PNG, WEBP, PDF.", variant: "destructive" });
                    setLoading(false);
                    return;
                }
            }

            // Validate Email
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast({ title: "Email", description: "Email valide requis", variant: 'destructive' });
                setLoading(false);
                return;
            }

            // Validate Contact
            if (!formData.phone.trim()) {
                toast({ title: t('alkhayr.foreign.form.contact'), description: 'Numéro de téléphone requis', variant: 'destructive' });
                setLoading(false);
                return;
            }

            const contactTypes = ["phone"];
            const contactDetails = [`Phone: ${formData.phone}`];

            if (formData.contactType.whatsapp) {
                if (!formData.contactValues.whatsapp.trim()) {
                    toast({ title: "WhatsApp", description: "Veuillez entrer votre numéro WhatsApp", variant: "destructive" });
                    setLoading(false);
                    return;
                }
                contactTypes.push("whatsapp");
                contactDetails.push(`WhatsApp: ${formData.contactValues.whatsapp}`);
            }

            if (formData.contactType.telegram) {
                if (!formData.contactValues.telegram.trim()) {
                    toast({ title: "Telegram", description: "Veuillez entrer votre nom d'utilisateur Telegram", variant: "destructive" });
                    setLoading(false);
                    return;
                }
                contactTypes.push("telegram");
                contactDetails.push(`Telegram: ${formData.contactValues.telegram}`);
            }

            // Upload prescription file
            const fileExt = prescriptionFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('alkhayr-prescriptions')
                .upload(filePath, prescriptionFile);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast({
                    title: t('order.error.title'),
                    description: t('order.error.generic'),
                    variant: 'destructive'
                });
                setLoading(false);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('alkhayr-prescriptions')
                .getPublicUrl(filePath);

            // Insert request into unified database
            const { error: insertError } = await supabase
                .from('medicine_requests')
                .insert({
                    request_type: 'foreign',
                    full_name: formData.fullName,
                    city: formData.city,
                    email: formData.email,
                    // contact_type: contactTypes.join(", "), // Map to admin_notes?
                    phone_number: formData.phone,

                    title: formData.title,
                    category: formData.category,
                    wilaya: formData.wilaya,
                    wilaya_id: formData.wilayaId,

                    // Map medicineDetails to medicine_name (shared column) or description?
                    // Migration: medicine_name TEXT -- Migrated from ... medicine_details (foreign)
                    medicine_name: formData.medicineDetails,

                    prescription_url: publicUrl,
                    expected_country: formData.expectedCountry,
                    need_type: formData.needType,
                    financial_ability: formData.financialAbility,
                    // Foreign form has budget, mapped to budget?
                    // Foreign form has budget, mapped to budget?
                    // Migration line 36: budget NUMERIC
                    afford_amount: formData.budget ? parseFloat(formData.budget) : null,

                    urgency: formData.urgency,
                    is_urgent: formData.urgency === 'urgent', // Map explicitly to boolean flag
                    admin_notes: (formData.notes || '') + '\n\nContact Details: ' + contactDetails.join(" | "),
                    status: 'pending'
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                toast({
                    title: t('order.error.title'),
                    description: t('order.error.generic'),
                    variant: 'destructive'
                });
                setLoading(false);
                return;
            }

            toast({
                title: t('alkhayr.foreign.success.title'),
                description: t('alkhayr.foreign.success.desc')
            });

            // Reset form
            setFormData({
                fullName: '',
                city: '',
                email: '',
                phone: '',
                contactType: { whatsapp: false, telegram: false },
                contactValues: { whatsapp: '', telegram: '' },
                medicineDetails: '',
                expectedCountry: '',
                needType: 'purchase_and_shipping',
                financialAbility: 'can_pay',
                budget: '',
                urgency: 'normal',
                notes: '',
                title: '',
                category: 'humanitarian',
                wilaya: '',
                wilayaId: null
            });
            setPrescriptionFile(null);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: t('order.error.title'),
                description: t('order.error.generic'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto py-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Globe className="h-10 w-10 text-primary charity-pulse" />
                    <h1 className="text-3xl sm:text-4xl font-bold charity-text-gradient">
                        {t('alkhayr.foreign.title')}
                    </h1>
                </div>
                <p className="text-base md:text-lg text-foreground/80 font-medium max-w-2xl mx-auto">
                    {t('alkhayr.foreign.subtitle')}
                </p>
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground/80 max-w-2xl mx-auto">
                    ℹ️ <strong>Note:</strong> Votre demande sera examinée par notre équipe avant d'être approuvée et visible aux bénévoles.
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Personal Info */}
                        <PersonalInfoSection formData={formData} setFormData={setFormData} wilayas={wilayas} t={t} />

                        {/* Request Details */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <Upload className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.foreign.form.medicineName')}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="medicineDetails">{t('alkhayr.foreign.form.medicineName')} *</Label>
                                        <Textarea
                                            id="medicineDetails"
                                            placeholder={t('alkhayr.foreign.form.medicineNamePlaceholder')}
                                            value={formData.medicineDetails}
                                            onChange={(e) => setFormData({ ...formData, medicineDetails: e.target.value })}
                                            className="resize-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prescription">{t('alkhayr.foreign.form.prescription')} *</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="prescription"
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                required
                                                className="cursor-pointer pt-2"
                                            />
                                        </div>
                                        {prescriptionFile && (
                                            <p className="text-xs text-muted-foreground pl-1">📎 {prescriptionFile.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expectedCountry">{t('alkhayr.foreign.form.expectedCountry')}</Label>
                                        <Input
                                            id="expectedCountry"
                                            placeholder={t('alkhayr.foreign.form.expectedCountryPlaceholder')}
                                            value={formData.expectedCountry}
                                            onChange={(e) => setFormData({ ...formData, expectedCountry: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logistics */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <Globe className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.foreign.form.needType')} & {t('alkhayr.foreign.form.financialAbility')}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>{t('alkhayr.foreign.form.needType')} *</Label>
                                        <RadioGroup
                                            value={formData.needType}
                                            onValueChange={(value: 'purchase_and_shipping' | 'shipping_only') =>
                                                setFormData({ ...formData, needType: value })
                                            }
                                            className="grid sm:grid-cols-2 gap-3"
                                        >
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.needType === 'purchase_and_shipping' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="purchase_and_shipping" id="purchase_and_shipping" className="sr-only" />
                                                <span>{t('alkhayr.foreign.form.purchaseAndShipping')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.needType === 'shipping_only' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="shipping_only" id="shipping_only" className="sr-only" />
                                                <span>{t('alkhayr.foreign.form.shippingOnly')}</span>
                                            </label>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t('alkhayr.foreign.form.financialAbility')} *</Label>
                                        <Select
                                            value={formData.financialAbility}
                                            onValueChange={(value: 'can_pay' | 'cannot_pay' | 'partially') =>
                                                setFormData({ ...formData, financialAbility: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="can_pay">{t('alkhayr.foreign.form.canPay')}</SelectItem>
                                                <SelectItem value="cannot_pay">{t('alkhayr.foreign.form.cannotPay')}</SelectItem>
                                                <SelectItem value="partially">{t('alkhayr.foreign.form.canPayPartially')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.financialAbility !== 'cannot_pay' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="budget">{t('alkhayr.foreign.form.budget')}</Label>
                                            <Input
                                                id="budget"
                                                type="number"
                                                step="0.01"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Label>{t('alkhayr.foreign.form.urgency')} *</Label>
                                        <RadioGroup
                                            value={formData.urgency}
                                            onValueChange={(value: 'urgent' | 'normal') =>
                                                setFormData({ ...formData, urgency: value })
                                            }
                                            className="grid grid-cols-2 gap-3"
                                        >
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.urgency === 'urgent' ? 'border-red-500 bg-red-50' : 'border-border hover:border-red-200'}`}>
                                                <RadioGroupItem value="urgent" id="urgent" className="sr-only" />
                                                <span className="text-red-600 font-semibold">🚨 {t('alkhayr.foreign.form.urgent')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.urgency === 'normal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="normal" id="normal" className="sr-only" />
                                                <span>{t('alkhayr.foreign.form.normal')}</span>
                                            </label>
                                        </RadioGroup>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes & Submit */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">{t('alkhayr.foreign.form.notes')}</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="resize-none"
                                        rows={4}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6 rounded-lg shadow-md transition-all hover:scale-[1.01]" disabled={loading}>
                                    {loading ? t('alkhayr.foreign.form.submitting') : t('alkhayr.foreign.form.submit')}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Right Info */}
                <div className="space-y-5 lg:sticky lg:top-8 h-fit">
                    <Card className="border border-info/40 bg-info/5 shadow-sm">
                        <CardContent className="p-5 space-y-3 text-sm">
                            <div className="flex items-center justify-center">
                                <Globe className="w-10 h-10 text-primary" />
                            </div>
                            <p className="font-medium">{t('alkhayr.foreign.subtitle')}</p>
                            <p className="text-xs text-foreground/70">ℹ️ Votre demande sera examinée par notre équipe avant d'être approuvée et visible aux bénévoles.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ForeignMedicineForm;
