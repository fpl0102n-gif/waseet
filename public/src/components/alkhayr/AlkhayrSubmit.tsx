import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pill, User, MapPin, FileText, CheckCircle, Globe, Stethoscope, Truck, Coins, AlertCircle } from 'lucide-react';

const ALGERIAN_WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
    'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Menia'
];

const AlkhayrSubmit = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [requestType, setRequestType] = useState('local'); // 'local' or 'foreign'

    const [formData, setFormData] = useState({
        requesterName: '',
        contactNumber: '',
        email: '',
        medicineName: '',
        images: [] as File[],
        description: '',
        wilaya: '',
        city: '',
        isUrgent: false,

        // Foreign specific
        country: '',
        prescriptionImages: [] as File[],

        // New Private Fields
        hasWhatsapp: false,
        whatsapp: '',
        hasTelegram: false,
        telegram: '',

        financialAbility: 'none', // 'full', 'partial', 'none'
        offeredAmount: '',

        needDelivery: false,

        userPriority: 'normal', // 'normal', 'important', 'urgent'

        confirmInfo: false
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'prescriptionImages') => {
        if (e.target.files && e.target.files.length > 0) {
            setFormData({ ...formData, [field]: Array.from(e.target.files) });
        }
    };

    const validateForm = () => {
        if (!formData.requesterName || !formData.contactNumber || !formData.medicineName || !formData.city) {
            toast({ title: t('alkhayr_public.submit.errors.required'), description: t('alkhayr_public.submit.errors.required'), variant: 'destructive' });
            return false;
        }
        if (requestType === 'local' && !formData.wilaya) {
            toast({ title: t('alkhayr_public.submit.errors.required'), description: t('alkhayr_public.submit.errors.wilaya'), variant: 'destructive' });
            return false;
        }
        if (requestType === 'foreign' && !formData.country) {
            toast({ title: t('alkhayr_public.submit.errors.required'), description: t('alkhayr_public.submit.errors.country'), variant: 'destructive' });
            return false;
        }
        if (!formData.confirmInfo) {
            toast({ title: t('alkhayr_public.submit.errors.required'), description: t('alkhayr_public.submit.errors.confirm'), variant: 'destructive' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const detailImageUrls: string[] = [];
            let mainImageUrl: string | null = null;

            const prescriptionImageUrls: string[] = [];
            let mainPrescriptionUrl: string | null = null;

            // Unified Table
            const tableName = 'medicine_requests';

            // Upload Logic for Medicine Images
            if (formData.images.length > 0) {
                for (const file of formData.images) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('medicine-images').upload(fileName, file);
                    if (!uploadError) {
                        const { data } = supabase.storage.from('medicine-images').getPublicUrl(fileName);
                        detailImageUrls.push(data.publicUrl);
                    }
                }
                if (detailImageUrls.length > 0) {
                    mainImageUrl = detailImageUrls[0];
                }
            }

            // Upload Logic for Prescription Images
            if (formData.prescriptionImages.length > 0 && requestType === 'foreign') {
                for (const file of formData.prescriptionImages) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `prescr_${Math.random()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('medicine-images').upload(fileName, file);
                    if (!uploadError) {
                        const { data } = supabase.storage.from('medicine-images').getPublicUrl(fileName);
                        prescriptionImageUrls.push(data.publicUrl);
                    }
                }
                if (prescriptionImageUrls.length > 0) {
                    mainPrescriptionUrl = prescriptionImageUrls[0];
                }
            }

            // Insert Data Mapping
            const payload: any = {
                // Unified request type
                request_type: requestType, // 'local' or 'foreign'

                full_name: formData.requesterName,

                // Mapped to phone_number in DB
                phone_number: formData.contactNumber,

                email: formData.email,
                city: formData.city,
                status: 'pending',
                is_urgent: formData.isUrgent,
                // urgent_note is not in V2 schema, ignoring or adding to admin_notes if needed? 
                // V2 schema has admin_notes but not urgent_note. 
                // I will append it to description or ignore if not critical. 
                // User requirement: "All fields must be preserved or mapped".
                // I'll leave urgent_note out for now as it seems to be computed.

                // priority maps to is_urgent logic usually, but let's check schema. V2 has urgency (text) and is_urgent (bool).
                urgency: formData.userPriority, // maps to 'normal', 'important', etc.

                // New Private Fields
                // whatsapp/telegram not in V2 schema explicitly? 
                // Wait, schema has specific columns? 
                // My migration script:
                /* 
                    phone_number TEXT,
                    email TEXT,
                    ...
                */
                // It does NOT have whatsapp/telegram columns. 
                // I should store them in `admin_notes` or `description` for now to avoid losing data? 
                // Or I missed them in migration. Migration had: 
                // `phone_number TEXT, -- Migrated from contact_value`
                // `contact_type` was dropped/ignored?
                // Migration line 16: `phone_number TEXT, -- contact_value`
                // Migration line 17: `contact_type TEXT,` << YES IT IS THERE!
                // Wait, let me check the migration content again.

                // Schema Line 17: `contact_type TEXT`? NO. 
                // Let's re-read migration `20260104_merge_medicine_requests.sql` content I generated.
                // Line 16: `phone_number TEXT, -- Migrated from contact_value`
                // Line 17: `email TEXT,`
                // It does NOT seem to have `contact_type` or `whatsapp`.
                // I MUST map extra contacts to `admin_notes` or similar.

                financial_ability: formData.financialAbility,
                afford_amount: formData.financialAbility === 'partial' ? formData.offeredAmount : null,
                need_delivery: formData.needDelivery,

                // Explicit Fields (New Schema)
                whatsapp: formData.hasWhatsapp ? formData.whatsapp : null,
                telegram: formData.hasTelegram ? formData.telegram : null,
                detail_images: detailImageUrls, // Array of URLs

                prescription_url: mainPrescriptionUrl // Keep main one for thumbnail usage
            };

            // Map Description Cleanly
            // Remove the hacky admin_notes append
            payload.admin_notes = ""; // Reset or leave empty for actual admin usage

            if (requestType === 'local') {
                payload.medicine_name = formData.medicineName;
                payload.wilaya = formData.wilaya;
                payload.description = formData.description || "";
            } else {
                payload.medicine_name = formData.medicineName;
                payload.description = formData.description || "";
                payload.expected_country = formData.country;
                payload.need_type = 'medicine';
            }

            const { error } = await supabase.from(tableName).insert(payload);

            if (error) throw error;

            // Direct Email Invocation (Restored for reliability)
            // We rely on Client to send the email, and we MUST ensure DB triggers are disabled to avoid duplicates.
            console.log("Invoking Alkhayr email (Client-Side)...");
            const emailType = requestType === 'local' ? 'alkhayr_request_local' : 'alkhayr_request_foreign';

            // Construct payload matching the DB record structure for consistency
            const emailPayload = {
                ...payload,
                id: 'new',
                created_at: new Date().toISOString(),
                // Ensure explicit fields for template
                expected_country: formData.country,
                urgency: formData.userPriority,
                is_urgent: formData.isUrgent
            };

            supabase.functions.invoke('send-email', {
                body: {
                    type: emailType,
                    record: emailPayload
                }
            }).then(({ data, error }) => {
                if (error) console.error("Email API Error:", error);
                else console.log("Email API Success:", data);
            });

            setSuccess(true);
            toast({ title: t('alkhayr_public.submit.toast.success.title'), description: t('alkhayr_public.submit.toast.success.desc') });

        } catch (error) {
            console.error('Error submitting:', error);
            toast({ title: t('alkhayr_public.submit.errors.submit'), description: t('alkhayr_public.submit.errors.submit'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="border-[#2E7D32]/20 bg-[#F1F8E9]/50 shadow-lg text-center p-8">
                    <CardContent className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-[#2E7D32]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-[#1F2933]">{t('alkhayr_public.submit.success.title')}</h3>
                            <p className="text-[#374151]">
                                {t('alkhayr_public.submit.success.desc')}
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setSuccess(false);
                                setFormData({
                                    requesterName: '', contactNumber: '', email: '', medicineName: '', images: [], description: '', wilaya: '', city: '',
                                    isUrgent: false, country: '', prescriptionImages: [],
                                    hasWhatsapp: false, whatsapp: '', hasTelegram: false, telegram: '',
                                    financialAbility: 'none', offeredAmount: '', needDelivery: false, userPriority: 'normal', confirmInfo: false
                                });
                            }}
                            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
                        >
                            {t('alkhayr_public.submit.success.btn_new')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold text-[#1B5E20]">{t('alkhayr_public.submit.title')}</CardTitle>
                    <CardDescription className="text-lg">
                        {t('alkhayr_public.submit.desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={requestType} onValueChange={setRequestType} className="w-full mb-8">
                        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-green-50 border border-green-100 h-auto p-1">
                            <TabsTrigger value="local" className="py-2.5 data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white">
                                <MapPin className="h-4 w-4 mr-2" /> {t('alkhayr_public.submit.tabs.local')}
                            </TabsTrigger>
                            <TabsTrigger value="foreign" className="py-2.5 data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white">
                                <Globe className="h-4 w-4 mr-2" /> {t('alkhayr_public.submit.tabs.foreign')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Medication Info */}
                        <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2E7D32]">
                                <Pill className="h-5 w-5" /> {t('alkhayr_public.submit.sections.medication')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="medicineName">{t('alkhayr_public.submit.form.medName')}</Label>
                                    <Input
                                        id="medicineName"
                                        className="focus-visible:ring-[#2E7D32]"
                                        value={formData.medicineName}
                                        onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="images">{t('alkhayr_public.submit.form.images')}</Label>
                                    <Input
                                        id="images"
                                        type="file"
                                        multiple
                                        onChange={(e) => handleFileChange(e, 'images')}
                                        className="focus-visible:ring-[#2E7D32]"
                                    />
                                    <p className="text-xs text-gray-500">{t('alkhayr_public.submit.form.imagesHelp')}</p>
                                </div>
                                {requestType === 'foreign' && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="prescriptionImages">{t('alkhayr_public.submit.form.prescription')}</Label>
                                        <Input
                                            id="prescriptionImages"
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange(e, 'prescriptionImages')}
                                            className="focus-visible:ring-[#2E7D32]"
                                            required={requestType === 'foreign'}
                                        />
                                        <p className="text-xs text-gray-500">{t('alkhayr_public.submit.form.prescriptionHelp')}</p>
                                    </div>
                                )}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">{t('alkhayr_public.submit.form.desc')}</Label>
                                    <Textarea
                                        id="description"
                                        className="focus-visible:ring-[#2E7D32]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        placeholder={t('alkhayr_public.submit.form.descPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Requester Info (Extended) */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2E7D32]">
                                    <User className="h-5 w-5" /> {t('alkhayr_public.submit.sections.requester')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="requesterName">{t('alkhayr_public.submit.form.requesterName')}</Label>
                                        <Input
                                            id="requesterName"
                                            className="focus-visible:ring-[#2E7D32]"
                                            value={formData.requesterName}
                                            onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                                            required
                                            placeholder={t('alkhayr_public.submit.form.requesterPlaceholder')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">{t('alkhayr_public.submit.form.phone')}</Label>
                                        <Input
                                            id="contactNumber"
                                            type="tel"
                                            className="focus-visible:ring-[#2E7D32]"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            required
                                            placeholder={t('alkhayr_public.submit.form.phonePlaceholder')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="focus-visible:ring-[#2E7D32]"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                        />
                                    </div>

                                    {/* Extended Contact Links */}
                                    <div className="space-y-3 pt-2 border-t text-sm">
                                        <Label className="text-xs text-gray-500 uppercase tracking-wide">{t('alkhayr_public.submit.form.otherContacts')}</Label>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasWhatsapp"
                                                checked={formData.hasWhatsapp}
                                                onCheckedChange={(c) => setFormData({ ...formData, hasWhatsapp: c as boolean })}
                                            />
                                            <Label htmlFor="hasWhatsapp" className="cursor-pointer">{t('alkhayr_public.submit.form.whatsapp')}</Label>
                                        </div>
                                        {formData.hasWhatsapp && (
                                            <Input
                                                placeholder={t('contact.whatsapp_title')}
                                                value={formData.whatsapp}
                                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                className="mt-1"
                                            />
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasTelegram"
                                                checked={formData.hasTelegram}
                                                onCheckedChange={(c) => setFormData({ ...formData, hasTelegram: c as boolean })}
                                            />
                                            <Label htmlFor="hasTelegram" className="cursor-pointer">{t('alkhayr_public.submit.form.telegram')}</Label>
                                        </div>
                                        {formData.hasTelegram && (
                                            <Input
                                                placeholder={t('contact.telegram_title')}
                                                value={formData.telegram}
                                                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                                                className="mt-1"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2E7D32]">
                                    <MapPin className="h-5 w-5" /> {t('alkhayr_public.submit.sections.location')}
                                </h3>
                                <div className="space-y-4">
                                    {requestType === 'local' ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="wilaya">{t('alkhayr_public.submit.form.wilaya')}</Label>
                                            <Select value={formData.wilaya} onValueChange={(value) => setFormData({ ...formData, wilaya: value })}>
                                                <SelectTrigger className="focus:ring-[#2E7D32]"><SelectValue placeholder={t('alkhayr_public.filter.all')} /></SelectTrigger>
                                                <SelectContent className="max-h-[300px]">{ALGERIAN_WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label htmlFor="country">{t('alkhayr_public.submit.form.country')}</Label>
                                            <Input
                                                id="country"
                                                placeholder={t('alkhayr_public.submit.form.countryPlaceholder')}
                                                className="focus-visible:ring-[#2E7D32]"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="city">{t('alkhayr_public.submit.form.city')}</Label>
                                        <Input
                                            id="city"
                                            className="focus-visible:ring-[#2E7D32]"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Financial & Logistics (New) */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2E7D32]">
                                    <Coins className="h-5 w-5" /> {t('alkhayr_public.submit.sections.financial')}
                                </h3>
                                <div className="space-y-4">
                                    <RadioGroup
                                        value={formData.financialAbility}
                                        onValueChange={(v) => {
                                            const updates: any = { financialAbility: v };
                                            if (v === 'delivery_only') {
                                                updates.needDelivery = true;
                                            }
                                            setFormData({ ...formData, ...updates });
                                        }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="full" id="fin-full" />
                                            <Label htmlFor="fin-full" className="cursor-pointer">{t('alkhayr_public.submit.form.financialOptions.full')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="partial" id="fin-partial" />
                                            <Label htmlFor="fin-partial" className="cursor-pointer">{t('alkhayr_public.submit.form.financialOptions.partial')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="none" id="fin-none" />
                                            <Label htmlFor="fin-none" className="cursor-pointer">{t('alkhayr_public.submit.form.financialOptions.none')}</Label>
                                        </div>

                                        {/* New Option: Delivery Only (Requested for Foreign, but useful for all) */}
                                        {requestType === 'foreign' && (
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="delivery_only" id="fin-delivery" />
                                                <Label htmlFor="fin-delivery" className="cursor-pointer font-medium text-blue-700">{t('alkhayr_public.submit.form.financialOptions.delivery')}</Label>
                                            </div>
                                        )}
                                    </RadioGroup>

                                    {formData.financialAbility === 'partial' && (
                                        <div className="ml-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label htmlFor="offeredAmount">{t('alkhayr_public.submit.form.amount')}</Label>
                                            <Input
                                                id="offeredAmount"
                                                type="text"
                                                placeholder="Ex: 5000 DA"
                                                value={formData.offeredAmount}
                                                onChange={(e) => setFormData({ ...formData, offeredAmount: e.target.value })}
                                                className="focus-visible:ring-[#2E7D32]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-[#2E7D32]">
                                    <Truck className="h-5 w-5" /> {t('alkhayr_public.submit.sections.logistics')}
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-base">{t('alkhayr_public.submit.form.delivery')}</Label>
                                        <div className="flex gap-4">
                                            <Button
                                                type="button"
                                                variant={formData.needDelivery ? "default" : "outline"}
                                                onClick={() => setFormData({ ...formData, needDelivery: true })}
                                                className={formData.needDelivery ? "bg-[#2E7D32]" : ""}
                                            >
                                                {t('yes', { defaultValue: 'Oui' })}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={!formData.needDelivery ? "default" : "outline"}
                                                onClick={() => setFormData({ ...formData, needDelivery: false })}
                                                className={!formData.needDelivery ? "bg-gray-600" : ""}
                                            >
                                                {t('no', { defaultValue: 'Non' })}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base">{t('alkhayr_public.submit.form.priority.label')}</Label>
                                        <Select value={formData.userPriority} onValueChange={(v) => setFormData({ ...formData, userPriority: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">{t('alkhayr_public.submit.form.priority.normal')}</SelectItem>
                                                <SelectItem value="important">{t('alkhayr_public.submit.form.priority.important')}</SelectItem>
                                                <SelectItem value="urgent">{t('alkhayr_public.submit.form.priority.urgent')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">
                                            {t('alkhayr_public.submit.form.priority.help')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Urgency Checkbox (Vital) - Renamed Section for Clarity */}
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <Checkbox
                                id="isUrgent"
                                className="mt-1 data-[state=checked]:bg-red-600 border-red-300"
                                checked={formData.isUrgent}
                                onCheckedChange={(c) => setFormData({ ...formData, isUrgent: c as boolean })}
                            />
                            <div>
                                <label htmlFor="isUrgent" className="font-semibold text-red-900 cursor-pointer flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {t('alkhayr_public.submit.form.urgent_checkbox.label')}
                                </label>
                                <p className="text-sm text-red-700">{t('alkhayr_public.submit.form.urgent_checkbox.desc')}</p>
                            </div>
                        </div>

                        {/* Explicit Confirmation */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Checkbox
                                id="confirmInfo"
                                checked={formData.confirmInfo}
                                onCheckedChange={(c) => setFormData({ ...formData, confirmInfo: c as boolean })}
                                required
                            />
                            <Label htmlFor="confirmInfo" className="cursor-pointer text-sm leading-relaxed">
                                {t('alkhayr_public.submit.form.confirm')}
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-semibold bg-[#2E7D32] hover:bg-[#1B5E20] shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                            disabled={loading}
                        >
                            {loading ? t('alkhayr_public.submit.form.submitting') : t('alkhayr_public.submit.form.submitBtn')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
};

export default AlkhayrSubmit;
