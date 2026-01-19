// @ts-nocheck
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, User, CheckSquare, Wallet, Bell, FileText, ShieldCheck } from 'lucide-react';

const DiasporaRegistrationForm = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        currentCountry: '',
        city: '',
        phone: '',
        email: '',
        contactType: { whatsapp: false, telegram: false },
        contactValues: { whatsapp: '', telegram: '' },
        canSendMedicine: false,
        canBuyMedicine: false,
        canShipParcels: false,
        canProvideFunding: false,
        canCoordinate: false,
        financialAbility: 'cannot_pay' as 'can_pay' | 'cannot_pay' | 'partially',
        maxAmount: '',
        extraNotes: '',
        notifyUrgent: false,
        notifyFunding: false,
        notifyImport: false,
        agreedToTerms: false
    });

    const validate = () => {
        if (!formData.fullName || !formData.currentCountry || !formData.city) {
            toast({ title: t('order.validation.error'), description: t('order.validation.name_required'), variant: 'destructive' });
            return false;
        }

        if (!formData.phone.trim()) {
            toast({ title: t('order.validation.error'), description: "Numéro de téléphone requis", variant: 'destructive' });
            return false;
        }

        if (formData.contactType.whatsapp && !formData.contactValues.whatsapp) {
            toast({ title: t('order.validation.error'), description: "Numéro WhatsApp requis", variant: 'destructive' });
            return false;
        }
        if (formData.contactType.telegram && !formData.contactValues.telegram) {
            toast({ title: t('order.validation.error'), description: "Nom d'utilisateur Telegram requis", variant: 'destructive' });
            return false;
        }

        if (!formData.canSendMedicine && !formData.canBuyMedicine && !formData.canShipParcels && !formData.canProvideFunding && !formData.canCoordinate) {
            toast({ title: t('order.validation.error'), description: t('order.validation.name_required'), variant: 'destructive' });
            return false;
        }
        if (!formData.agreedToTerms) {
            toast({ title: t('order.validation.error'), description: t('order.validation.name_required'), variant: 'destructive' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const contactTypes = ["phone"];
            const contactDetails = [`Phone: ${formData.phone}`];

            if (formData.contactType.whatsapp) {
                contactTypes.push("whatsapp");
                contactDetails.push(`WhatsApp: ${formData.contactValues.whatsapp.trim()}`);
            }
            if (formData.contactType.telegram) {
                contactTypes.push("telegram");
                contactDetails.push(`Telegram: ${formData.contactValues.telegram.trim()}`);
            }

            const { error: insertError } = await supabase
                .from('diaspora_volunteers')
                .insert({
                    full_name: formData.fullName,
                    current_country: formData.currentCountry,
                    city: formData.city,
                    email: formData.email,
                    contact_type: contactTypes.join(", "),
                    contact_value: contactDetails.join(" | "),
                    can_send_medicine: formData.canSendMedicine,
                    can_buy_medicine: formData.canBuyMedicine,
                    can_ship_parcels: formData.canShipParcels,
                    can_provide_financial_support: formData.canProvideFunding,
                    can_coordinate: formData.canCoordinate,
                    financial_ability: formData.financialAbility,
                    max_amount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
                    extra_notes: formData.extraNotes,
                    notify_urgent_cases: formData.notifyUrgent,
                    notify_funding_needed: formData.notifyFunding,
                    notify_import_requests: formData.notifyImport,
                    agreed_to_terms: formData.agreedToTerms
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                toast({ title: t('order.error.title'), description: t('order.error.generic'), variant: 'destructive' });
                setLoading(false);
                return;
            }

            toast({ title: t('alkhayr.diaspora.success.title'), description: t('alkhayr.diaspora.success.desc') });
            setFormData({
                fullName: '', currentCountry: '', city: '',
                phone: '',
                contactType: { whatsapp: false, telegram: false },
                contactValues: { whatsapp: '', telegram: '' },
                canSendMedicine: false, canBuyMedicine: false, canShipParcels: false, canProvideFunding: false, canCoordinate: false, financialAbility: 'cannot_pay', maxAmount: '', extraNotes: '', notifyUrgent: false, notifyFunding: false, notifyImport: false, agreedToTerms: false
            });
        } catch (error) {
            console.error('Error:', error);
            toast({ title: t('order.error.title'), description: t('order.error.generic'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold charity-text-gradient mb-2">{t('alkhayr.diaspora.title')}</h1>
                <p className="text-muted-foreground">{t('alkhayr.diaspora.subtitle')}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left - Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Personal Info */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <User className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.diaspora.form.personalInfo')}</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-xs font-medium">{t('alkhayr.diaspora.form.fullName')} *</Label>
                                        <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-10" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currentCountry" className="text-xs font-medium">{t('alkhayr.diaspora.form.country')} *</Label>
                                        <Input id="currentCountry" value={formData.currentCountry} onChange={(e) => setFormData({ ...formData, currentCountry: e.target.value })} className="h-10" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-xs font-medium">{t('alkhayr.diaspora.form.city')} *</Label>
                                        <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-10" required />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-xs font-medium">Numéro de téléphone *</Label>
                                            <Input
                                                id="phone"
                                                placeholder="Ex: 0550123456"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-10"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-medium">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Ex: email@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="h-10"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs font-medium">Autres moyens de contact (Optionnel)</Label>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {/* WhatsApp */}
                                                <div className={`p-3 rounded-lg border-2 transition-all ${formData.contactType.whatsapp ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Checkbox
                                                            id="contact_whatsapp"
                                                            checked={formData.contactType.whatsapp}
                                                            onCheckedChange={(checked) => setFormData(prev => ({
                                                                ...prev,
                                                                contactType: { ...prev.contactType, whatsapp: checked as boolean }
                                                            }))}
                                                        />
                                                        <Label htmlFor="contact_whatsapp" className="cursor-pointer font-semibold flex items-center gap-2">
                                                            WhatsApp
                                                        </Label>
                                                    </div>
                                                    {formData.contactType.whatsapp && (
                                                        <Input
                                                            placeholder={t('order.personal.contact_ph_whatsapp')}
                                                            value={formData.contactValues.whatsapp}
                                                            onChange={(e) => setFormData(prev => ({
                                                                ...prev,
                                                                contactValues: { ...prev.contactValues, whatsapp: e.target.value }
                                                            }))}
                                                            className="h-9 bg-white"
                                                        />
                                                    )}
                                                </div>

                                                {/* Telegram */}
                                                <div className={`p-3 rounded-lg border-2 transition-all ${formData.contactType.telegram ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Checkbox
                                                            id="contact_telegram"
                                                            checked={formData.contactType.telegram}
                                                            onCheckedChange={(checked) => setFormData(prev => ({
                                                                ...prev,
                                                                contactType: { ...prev.contactType, telegram: checked as boolean }
                                                            }))}
                                                        />
                                                        <Label htmlFor="contact_telegram" className="cursor-pointer font-semibold flex items-center gap-2">
                                                            Telegram
                                                        </Label>
                                                    </div>
                                                    {formData.contactType.telegram && (
                                                        <Input
                                                            placeholder={t('order.personal.contact_ph_telegram')}
                                                            value={formData.contactValues.telegram}
                                                            onChange={(e) => setFormData(prev => ({
                                                                ...prev,
                                                                contactValues: { ...prev.contactValues, telegram: e.target.value }
                                                            }))}
                                                            className="h-9 bg-white"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Capabilities */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <CheckSquare className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.diaspora.form.canOffer')} *</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="canSendMedicine" checked={formData.canSendMedicine} onCheckedChange={(c) => setFormData({ ...formData, canSendMedicine: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.sendMedicine')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="canBuyMedicine" checked={formData.canBuyMedicine} onCheckedChange={(c) => setFormData({ ...formData, canBuyMedicine: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.buyMedicine')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="canShipParcels" checked={formData.canShipParcels} onCheckedChange={(c) => setFormData({ ...formData, canShipParcels: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.shipParcels')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="canProvideFunding" checked={formData.canProvideFunding} onCheckedChange={(c) => setFormData({ ...formData, canProvideFunding: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.financialSupport')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="canCoordinate" checked={formData.canCoordinate} onCheckedChange={(c) => setFormData({ ...formData, canCoordinate: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.coordination')}</span>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Ability */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <Wallet className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.diaspora.form.financialAbility')} *</h3>
                                </div>
                                <Select value={formData.financialAbility} onValueChange={(v: 'can_pay' | 'cannot_pay' | 'partially') => setFormData({ ...formData, financialAbility: v })}>
                                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="can_pay">{t('alkhayr.diaspora.form.canFullyCover')}</SelectItem>
                                        <SelectItem value="cannot_pay">{t('alkhayr.diaspora.form.cannotCover')}</SelectItem>
                                        <SelectItem value="partially">{t('alkhayr.diaspora.form.canPartiallyCover')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formData.financialAbility !== 'cannot_pay' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="maxAmount" className="text-xs font-medium">{t('alkhayr.diaspora.form.maxAmount')}</Label>
                                        <Input id="maxAmount" type="number" step="0.01" value={formData.maxAmount} onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })} className="h-10" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Extra Notes */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <FileText className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.diaspora.form.extraNotes')}</h3>
                                </div>
                                <Textarea id="extraNotes" placeholder={t('alkhayr.diaspora.form.extraNotesPlaceholder')} value={formData.extraNotes} onChange={(e) => setFormData({ ...formData, extraNotes: e.target.value })} rows={3} className="resize-none" />
                            </CardContent>
                        </Card>

                        {/* Notifications */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <Bell className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.diaspora.form.notifications')}</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="notifyUrgent" checked={formData.notifyUrgent} onCheckedChange={(c) => setFormData({ ...formData, notifyUrgent: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.urgentCases')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="notifyFunding" checked={formData.notifyFunding} onCheckedChange={(c) => setFormData({ ...formData, notifyFunding: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.fundingNeeded')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                        <Checkbox id="notifyImport" checked={formData.notifyImport} onCheckedChange={(c) => setFormData({ ...formData, notifyImport: c as boolean })} />
                                        <span>{t('alkhayr.diaspora.form.importRequests')}</span>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms & Submit */}
                        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
                            <CardContent className="p-5 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.diaspora.form.agree')}</h3>
                                </div>
                                <label className="flex items-start gap-3 text-xs leading-relaxed">
                                    <Checkbox id="agreedToTerms" checked={formData.agreedToTerms} onCheckedChange={(c) => setFormData({ ...formData, agreedToTerms: c as boolean })} required />
                                    <span>{t('alkhayr.diaspora.form.agree')} *</span>
                                </label>
                                <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shadow-md">
                                    {loading ? t('alkhayr.diaspora.form.submitting') : t('alkhayr.diaspora.form.submit')}
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
                            <p className="font-medium">{t('alkhayr.diaspora.subtitle')}</p>
                            <p className="text-xs text-foreground/70">ℹ️ Votre inscription sera examinée avant approbation.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DiasporaRegistrationForm;
