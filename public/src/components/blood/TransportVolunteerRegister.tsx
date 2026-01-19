import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Car, CheckCircle, MessageCircle, Send } from 'lucide-react';

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

const TransportVolunteerRegister = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        wilaya: '',
        city: '',
        whatsapp_enabled: false,
        whatsapp: '',
        telegram_enabled: false,
        telegram: '',
        additional_info: '',
        consent_transport: false,
        consent_contact: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.consent_transport || !formData.consent_contact) {
            toast({ title: t('blood.transport.register.error_title'), description: t('blood.transport.register.error_consent'), variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('transport_volunteers').insert({
                full_name: formData.full_name,
                email: formData.email || null, // Add email here
                phone_number: formData.phone_number,
                wilaya: formData.wilaya,
                city: formData.city,
                whatsapp: formData.whatsapp_enabled ? formData.whatsapp : null,
                telegram: formData.telegram_enabled ? formData.telegram : null,
                additional_info: formData.additional_info,
                is_available: true,
                status: 'pending'
            });

            if (error) throw error;

            // Direct Invocation (Bypass DB Trigger for reliability)
            console.log("Invoking send-email directly...");
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
                body: {
                    type: 'transport_volunteer',
                    record: {
                        ...formData,
                        id: 'new', // We don't have the ID, but that's fine for the email template
                    }
                }
            });

            if (emailError) {
                console.error("Email Invocation Error:", emailError);
                toast({ title: "Email Error", description: "Failed to send notification: " + emailError.message, variant: "destructive" });
            } else {
                console.log("Email Sent:", emailData);
            }



            toast({ title: t('blood.transport.register.success_title'), description: t('blood.transport.register.success_desc') });
            // Reset form
            setFormData({
                full_name: '',
                email: '', // Reset email to fix type error
                phone_number: '',
                wilaya: '',
                city: '',
                whatsapp_enabled: false,
                whatsapp: '',
                telegram_enabled: false,
                telegram: '',
                additional_info: '',
                consent_transport: false,
                consent_contact: false
            });

        } catch (error: any) {
            console.error(error);
            toast({ title: t('blood.transport.register.error_title'), description: t('blood.transport.register.error_desc'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-t-4 border-t-[#E53935] shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-[#B71C1C]">
                    <Car className="w-6 h-6" />
                    {t('blood.transport.register.title')}
                </CardTitle>
                <p className="text-gray-500 text-sm">
                    {t('blood.transport.register.subtitle')}
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Personal Info */}
                    <div className="space-y-2">
                        <Label>{t('blood.transport.register.full_name')}</Label>
                        <Input
                            required
                            placeholder={t('blood.transport.register.full_name')}
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            className="focus-visible:ring-red-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="focus-visible:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('blood.transport.register.wilaya')}</Label>
                            <Select required value={formData.wilaya} onValueChange={v => setFormData({ ...formData, wilaya: v })}>
                                <SelectTrigger className="focus:ring-red-500"><SelectValue placeholder={t('blood.transport.register.wilaya')} /></SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {ALGERIAN_WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('blood.transport.register.city')}</Label>
                            <Input
                                required
                                placeholder={t('blood.transport.register.city')}
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <Label>{t('blood.transport.register.phone')}</Label>
                        <Input
                            required
                            type="tel"
                            placeholder="055..."
                            value={formData.phone_number}
                            onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                            className="focus-visible:ring-red-500"
                        />
                    </div>

                    <div className="space-y-2 bg-red-50/50 p-3 rounded border border-red-100">
                        <Label className="block mb-2 text-gray-700">{t('blood.transport.register.other_contacts')}</Label>

                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                                id="whatsapp"
                                checked={formData.whatsapp_enabled}
                                onCheckedChange={(c) => setFormData({ ...formData, whatsapp_enabled: !!c })}
                                className="text-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
                                <MessageCircle className="w-4 h-4 text-green-600" /> {t('blood.transport.register.whatsapp')}
                            </label>
                        </div>
                        {formData.whatsapp_enabled && (
                            <Input
                                placeholder={t('blood.transport.register.whatsapp')}
                                value={formData.whatsapp}
                                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="mb-3 focus-visible:ring-red-500"
                            />
                        )}

                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                                id="telegram"
                                checked={formData.telegram_enabled}
                                onCheckedChange={(c) => setFormData({ ...formData, telegram_enabled: !!c })}
                                className="text-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <label htmlFor="telegram" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
                                <Send className="w-4 h-4 text-blue-500" /> {t('blood.transport.register.telegram')}
                            </label>
                        </div>
                        {formData.telegram_enabled && (
                            <Input
                                placeholder={t('blood.transport.register.telegram')}
                                value={formData.telegram}
                                onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                                className="focus-visible:ring-red-500"
                            />
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                        <Label>{t('blood.transport.register.additional_info')}</Label>
                        <Textarea
                            placeholder={t('blood.transport.register.additional_placeholder')}
                            value={formData.additional_info}
                            onChange={e => setFormData({ ...formData, additional_info: e.target.value })}
                            className="h-20 focus-visible:ring-red-500"
                        />
                        <p className="text-xs text-gray-500">{t('blood.transport.register.visible_admin')}</p>
                    </div>

                    {/* Consents */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="consent1"
                                required
                                checked={formData.consent_transport}
                                onCheckedChange={(c) => setFormData({ ...formData, consent_transport: !!c })}
                                className="text-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <label htmlFor="consent1" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                dangerouslySetInnerHTML={{ __html: t('blood.transport.register.consent_transport') }}
                            />
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="consent2"
                                required
                                checked={formData.consent_contact}
                                onCheckedChange={(c) => setFormData({ ...formData, consent_contact: !!c })}
                                className="text-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <label htmlFor="consent2" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('blood.transport.register.consent_contact')}
                            </label>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-[#E53935] hover:bg-[#C62828] text-white">
                        {loading ? t('blood.transport.register.btn_submitting') : t('blood.transport.register.btn_submit')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default TransportVolunteerRegister;
