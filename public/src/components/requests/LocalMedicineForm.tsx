// @ts-nocheck
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, Upload } from "lucide-react";
import { PersonalInfoSection } from "./shared/PersonalInfoSection";

export default function LocalMedicineForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
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

    const [formData, setFormData] = useState({
        fullName: "",
        city: "",
        email: "",
        phone: "",
        contactType: { whatsapp: false, telegram: false },
        contactValues: { whatsapp: "", telegram: "" },
        medicineName: "",
        prescriptionFile: null as File | null,
        title: "",
        category: "humanitarian",
        wilaya: "",
        wilayaId: null as number | null,
        financialAbility: "cannot_pay" as "can_pay" | "cannot_pay" | "partially",
        affordAmount: "",
        needDelivery: "no" as "paid" | "free" | "no",
        urgency: "normal" as "urgent" | "normal",
        notes: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, prescriptionFile: e.target.files[0] });
        }
    };

    const uploadPrescription = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `prescriptions/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('alkhayr-prescriptions')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('alkhayr-prescriptions')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading prescription:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate
            if (!formData.fullName.trim()) {
                toast({ title: t('alkhayr.local.form.fullName'), description: 'Required', variant: 'destructive' });
                setLoading(false);
                return;
            }

            if (!formData.city.trim()) {
                toast({ title: t('alkhayr.local.form.city'), description: 'Required', variant: 'destructive' });
                setLoading(false);
                return;
            }

            // Validate Email
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast({ title: "Email", description: "Email valide requis", variant: 'destructive' });
                setLoading(false);
                return;
            }

            // Validate Contact
            if (!formData.phone.trim()) {
                toast({ title: t('alkhayr.local.form.contact'), description: 'Numéro de téléphone requis', variant: 'destructive' });
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

            if (!formData.medicineName.trim()) {
                toast({ title: t('alkhayr.local.form.medicineName'), description: 'Required', variant: 'destructive' });
                setLoading(false);
                return;
            }

            // Upload prescription if provided
            let prescriptionUrl = null;
            if (formData.prescriptionFile) {
                prescriptionUrl = await uploadPrescription(formData.prescriptionFile);
                if (!prescriptionUrl) {
                    toast({
                        title: t('order.validation.error'),
                        description: 'Failed to upload prescription',
                        variant: 'destructive'
                    });
                    setLoading(false);
                    return;
                }
            }

            // Insert into unified database
            const { error } = await supabase
                .from('medicine_requests')
                .insert({
                    request_type: 'local',
                    full_name: formData.fullName,
                    city: formData.city,
                    email: formData.email,
                    // contact_type: contactTypes.join(", "), // Not in V2 Schema, map to admin_notes?
                    // V2 Schema has phone_number
                    phone_number: formData.contactValue || formData.phone,

                    title: formData.title,
                    category: formData.category,
                    wilaya: formData.wilaya,
                    wilaya_id: formData.wilayaId,
                    medicine_name: formData.medicineName,
                    prescription_url: prescriptionUrl,
                    financial_ability: formData.financialAbility,
                    afford_amount: formData.affordAmount ? parseFloat(formData.affordAmount) : null,

                    // need_delivery in DB is TEXT (Line 30 migration: need_delivery TEXT)??
                    // Wait, migration said `need_delivery TEXT`? 
                    // Let's check migration again.
                    // Line 30: `need_delivery TEXT,`
                    // In AlkhayrSubmit I passed boolean `formData.needDelivery`.
                    // DB might cast or fail if schema is strict.
                    // If migration defined TEXT, I should pass text 'true'/'false' or 'paid'/'free'/'no'.
                    // LocalMedicineForm uses 'paid'|'free'|'no' (enum-like).
                    // AlkhayrSubmit uses boolean.
                    // I should standardize. If DB column is TEXT, 'paid'/'free' is better.
                    // Boolean will be cast to 'true'/'false'.
                    // I will keep it as is here (passing string is fine).

                    need_delivery: formData.needDelivery,
                    urgency: formData.urgency,
                    // Map extra contact info to admin_notes or description
                    admin_notes: (formData.notes || '') + '\n\nContact Details: ' + contactDetails.join(" | "),
                    status: 'pending',
                    approved: false
                });

            if (error) {
                console.error('Error submitting request:', error);
                toast({
                    title: t('order.error.title'),
                    description: t('order.error.generic'),
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: t('alkhayr.local.success.title'),
                    description: t('alkhayr.local.success.desc')
                });
                navigate('/alkhayr/requests');
            }
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
                    <Heart className="h-10 w-10 text-primary charity-pulse" />
                    <h1 className="text-3xl sm:text-4xl font-bold charity-text-gradient">{t('alkhayr.local.title')}</h1>
                </div>
                <p className="text-base md:text-lg text-foreground/80 font-medium max-w-2xl mx-auto">{t('alkhayr.local.subtitle')}</p>
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground/80">
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
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.local.form.medicineName')}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="medicineName" className="text-xs font-medium">{t('alkhayr.local.form.medicineName')} *</Label>
                                        <Input
                                            id="medicineName"
                                            placeholder={t('alkhayr.local.form.medicineNamePlaceholder')}
                                            value={formData.medicineName}
                                            onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                                            className="h-10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prescription" className="text-xs font-medium">{t('alkhayr.local.form.prescription')}</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="prescription"
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                className="cursor-pointer h-10 pt-2"
                                            />
                                        </div>
                                        {formData.prescriptionFile && (
                                            <p className="text-xs text-muted-foreground pl-1">
                                                📎 {formData.prescriptionFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial & Delivery */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <Heart className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.local.form.financialAbility')} & {t('alkhayr.local.form.needDelivery')}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-medium">{t('alkhayr.local.form.financialAbility')}</Label>
                                        <RadioGroup
                                            value={formData.financialAbility}
                                            onValueChange={(value: "can_pay" | "cannot_pay" | "partially") =>
                                                setFormData({ ...formData, financialAbility: value })
                                            }
                                            className="grid sm:grid-cols-3 gap-3"
                                        >
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.financialAbility === 'can_pay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="can_pay" id="can_pay" className="sr-only" />
                                                <span>{t('alkhayr.local.form.canPay')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.financialAbility === 'cannot_pay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="cannot_pay" id="cannot_pay" className="sr-only" />
                                                <span>{t('alkhayr.local.form.cannotPay')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.financialAbility === 'partially' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="partially" id="partially" className="sr-only" />
                                                <span>{t('alkhayr.local.form.canPayPartially')}</span>
                                            </label>
                                        </RadioGroup>
                                    </div>

                                    {(formData.financialAbility === 'can_pay' || formData.financialAbility === 'partially') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="affordAmount" className="text-xs font-medium">{t('alkhayr.local.form.affordAmount')} (DZD)</Label>
                                            <Input
                                                id="affordAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.affordAmount}
                                                onChange={(e) => setFormData({ ...formData, affordAmount: e.target.value })}
                                                className="h-10"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Label className="text-xs font-medium">{t('alkhayr.local.form.needDelivery')}</Label>
                                        <RadioGroup
                                            value={formData.needDelivery}
                                            onValueChange={(value: "paid" | "free" | "no") =>
                                                setFormData({ ...formData, needDelivery: value })
                                            }
                                            className="grid sm:grid-cols-3 gap-3"
                                        >
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.needDelivery === 'paid' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="paid" id="paid" className="sr-only" />
                                                <span>{t('alkhayr.local.form.paidDelivery')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.needDelivery === 'free' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="free" id="free" className="sr-only" />
                                                <span>{t('alkhayr.local.form.freeDelivery')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.needDelivery === 'no' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="no" id="no" className="sr-only" />
                                                <span>{t('alkhayr.local.form.noDelivery')}</span>
                                            </label>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-medium">{t('alkhayr.local.form.urgency')}</Label>
                                        <RadioGroup
                                            value={formData.urgency}
                                            onValueChange={(value: "urgent" | "normal") =>
                                                setFormData({ ...formData, urgency: value })
                                            }
                                            className="grid grid-cols-2 gap-3"
                                        >
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.urgency === 'urgent' ? 'border-red-500 bg-red-50' : 'border-border hover:border-red-200'}`}>
                                                <RadioGroupItem value="urgent" id="urgent" className="sr-only" />
                                                <span className="text-red-600 font-semibold flex items-center gap-1">🚨 {t('alkhayr.local.form.urgent')}</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all text-xs ${formData.urgency === 'normal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                <RadioGroupItem value="normal" id="normal" className="sr-only" />
                                                <span>{t('alkhayr.local.form.normal')}</span>
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
                                    <Label htmlFor="notes" className="text-xs font-medium">{t('alkhayr.local.form.notes')}</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-lg shadow-md transition-all hover:scale-[1.01]" size="lg" disabled={loading}>
                                    {loading ? t('alkhayr.local.form.submitting') : t('alkhayr.local.form.submit')}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Right - Info */}
                <div className="space-y-5 lg:sticky lg:top-8 h-fit">
                    <Card className="border border-info/40 bg-info/5 shadow-sm">
                        <CardContent className="p-5 space-y-3 text-sm">
                            <div className="flex items-center justify-center">
                                <Heart className="w-10 h-10 text-primary" />
                            </div>
                            <p className="font-medium">{t('alkhayr.local.subtitle')}</p>
                            <p className="text-xs text-foreground/70">ℹ️ Votre demande sera examinée par notre équipe avant d'être approuvée et visible aux bénévoles.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
